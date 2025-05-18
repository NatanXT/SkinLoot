/*package com.SkinLoot.SkinLoot.controller;

import com.SkinLoot.SkinLoot.model.enums.CategoriaJogo;
import com.SkinLoot.SkinLoot.service.CategoriaJogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


 // Controlador responsável pelas operações relacionadas à entidade CategoriaJogo.
 
@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaJogoController {

    private final CategoriaJogoService categoriaJogoService;

    
    // Lista todas as categorias cadastradas.
    
    @GetMapping
    public List<CategoriaJogo> listarCategorias() {
        return categoriaJogoService.listarCategorias();
    }

    
    // Busca uma categoria pelo seu ID.
    
    // @param id identificador da categoria
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaJogo> buscarCategoriaPorId(@PathVariable UUID id) {
        return categoriaJogoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    
    // Busca uma categoria pelo nome.
    
    // @param nome nome da categoria
     
    @GetMapping("/buscar")
    public ResponseEntity<CategoriaJogo> buscarCategoriaPorNome(@RequestParam(name = "nome", required = true) String nome) {
        return categoriaJogoService.buscarPorNome(nome)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    
    // Cadastra uma nova categoria.
    
    // @param categoria dados da nova categoria
     
    @PostMapping
    public ResponseEntity<CategoriaJogo> criarCategoria(@Valid @RequestBody CategoriaJogo categoria) {
        CategoriaJogo novaCategoria = categoriaJogoService.criarCategoria(categoria);
        URI location = URI.create(String.format("/categorias/%s", novaCategoria.getId()));
        return ResponseEntity.created(location).body(novaCategoria);
    }

    
    // Atualiza uma categoria existente.
    
    // @param id                identificador da categoria
    // @param categoriaAtualizada dados atualizados
     
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaJogo> atualizarCategoria(
            @PathVariable UUID id,
            @Valid @RequestBody CategoriaJogo categoriaAtualizada) {
        CategoriaJogo categoria = categoriaJogoService.atualizarCategoria(id, categoriaAtualizada);
        return ResponseEntity.ok(categoria);
    }

    
    // Remove uma categoria pelo seu ID.
    
    // @param id identificador da categoria
     
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarCategoria(@PathVariable UUID id) {
        categoriaJogoService.deletarCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
*/