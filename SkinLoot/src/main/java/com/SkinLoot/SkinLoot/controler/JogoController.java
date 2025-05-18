package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.service.JogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Controlador REST responsável por gerenciar os jogos cadastrados na plataforma.
 */
@RestController
@RequestMapping("/jogos")
@RequiredArgsConstructor
public class JogoController {

    private final JogoService jogoService;

    /**
     * Cadastra um novo jogo.
     *
     * @param jogo Objeto com os dados do jogo a ser criado
     * @return Jogo criado com status 201 Created
     */
    @PostMapping
    public ResponseEntity<Jogo> criarJogo(@Valid @RequestBody Jogo jogo) {
        Jogo novoJogo = jogoService.criarJogo(jogo);
        URI location = URI.create(String.format("/jogos/%s", novoJogo.getId()));
        return ResponseEntity.created(location).body(novoJogo);
    }

    /**
     * Lista todos os jogos cadastrados.
     *
     * @return Lista de jogos
     */
    @GetMapping
    public ResponseEntity<List<Jogo>> listarJogos() {
        return ResponseEntity.ok(jogoService.listarJogos());
    }

    /**
     * Busca um jogo pelo ID.
     *
     * @param id Identificador único do jogo
     * @return Jogo encontrado ou 404 se não existir
     */
    @GetMapping("/{id}")
    public ResponseEntity<Jogo> buscarJogoPorId(@PathVariable UUID id) {
        Optional<Jogo> jogo = jogoService.buscarPorId(id);
        return jogo.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /*criar uma interface para jogo com essas informações para funcionamento:
    public interface JogoService {
    Jogo criarJogo(Jogo jogo);
    List<Jogo> listarJogos();
    Optional<Jogo> buscarPorId(UUID id);
    Optional<Jogo> atualizarJogo(UUID id, Jogo jogoAtualizado);
    boolean deletarJogo(UUID id);
    }*/ 

    /**
     * Atualiza um jogo existente.
     *
     * @param id            ID do jogo a ser atualizado
     * @param jogoAtualizado Objeto com os novos dados
     * @return Jogo atualizado ou 404 se não existir
     */
    @PutMapping("/{id}")
    public ResponseEntity<Jogo> atualizarJogo(@PathVariable UUID id, @Valid @RequestBody Jogo jogoAtualizado) {
        Optional<Jogo> atualizado = jogoService.atualizarJogo(id, jogoAtualizado);
        return atualizado.map(ResponseEntity::ok)
                         .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Remove um jogo do sistema.
     *
     * @param id ID do jogo a ser removido
     * @return 204 No Content ou 404 se o jogo não existir
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarJogo(@PathVariable UUID id) {
        boolean removido = jogoService.deletarJogo(id);
        return removido ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
