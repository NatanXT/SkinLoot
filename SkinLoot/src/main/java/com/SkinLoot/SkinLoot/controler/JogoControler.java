package com.SkinLoot.SkinLoot.controller;

import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.repository.JogoRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/jogos") // Define a rota base para o controlador
public class JogoController {

    @Autowired
    private JogoRepository jogoRepository;

    @PostMapping // Endpoint para criar um novo jogo
    public ResponseEntity<Jogo> criarJogo(@Valid @RequestBody Jogo jogo) {
        Jogo novoJogo = jogoRepository.save(jogo);
        return ResponseEntity.ok(novoJogo);
    }

    @GetMapping // Endpoint para listar todos os jogos
    public ResponseEntity<List<Jogo>> listarJogos() {
        List<Jogo> jogos = jogoRepository.findAll();
        return ResponseEntity.ok(jogos);
    }

    @GetMapping("/{id}") // Endpoint para buscar um jogo pelo ID
    public ResponseEntity<Jogo> buscarJogoPorId(@PathVariable UUID id) {
        Optional<Jogo> jogo = jogoRepository.findById(id);
        return jogo.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}") // Endpoint para atualizar um jogo
    public ResponseEntity<Jogo> atualizarJogo(@PathVariable UUID id, @Valid @RequestBody Jogo jogoAtualizado) {
        if (!jogoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jogoAtualizado.setId(id);
        Jogo jogoSalvo = jogoRepository.save(jogoAtualizado);
        return ResponseEntity.ok(jogoSalvo);
    }

    @DeleteMapping("/{id}") // Endpoint para deletar um jogo pelo ID
    public ResponseEntity<Void> deletarJogo(@PathVariable UUID id) {
        if (!jogoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jogoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
