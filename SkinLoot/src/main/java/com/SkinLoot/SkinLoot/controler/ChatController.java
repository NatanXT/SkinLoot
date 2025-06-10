package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.ConversaResumoResponse;
import com.SkinLoot.SkinLoot.dto.MensagemRequest;
import com.SkinLoot.SkinLoot.dto.MensagemResponse;
import com.SkinLoot.SkinLoot.model.Mensagem;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.MensagemRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private MensagemRepository mensagemRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    @PostMapping
    public ResponseEntity<MensagemResponse> enviar(@RequestBody MensagemRequest req, @AuthenticationPrincipal UserDetails userDetails) {
        Usuario remetente = usuarioRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Usuario destinatario = usuarioRepo.findById(req.getDestinatarioId())
                .orElseThrow(() -> new RuntimeException("Destinatário não encontrado"));

        Mensagem m = new Mensagem();
        m.setRemetente(remetente);
        m.setDestinatario(destinatario);
        m.setConteudo(req.getConteudo());
        m.setDataHora(LocalDateTime.now());

        mensagemRepo.save(m);

        MensagemResponse resp = new MensagemResponse();
        resp.setId(m.getId());
        resp.setConteudo(m.getConteudo());
        resp.setDataHora(m.getDataHora());
        resp.setRemetenteNome(remetente.getNome());
        resp.setDestinatarioNome(destinatario.getNome());

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<MensagemResponse>> buscarConversas(@PathVariable UUID userId, @AuthenticationPrincipal UserDetails userDetails) {
        Usuario atual = usuarioRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Usuario outro = usuarioRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Mensagem> mensagens = mensagemRepo.findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByDataHoraAsc(
                atual, outro, atual, outro
        );

        List<MensagemResponse> dtos = mensagens.stream().map(m -> {
            MensagemResponse dto = new MensagemResponse();
            dto.setId(m.getId());
            dto.setConteudo(m.getConteudo());
            dto.setDataHora(m.getDataHora());
            dto.setRemetenteNome(m.getRemetente().getNome());
            dto.setDestinatarioNome(m.getDestinatario().getNome());
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/recentes")
    public ResponseEntity<List<ConversaResumoResponse>> listarConversasRecentes(@AuthenticationPrincipal UserDetails userDetails) {
    Usuario usuarioAtual = usuarioRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    List<Mensagem> todas = mensagemRepo.findAll(); // 🚨 se for grande, usar query filtrada

    // Mapeia (usuário outro) -> lista de mensagens
    Map<UUID, List<Mensagem>> porUsuario = new HashMap<>();

    for (Mensagem m : todas) {
        Usuario outro = null;

        if (m.getRemetente().getId().equals(usuarioAtual.getId())) {
            outro = m.getDestinatario();
        } else if (m.getDestinatario().getId().equals(usuarioAtual.getId())) {
            outro = m.getRemetente();
        }

        if (outro != null) {
            porUsuario.computeIfAbsent(outro.getId(), k -> new ArrayList<>()).add(m);
        }
    }

    List<ConversaResumoResponse> resumos = new ArrayList<>();

    for (Map.Entry<UUID, List<Mensagem>> entry : porUsuario.entrySet()) {
        List<Mensagem> mensagens = entry.getValue();
        mensagens.sort(Comparator.comparing(Mensagem::getDataHora).reversed()); // mais recente primeiro

        Mensagem ultima = mensagens.get(0);
        Usuario outro = ultima.getRemetente().getId().equals(usuarioAtual.getId())
                ? ultima.getDestinatario()
                : ultima.getRemetente();

        boolean temNaoLidas = mensagens.stream()
                .anyMatch(m -> !m.isLida() && m.getDestinatario().getId().equals(usuarioAtual.getId()));

        ConversaResumoResponse dto = new ConversaResumoResponse();
        dto.setUsuarioId(outro.getId());
        dto.setNome(outro.getNome());
        dto.setEmail(outro.getEmail());
        dto.setUltimaMensagem(ultima.getConteudo());
        dto.setDataHora(ultima.getDataHora());
        dto.setPossuiNaoLidas(temNaoLidas);

        resumos.add(dto);
    }

    resumos.sort(Comparator.comparing(ConversaResumoResponse::getDataHora).reversed());
    return ResponseEntity.ok(resumos);
}

}
