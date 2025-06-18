package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.SkinRequest;
import com.SkinLoot.SkinLoot.dto.SkinResponse;
import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.service.JogoService;
import com.SkinLoot.SkinLoot.service.SkinService;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    private final SkinService skinService;
    private final UsuarioService usuarioService;
    private final JogoService jogoService;

    @Autowired
    public SkinController(SkinService skinService, JogoService jogoService, UsuarioService usuarioService) {
        this.skinService = skinService;
        this.usuarioService = usuarioService;
        this.jogoService = jogoService;
    }

    @PostMapping("/save")
    public ResponseEntity<SkinResponse> criar(@RequestBody @Valid SkinRequest request,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Jogo jogo = jogoService.buscarPorId(request.getJogoId())
                .orElseThrow(() -> new RuntimeException("Jogo não encontrado"));

        Skin skin = new Skin();
        skin.setNome(request.getNome());
        skin.setDescricao(request.getDescricao());
        skin.setIcon(request.getIcon());
        skin.setRaridade(request.getRaridade());
        skin.setQualidade(request.getQualidade());
        skin.setAssetId(request.getAssetId());
        skin.setDesgasteFloat(request.getDesgastefloat());
        skin.setJogo(jogo);
        skin.setUsuario(usuario);

        // ✅ método do service deve retornar já o DTO
        return ResponseEntity.status(HttpStatus.CREATED).body(skinService.salvarERetornarDto(skin));
    }

    @GetMapping("/list")
    public ResponseEntity<List<SkinResponse>> minhasSkins(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return ResponseEntity.ok(skinService.listarPorUsuario(usuario.getId()));
    }

    @GetMapping("/jogo/{jogoId}")
    public ResponseEntity<List<SkinResponse>> porJogo(@PathVariable UUID jogoId) {
        return ResponseEntity.ok(skinService.listarPorJogo(jogoId));
    }

}

