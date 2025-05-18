package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.SkinRequest;
import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.service.JogoService;
import com.SkinLoot.SkinLoot.service.SkinService;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController // Define a classe como um controlador REST
@RequestMapping("/skins") // Define a rota base para os endpoints deste controller
@RequiredArgsConstructor // Lombok: gera um construtor com todos os campos final (injeção via construtor)
public class SkinController {

    // Injeta os serviços necessários para a lógica do controller
    private final SkinService skinService;
    private final UsuarioService usuarioService;
    private final JogoService jogoService;

    /**
     * Cria uma nova skin associada a um usuário autenticado e a um jogo existente.
     * Rota: POST /skins
     *
     * @param request      Objeto com os dados da skin (recebido via body)
     * @param userDetails  Detalhes do usuário autenticado (injetado automaticamente)
     * @return A skin salva com status 200
     */
    @PostMapping
    public ResponseEntity<Skin> criar(
            @RequestBody @Valid SkinRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Busca o usuário logado pelo e-mail
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        // Busca o jogo informado na requisição
        Jogo jogo = jogoService.buscarPorNome(request.getJogoNome())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Jogo não encontrado"));

        // Cria o objeto Skin com os dados recebidos + relacionamento com o usuário e jogo
        Skin skin = new Skin();
        skin.setNome(request.getNome());
        skin.setDescricao(request.getDescricao());
        skin.setIcon(request.getIcon());
        skin.setRaridade(request.getRaridade());
        skin.setQualidade(request.getQualidade());
        skin.setAssetId(request.getAssetId());
        skin.setDesgastefloat(request.getDesgastefloat());
        skin.setJogo(jogo);
        skin.setUsuario(usuario);

        // Salva a skin e retorna no corpo da resposta
        return ResponseEntity.ok(skinService.salvar(skin));
    }

    /**
     * Lista todas as skins criadas pelo usuário autenticado.
     * Rota: GET /skins/meus
     *
     * @param userDetails Detalhes do usuário logado
     * @return Lista de skins do usuário
     */
    @GetMapping("/meus")
    public ResponseEntity<List<Skin>> minhasSkins(@AuthenticationPrincipal UserDetails userDetails) {
        // Busca o usuário atual pelo e-mail
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Usuário não encontrado"));

        // Retorna a lista de skins desse usuário
        return ResponseEntity.ok(skinService.listarPorUsuario(usuario.getId()));
    }

    /**
     * Lista todas as skins associadas a um jogo específico.
     * Rota: GET /skins/jogo/{jogoId}
     *
     * @param jogoId ID do jogo
     * @return Lista de skins pertencentes ao jogo
     */
    @GetMapping("/jogo/{jogoId}")
    public ResponseEntity<List<Skin>> porJogo(@PathVariable UUID jogoId) {
        return ResponseEntity.ok(skinService.listarPorJogo(jogoId));
    }
}