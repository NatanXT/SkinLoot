package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.ChatMessageRequest;
import com.SkinLoot.SkinLoot.dto.ChatMessageResponse;
import com.SkinLoot.SkinLoot.model.ChatMessage;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.ChatMessageRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
//import com.SkinLoot.SkinLoot.util.JwtTokenUtil;

//import jakarta.servlet.http.HttpServletRequest;
import com.SkinLoot.SkinLoot.util.JwtTokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
// IMPORTAÇÕES NOVAS
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.security.core.Authentication;
// FIM IMPORTAÇÕES NOVAS
import org.springframework.stereotype.Controller; // MUDADO DE @RestController
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // Para pegar o usuário autenticado
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller // ✅ MUDANÇA 1: Precisa ser @Controller para lidar com WebSockets e REST
@RequestMapping("/api/chat") //
@RequiredArgsConstructor
public class ChatController {

    private final UsuarioRepository usuarioRepository;
    private final ChatMessageRepository chatRepository;

    // ✅ MUDANÇA 2: Injetar o "Carteiro" do WebSocket
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtTokenUtil jwtTokenUtil;

    // (O JwtTokenUtil não é mais necessário para o @MessageMapping,
    // mas ainda é usado pelo @GetMapping, então o mantemos)
    //private final JwtTokenUtil jwtTokenUtil;

    /**
     * ✅ MUDANÇA 3: Endpoint de WebSocket (STOMP) para ENVIAR mensagens.
     * O frontend enviará para "/app/chat/enviar"
     *
     * @param request O payload da mensagem (JSON)
     * @param principal O usuário autenticado (injetado pelo Spring Security)
     */
    @MessageMapping("/chat/enviar")
    public void enviarMensagem(@Payload ChatMessageRequest request, Principal principal) {
        System.out.println(">>> CHEGOU MENSAGEM NO CONTROLLER!");
        System.out.println("Conteúdo: " + request.getConteudo());
        System.out.println("Remetente ID (Payload): " + request.getRemetenteId());
        // ----------------------------------------

        Usuario remetente = null;

        // 1. Tenta pegar pela autenticação do WebSocket (Cenário Ideal)
        if (principal != null) {
            String username = principal.getName();
            remetente = usuarioRepository.findByEmail(username).orElse(null);
        }

        // 2. Se falhou (principal nulo), tenta pegar pelo ID enviado no corpo (Fallback)
        if (remetente == null && request.getRemetenteId() != null) {
            remetente = usuarioRepository.findById(request.getRemetenteId()).orElse(null);
        }

        // 3. Se ainda assim não achou ninguém, lança erro
        if (remetente == null) {
            throw new RuntimeException("Remetente não identificado. Logue novamente.");
        }

        // --- DAQUI PARA BAIXO SEGUE IGUAL AO SEU CÓDIGO ANTERIOR ---

        // Pega o destinatário
        Usuario destinatario = usuarioRepository.findById(request.getDestinatarioId())
                .orElseThrow(() -> new RuntimeException("Usuário destinatário não encontrado."));

        // Salva a mensagem no banco de dados (igual antes)
        ChatMessage msg = new ChatMessage();
        msg.setRemetente(remetente);
        msg.setDestinatario(destinatario);
        msg.setConteudo(request.getConteudo());
        msg.setTimestamp(LocalDateTime.now());
        ChatMessage msgSalva = chatRepository.save(msg);

        // Constrói a resposta (DTO)
        ChatMessageResponse responseDto = new ChatMessageResponse(
                msgSalva.getId(),
                msgSalva.getConteudo(),
                msgSalva.getTimestamp(),
                remetente.getNome(),
                destinatario.getNome(),
                remetente.getId(),
                destinatario.getId()
        );

        // ✅ MUDANÇA 4: Envia a mensagem em tempo real para o destinatário
        // Ele se inscreveu em "/user/queue/mensagens"
        messagingTemplate.convertAndSend(
                "/topic/user/" + destinatario.getId(),
                responseDto
        );

        // 2. Envia para o canal do Remetente (para aparecer na sua tela também)
        messagingTemplate.convertAndSend(
                "/topic/user/" + remetente.getId(),
                responseDto
        );
    }

    @GetMapping("/minhas-conversas")
    @ResponseBody
    public List<ChatMessageResponse> buscarMinhasConversas(Principal principal) { // <-- MUDANÇA AQUI

        // 1. Autentica o usuário (NÃO precisa mais do jwtTokenUtil)
        String username = principal.getName(); // <-- MUDANÇA AQUI
        Usuario usuarioLogado = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado."));

        // 2. Chama o novo método do repositório
        List<ChatMessage> ultimasMensagens = chatRepository.findLatestMessagePerConversation(usuarioLogado.getId());

        // 3. Mapeia para DTOs
        return ultimasMensagens.stream()
                .map(m -> new ChatMessageResponse(
                        m.getId(),
                        m.getConteudo(),
                        m.getTimestamp(),
                        m.getRemetente().getNome(),
                        m.getDestinatario().getNome(),
                        m.getRemetente().getId(),
                        m.getDestinatario().getId()
                )).collect(Collectors.toList());
    }
    /**
     * ✅ MANTIDO: Endpoint REST para carregar o HISTÓRICO da conversa.
     * O frontend chamará este endpoint UMA VEZ ao abrir a janela de chat.
     */
    @GetMapping("/conversa/{destinatarioId}")
    @ResponseBody // Necessário porque a classe é @Controller, não @RestController
    public List<ChatMessageResponse> buscarMensagens(
            @PathVariable UUID destinatarioId,
            Principal principal
    ) {
        // Pega o utilizador logado diretamente do 'Principal'
        String username = principal.getName();
        Usuario remetente = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Utilizador remetente não encontrado."));

        Usuario destinatario = usuarioRepository.findById(destinatarioId)
                .orElseThrow(() -> new RuntimeException("Utilizador destinatário não encontrado."));

        // A lógica de busca no repositório está perfeita
        return chatRepository.findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByTimestampAsc(remetente, destinatario, remetente, destinatario).stream()
                .map(m -> new ChatMessageResponse( // Simplificado o DTO
                        m.getId(),
                        m.getConteudo(),
                        m.getTimestamp(),
                        m.getRemetente().getNome(),
                        m.getDestinatario().getNome(),
                        m.getRemetente().getId(),
                        m.getDestinatario().getId()
                )).collect(Collectors.toList());
    }


}
