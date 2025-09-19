//package com.SkinLoot.SkinLoot.controler;
//
//import com.SkinLoot.SkinLoot.dto.ChatMessageRequest;
//import com.SkinLoot.SkinLoot.dto.ChatMessageResponse;
//import com.SkinLoot.SkinLoot.model.ChatMessage;
//import com.SkinLoot.SkinLoot.model.Usuario;
//import com.SkinLoot.SkinLoot.repository.ChatMessageRepository;
//import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
//import com.SkinLoot.SkinLoot.util.JwtTokenUtil;
//
//import jakarta.servlet.http.HttpServletRequest;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.UUID; // Importe UUID
//import java.util.stream.Collectors;
//
//@RestController
//@RequestMapping("/api/chat")
//@RequiredArgsConstructor
//public class ChatController {
//
//    private final UsuarioRepository usuarioRepository;
//    private final ChatMessageRepository chatRepository;
//    private final JwtTokenUtil jwtTokenUtil;
//
//    @PostMapping("/enviar")
//    public ResponseEntity<?> enviar(@RequestBody ChatMessageRequest request, HttpServletRequest servletRequest) {
//        String token = jwtTokenUtil.resolveToken(servletRequest);
//        String username = jwtTokenUtil.getUsernameFromToken(token);
//        Usuario remetente = usuarioRepository.findByEmail(username)
//                .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado."));
//
//        // A busca agora usa o ID do tipo UUID vindo do request
//        Usuario destinatario = usuarioRepository.findById(request.getDestinatarioId()) // ✅ CORRIGIDO
//                .orElseThrow(() -> new RuntimeException("Usuário destinatário não encontrado."));
//
//        ChatMessage msg = new ChatMessage();
//        msg.setRemetente(remetente);
//        msg.setDestinatario(destinatario);
//        msg.setConteudo(request.getConteudo());
//        msg.setTimestamp(LocalDateTime.now());
//
//        chatRepository.save(msg);
//        return ResponseEntity.ok().build();
//    }
//
//    @GetMapping("/conversa/{destinatarioId}")
//    public List<ChatMessageResponse> buscarMensagens(@PathVariable UUID destinatarioId, HttpServletRequest servletRequest) { // ✅ CORRIGIDO
//        String token = jwtTokenUtil.resolveToken(servletRequest);
//        String username = jwtTokenUtil.getUsernameFromToken(token);
//        Usuario remetente = usuarioRepository.findByEmail(username)
//                .orElseThrow(() -> new RuntimeException("Usuário remetente não encontrado."));
//
//        // A busca agora usa o ID do tipo UUID vindo da URL
//        Usuario destinatario = usuarioRepository.findById(destinatarioId) // ✅ CORRIGIDO
//                .orElseThrow(() -> new RuntimeException("Usuário destinatário não encontrado."));
//
//        return chatRepository
//                .findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByTimestampAsc(
//                        remetente, destinatario, remetente, destinatario
//                ).stream()
//                .map(m -> {
//                    ChatMessageResponse res = new ChatMessageResponse();
//                    res.setId(m.getId());
//                    res.setConteudo(m.getConteudo());
//                    res.setTimestamp(m.getTimestamp());
//                    res.setRemetenteNome(m.getRemetente().getNome());
//                    res.setDestinatarioNome(m.getDestinatario().getNome());
//                    return res;
//                }).collect(Collectors.toList());
//    }
//}
