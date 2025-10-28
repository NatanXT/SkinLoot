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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST responsável pelo gerenciamento de anúncios.
 */
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
    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()") // Apenas usuários autenticados podem criar anúncios
    public ResponseEntity<AnuncioResponse> criarJson(
            @RequestBody AnuncioRequest req,
            Authentication authentication) {

        Usuario usuario = getUsuarioAutenticado(authentication);
        Anuncio salvo = anuncioService.criarAnuncio(req, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(salvo));
    }

    // ===================== ATUALIZAR =====================

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnuncioResponse> atualizarJson(
            @PathVariable UUID id,
            @RequestBody AnuncioRequest req,
            Authentication authentication) {

        Usuario usuario = getUsuarioAutenticado(authentication);
        Anuncio atualizado = anuncioService.atualizar(id, req, usuario);
        return ResponseEntity.ok(toDto(atualizado));
    }

    // ===================== LISTAGENS =====================
    @GetMapping
    public ResponseEntity<List<AnuncioResponse>> listarAnuncios() {
        List<AnuncioResponse> dtos = anuncioService.findAll()
                .stream()
                .map(this::toDto) // Usando o toDto unificado
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AnuncioResponse>> listarAnunciosDoUsuario(Authentication authentication) {
        Usuario usuario = getUsuarioAutenticado(authentication);
        // 1. Busque as entidades
        List<Anuncio> anuncios = anuncioService.listarPorUsuario(usuario.getId());
        // 2. Converta usando o toDto (que tem a lógica do plano)
        List<AnuncioResponse> dtos = anuncios.stream()
                .map(this::toDto) // <-- USE O toDto
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ===================== LIKES =====================
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> likeAnuncio(@PathVariable UUID id, Authentication authentication) {
        String userEmail = authentication.getName();
        anuncioService.likeAnuncio(id, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/unlike")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> unlikeAnuncio(@PathVariable UUID id, Authentication authentication) {
        String userEmail = authentication.getName();
        anuncioService.unlikeAnuncio(id, userEmail);
        return ResponseEntity.noContent().build();
    }

    // ===================== STATUS (AÇÕES DO DONO DO ANÚNCIO) =====================

    @PatchMapping("/{id}/desativar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> desativar(@PathVariable UUID id, Authentication auth) {
        String email = auth.getName();
        anuncioService.alterarStatus(id, email, Status.INATIVO);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/reativar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> reativar(@PathVariable UUID id, Authentication auth) {
        String email = auth.getName();
        anuncioService.alterarStatus(id, email, Status.ATIVO);
        return ResponseEntity.ok().build();
    }

    // ===================== BUSCAR POR ID =====================
    @GetMapping("/{id}")
    public ResponseEntity<AnuncioResponse> buscarPorId(@PathVariable UUID id) {
        return anuncioService.findById(id)
                .map(a -> ResponseEntity.ok(toDto(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ===================== MÉTODOS AUXILIARES PRIVADOS =====================

    /**
     * Converte uma entidade Anuncio para um DTO AnuncioResponse.
     * Este método unificado agora contém todos os campos necessários.
     */
    private AnuncioResponse toDto(Anuncio a) {
        AnuncioResponse dto = new AnuncioResponse();
        dto.setId(a.getId());
        dto.setTitulo(a.getTitulo());
        dto.setDescricao(a.getDescricao());
        dto.setPreco(a.getPreco());
        dto.setStatus(a.getStatus());
        dto.setDataCriacao(a.getDataCriacao());

        // Campos desnormalizados da Skin
        dto.setSkinNome(a.getSkinName());
        dto.setSkinIcon(a.getSkinImageUrl());

        // --- INÍCIO DA CORREÇÃO ---
        // Verifica se a URL existe (armazenamento externo)
        if (a.getSkinImageUrl() != null) {
            dto.setSkinIcon(a.getSkinImageUrl());
        }
        // Se não houver URL, verifica se há Base64 (armazenamento interno)
        else if (a.getSkinImageBase64() != null && a.getSkinImageMime() != null) {
            // Reconstrói a string dataURL para o frontend
            dto.setSkinIcon("data:" + a.getSkinImageMime() + ";base64," + a.getSkinImageBase64());
        }
        // Caso contrário, é nulo
        else {
            dto.setSkinIcon(null);
        }

        // Relacionamento com a Skin (catálogo)
        if (a.getSkin() != null) {
            dto.setSkinId(a.getSkin().getId());
        }

        // Relacionamento com o Usuário
        if (a.getUsuario() != null) {
            dto.setUsuarioNome(a.getUsuario().getNome());
            dto.setUsuarioId(a.getUsuario().getId());
            if (a.getUsuario().getPlanoAssinatura() != null) {
                // Pega o enum (ex: TipoPlano.PLUS) e converte para string (ex: "plus")
                String planoNome = a.getUsuario().getPlanoAssinatura().getNome().name().toLowerCase();
                dto.setPlanoNome(planoNome); // Assumindo que seu AnuncioResponse DTO tem 'setPlanoNome'
            }
        }

        // Campos calculados
        dto.setLikesCount(a.getLikesCount());

        // Detalhes específicos do anúncio (float, pattern, etc.)
        dto.setDetalhesEspecificos(a.getDetalhesEspecificos());

        return dto;
    }

    /**
     * Busca o usuário autenticado a partir do objeto Authentication.
     */
    private Usuario getUsuarioAutenticado(Authentication authentication) {
        String email = authentication.getName();
        return usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));
    }
}
