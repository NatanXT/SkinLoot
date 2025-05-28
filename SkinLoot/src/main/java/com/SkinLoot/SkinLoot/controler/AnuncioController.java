package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.AnuncioRequest;
import com.SkinLoot.SkinLoot.dto.AnuncioResponse;
import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.service.AnuncioService;
import com.SkinLoot.SkinLoot.service.SkinService;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/anuncios")
@CrossOrigin(origins = "*", allowCredentials = "true")
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
                a.getSkin().getNome()
        );
    }

    // Criar Anúncio usando DTO
    @PostMapping
    public ResponseEntity<AnuncioResponse> criarAnuncio(
            @RequestBody AnuncioRequest req,
            Authentication authentication
    ) {
        UserDetails ud = (UserDetails) authentication.getPrincipal();
        String email = ud.getUsername();

        Optional<Usuario> userOpt = usuarioService.buscarUsuarioPorEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        Optional<Skin> skinOpt = skinService.buscarPorId(req.getSkinId());
        if (skinOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Anuncio a = new Anuncio();
        a.setTitulo(req.getTitulo());
        a.setDescricao(req.getDescricao());
        a.setPreco(req.getPreco());
        a.setSkin(skinOpt.get());
        a.setUsuario(userOpt.get());

        Anuncio salvo = anuncioService.save(a);
        return ResponseEntity.ok(toDto(salvo));
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
