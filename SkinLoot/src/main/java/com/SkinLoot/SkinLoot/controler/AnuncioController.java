package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.AnuncioRequest;
import com.SkinLoot.SkinLoot.dto.AnuncioResponse;
import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Status;
import com.SkinLoot.SkinLoot.service.AnuncioService;
import com.SkinLoot.SkinLoot.service.SkinService;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/anuncios")
//@CrossOrigin(origins = "*", allowCredentials = "true")
public class AnuncioController {

    @Autowired
    private AnuncioService anuncioService;

    @Autowired
    private SkinService skinService;

    @Autowired
    private UsuarioService usuarioService;

    private AnuncioResponse toDto(Anuncio a) {
        return new AnuncioResponse(
                a.getId(),
                a.getTitulo(),
                a.getDescricao(),
                a.getPreco(),
                a.getSkin().getId(),
                a.getSkin().getIcon(),
                a.getSkin().getNome(),
                a.getStatus(),
                a.getDataCriacao(),
                a.getUsuario().getNome(),
                a.getSkin().getQualidade().name(),
                a.getSkin().getRaridade().name(),
                a.getSkin().getDesgastefloat()
        );
    }

    // Criar Anúncio usando DTO
    @PostMapping("/save")
    public ResponseEntity<AnuncioResponse> criarAnuncio(@RequestBody AnuncioRequest anuncioRequest, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        Optional<Usuario> usuarioOpt = usuarioService.buscarUsuarioPorEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Skin> skinOpt = skinService.buscarPorId(anuncioRequest.getSkinId());
        if (skinOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Anuncio anuncio = new Anuncio();
        anuncio.setTitulo(anuncioRequest.getTitulo());
        anuncio.setDescricao(anuncioRequest.getDescricao());
        anuncio.setPreco(anuncioRequest.getPreco());
        anuncio.setSkin(skinOpt.get());
        anuncio.setUsuario(usuarioOpt.get());

        // ✅ Sempre seta a data de criação
        anuncio.setDataCriacao(LocalDateTime.now());

        // ✅ Se o status for enviado, usa; senão, coloca padrão ATIVO
        if (anuncioRequest.getStatus() != null) {
            anuncio.setStatus(anuncioRequest.getStatus());
        } else {
            anuncio.setStatus(Status.ATIVO);
        }

        Anuncio savedAnuncio = anuncioService.save(anuncio);
        return ResponseEntity.ok(toDto(savedAnuncio));
    }


    @GetMapping
    public ResponseEntity<List<AnuncioResponse>> listarAnuncios() {
        List<AnuncioResponse> dtos = anuncioService.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnuncioResponse> buscarAnuncio(@PathVariable UUID id) {
        return anuncioService.findById(id)
                .map(a -> ResponseEntity.ok(toDto(a)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarAnuncio(@PathVariable UUID id) {
        if (anuncioService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        anuncioService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
