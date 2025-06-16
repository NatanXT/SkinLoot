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

    private final AnuncioService anuncioService;
    private final UsuarioService usuarioService;

    // Injeção de dependências via construtor (melhor prática)
    public AnuncioController(AnuncioService anuncioService, UsuarioService usuarioService) {
        this.anuncioService = anuncioService;
        this.usuarioService = usuarioService;
    }

    // O método de criar anúncio agora recebe o ID do item da Steam pela URL
    @PostMapping("/criar/{itemId}")
    public ResponseEntity<AnuncioResponse> criarAnuncio(
            @PathVariable Long itemId,
            @RequestBody AnuncioRequest anuncioRequest, // DTO com titulo, descricao, preco
            Authentication authentication) {

        String email = authentication.getName();
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não autenticado."));

        // O AnuncioService agora conterá a lógica de validação e criação
        Anuncio anuncioSalvo = anuncioService.criarAnuncioParaItemExterno(itemId, anuncioRequest, usuario);

        // Converte o Anuncio salvo para o DTO de resposta
        AnuncioResponse responseDto = toDto(anuncioSalvo);

        return ResponseEntity.ok(responseDto);
    }

    // Método para converter a entidade Anuncio para o DTO de resposta
    private AnuncioResponse toDto(Anuncio a) {
        AnuncioResponse dto = new AnuncioResponse();
        dto.setId(a.getId());
        dto.setTitulo(a.getTitulo());
        dto.setDescricao(a.getDescricao());
        dto.setPreco(a.getPreco());
        dto.setSkinId(a.getSteamItemId()); // Usa o novo campo
        dto.setSkinIcon(a.getSkinImageUrl()); // Usa o novo campo
        dto.setSkinNome(a.getSkinName()); // Usa o novo campo
        dto.setStatus(a.getStatus());
        dto.setDataCriacao(a.getDataCriacao());
        dto.setUsuarioNome(a.getUsuario().getNome());
        dto.setSkinQualidade(a.getSkinQuality()); // Usa o novo campo
        return dto;
    }

    // Seus outros métodos (listar, buscar por id, deletar) precisarão ser
    // adaptados para usar o novo método toDto.
    @GetMapping
    public ResponseEntity<List<AnuncioResponse>> listarAnuncios() {
        List<AnuncioResponse> dtos = anuncioService.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
