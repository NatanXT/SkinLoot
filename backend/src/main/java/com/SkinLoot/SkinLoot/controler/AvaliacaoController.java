package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.AvaliacaoRequest;
import com.SkinLoot.SkinLoot.dto.AvaliacaoResponse;
import com.SkinLoot.SkinLoot.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/avaliacoes")
public class AvaliacaoController{

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deixarAvaliacao(
            @Valid @RequestBody AvaliacaoRequest request,
            Principal principal) {

        // O 'principal' (usuário logado) é o avaliador
        avaliacaoService.criarAvaliacao(principal.getName(), request);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Endpoint PÚBLICO para listar todas as avaliações de um vendedor.
     * (Usado no perfil público do vendedor).
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AvaliacaoResponse>> getAvaliacoesDoUsuario(@PathVariable UUID usuarioId) {

        List<AvaliacaoResponse> avaliacoes = avaliacaoService.listarPorAvaliado(usuarioId);
        return ResponseEntity.ok(avaliacoes);
    }
}
