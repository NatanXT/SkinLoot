package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.service.SkinService;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/skins")
public class SkinController {

    @Autowired
    private SkinService skinService;

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/save")
    public ResponseEntity<Skin> criar(@RequestBody Skin skin, @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        skin.setUsuario(usuario);
        return ResponseEntity.ok(skinService.salvar(skin));
    }

    @GetMapping("/meus")
    public ResponseEntity<List<Skin>> minhasSkins(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return ResponseEntity.ok(skinService.listarPorUsuario(usuario.getId()));
    }

    @GetMapping("/jogo/{jogoId}")
    public ResponseEntity<List<Skin>> porJogo(@PathVariable UUID jogoId) {
        return ResponseEntity.ok(skinService.listarPorJogo(jogoId));
    }
}

