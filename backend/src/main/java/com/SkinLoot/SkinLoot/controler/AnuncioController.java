package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.AnuncioRequest;
import com.SkinLoot.SkinLoot.dto.AnuncioResponse;
import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Status;
import com.SkinLoot.SkinLoot.service.AnuncioService;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/anuncios")
public class AnuncioController {

    private final AnuncioService anuncioService;
    private final UsuarioService usuarioService;

    public AnuncioController(AnuncioService anuncioService, UsuarioService usuarioService) {
        this.anuncioService = anuncioService;
        this.usuarioService = usuarioService;
    }

    // ===================== CRIAR =====================

    // JSON puro
    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AnuncioResponse> criarJson(
            @RequestBody AnuncioRequest req,
            Authentication authentication) {

        String email = authentication.getName();
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));

        Anuncio salvo = anuncioService.criarAnuncio(req, usuario);
        return ResponseEntity.ok(toDto(salvo));
    }

    // multipart (json + arquivo)
    @PostMapping(value = "/save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnuncioResponse> criarMultipart(
            @RequestPart("json") AnuncioRequest req,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem,
            Authentication authentication) {

        String email = authentication.getName();
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));

        // TODO: salvar imagem e setar URL se for usar storage futuramente
        Anuncio salvo = anuncioService.criarAnuncio(req, usuario);
        return ResponseEntity.ok(toDto(salvo));
    }

    // ===================== ATUALIZAR =====================

    // JSON puro
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<AnuncioResponse> atualizarJson(
            @PathVariable UUID id,
            @RequestBody AnuncioRequest req,
            Authentication authentication) {

        String email = authentication.getName();
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));

        Anuncio atualizado = anuncioService.atualizar(id, req, usuario);
        return ResponseEntity.ok(toDto(atualizado));
    }

    // multipart (json + arquivo)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnuncioResponse> atualizarMultipart(
            @PathVariable UUID id,
            @RequestPart("json") AnuncioRequest req,
            @RequestPart(value = "imagem", required = false) MultipartFile imagem,
            Authentication authentication) {

        String email = authentication.getName();
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));

        // TODO: salvar imagem e setar URL se for usar storage futuramente
        Anuncio atualizado = anuncioService.atualizar(id, req, usuario);
        return ResponseEntity.ok(toDto(atualizado));
    }

    // ===================== LISTAGENS =====================

    @GetMapping
    public ResponseEntity<List<AnuncioResponse>> listarAnuncios() {
        List<AnuncioResponse> dtos = anuncioService.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user")
    public ResponseEntity<List<AnuncioResponse>> listarAnunciosByUsuario(Authentication authentication) {
        String email = authentication.getName();
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));
        List<AnuncioResponse> anunciosDoUsuario = anuncioService.listarPorUsuario(usuario.getId());
        return ResponseEntity.ok(anunciosDoUsuario);
    }

    // ===================== LIKES =====================

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeAnuncio(@PathVariable UUID id, Authentication authentication) {
        String userEmail = authentication.getName();
        anuncioService.likeAnuncio(id, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/unlike")
    public ResponseEntity<Void> unlikeAnuncio(@PathVariable UUID id, Authentication authentication) {
        String userEmail = authentication.getName();
        anuncioService.unlikeAnuncio(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    // ===================== STATUS =====================

    @PostMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable UUID id, Authentication auth) {
        String email = auth.getName();
        anuncioService.alterarStatus(id, email, Status.INATIVO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable UUID id, Authentication auth) {
        String email = auth.getName();
        anuncioService.alterarStatus(id, email, Status.ATIVO);
        return ResponseEntity.ok().build();
    }

    // --------- Mapper entidade -> DTO ---------
    private AnuncioResponse toDto(Anuncio a) {
        AnuncioResponse dto = new AnuncioResponse();
        dto.setId(a.getId());
        dto.setTitulo(a.getTitulo());
        dto.setDescricao(a.getDescricao());
        dto.setPreco(a.getPreco());
        dto.setStatus(a.getStatus());
        dto.setDataCriacao(a.getDataCriacao());

        // campos de skin usados no frontend
        dto.setSkinId(a.getSteamItemId());
        dto.setSkinIcon(a.getSkinImageUrl());
        dto.setSkinNome(a.getSkinName());

        // metadados
        dto.setUsuarioNome(a.getUsuario().getNome());
        dto.setQualidade(a.getQualidade());
        dto.setDesgasteFloat(a.getDesgasteFloat());
        dto.setLikesCount(a.getLikesCount());
        return dto;
    }
}
