package com.SkinLoot.SkinLoot.controller;

import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@RestController // Define esta classe como um controlador REST
@RequestMapping("/skins") // Define o endpoint base para skins
public class SkinController {

    @Autowired // Injeta o repositório automaticamente
    private SkinRepository skinRepository;

    @GetMapping // Lista todas as skins
    public List<Skin> listarSkins() {
        return skinRepository.findAll();
    }

    @GetMapping("/{id}") // Busca uma skin pelo ID
    public ResponseEntity<Skin> buscarSkinPorId(@PathVariable Long id) {
        Optional<Skin> skin = skinRepository.findById(id);
        return skin.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping // Cria uma nova skin
    public ResponseEntity<Skin> criarSkin(@Valid @RequestBody Skin skin) {
        Skin novaSkin = skinRepository.save(skin);
        return ResponseEntity.ok(novaSkin);
    }

    @PutMapping("/{id}") // Atualiza uma skin existente
    public ResponseEntity<Skin> atualizarSkin(@PathVariable Long id, @Valid @RequestBody Skin skinAtualizada) {
        if (!skinRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        skinAtualizada.setId(id);
        Skin skinSalva = skinRepository.save(skinAtualizada);
        return ResponseEntity.ok(skinSalva);
    }

    @DeleteMapping("/{id}") // Remove uma skin pelo ID
    public ResponseEntity<Void> deletarSkin(@PathVariable Long id) {
        if (!skinRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        skinRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
