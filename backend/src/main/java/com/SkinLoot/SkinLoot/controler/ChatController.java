package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.ChatMessageRequest;
import com.SkinLoot.SkinLoot.dto.ChatMessageResponse;
import com.SkinLoot.SkinLoot.model.ChatMessage;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.ChatMessageRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.SkinLoot.SkinLoot.util.JwtTokenUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
// IMPORTAÇÕES NOVAS
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
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

    // (O JwtTokenUtil não é mais necessário para o @MessageMapping,
    // mas ainda é usado pelo @GetMapping, então o mantemos)
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * ✅ MUDANÇA 3: Endpoint de WebSocket (STOMP) para ENVIAR mensagens.
     * O frontend enviará para "/app/chat/enviar"
     *
     * @param request O payload da mensagem (JSON)
     * @param principal O usuário autenticado (injetado pelo Spring Security)
     */
    @MessageMapping("/chat/enviar")
    public void enviarMensagem(@Payload ChatMessageRequest request, Principal principal) {

        // Pega o remetente (usuário logado)
        String username = principal.getName();
        Usuario remetente = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado."));

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
                remetente.getId(), // <-- Adicionado ID do remetente
                destinatario.getId()
        );

        // ✅ MUDANÇA 4: Envia a mensagem em tempo real para o destinatário
        // Ele se inscreveu em "/user/queue/mensagens"
        messagingTemplate.convertAndSendToUser(
                destinatario.getEmail(),      // O email (username) do destinatário
                "/queue/mensagens",         // O tópico privado
                responseDto                 // O payload (a mensagem)
        );

        // ✅ MUDANÇA 5: (Opcional) Envia a mensagem de volta para o remetente
        // Isso permite que o remetente veja sua própria mensagem aparecer em outros dispositivos
        messagingTemplate.convertAndSendToUser(
                remetente.getEmail(),
                "/queue/mensagens",
                responseDto
        );
    }

    @GetMapping("/minhas-conversas")
    @ResponseBody // Necessário porque a classe é @Controller, não @RestController
    public List<ChatMessageResponse> buscarMinhasConversas(HttpServletRequest servletRequest) {

        // 1. Autentica o usuário (mesma lógica do seu outro endpoint GET)
        String token = jwtTokenUtil.resolveToken(servletRequest);
        String username = jwtTokenUtil.getUsernameFromToken(token);
        Usuario usuarioLogado = usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado."));

        // 2. Chama o novo método do repositório
        List<ChatMessage> ultimasMensagens = chatRepository.findLatestMessagePerConversation(usuarioLogado.getId());

        // 3. Mapeia as entidades para DTOs (mesma lógica do seu outro endpoint GET)
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
