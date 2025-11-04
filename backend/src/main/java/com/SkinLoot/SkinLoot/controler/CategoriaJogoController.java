//package com.SkinLoot.SkinLoot.controler;
//
//import com.SkinLoot.SkinLoot.model.enums.CategoriaJogo;
//import com.SkinLoot.SkinLoot.service.CategoriaJogoService;
//import jakarta.validation.Valid;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@RestController // Define esta classe como um controlador REST
//@RequestMapping("/categorias") // Define o endpoint base para esse controlador
//public class CategoriaJogoController {
//
//    @Autowired // Injeta automaticamente a dependência do repositório
//    private CategoriaJogoService categoriaJogoService;
//
//
//    @GetMapping // Listar todas as categorias
//    public List<CategoriaJogo> listarCategorias() {
//        return categoriaJogoService.listarCategorias();
//    }
//
//    @GetMapping("/{id}") // Buscar categoria por ID
//    public ResponseEntity<CategoriaJogo> buscarCategoriaPorId(@PathVariable UUID id) {
//        Optional<CategoriaJogo> categoria = categoriaJogoService.buscarPorSkinId(id);
//        return categoria.map(ResponseEntity::ok)
//                        .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @GetMapping("/buscar") // Buscar categoria por nome
//    public ResponseEntity<CategoriaJogo> buscarCategoriaPorNome(@RequestParam String nome) {
//        Optional<CategoriaJogo> categoria = categoriaJogoService.buscarPorNome(nome);
//        return categoria.map(ResponseEntity::ok)
//                        .orElseGet(() -> ResponseEntity.notFound().build());
//    }
//
//    @PostMapping // Criar nova categoria
//    public ResponseEntity<CategoriaJogo> criarCategoria(@Valid @RequestBody CategoriaJogo categoria) {
//        CategoriaJogo novaCategoria = categoriaJogoService.criarCategoria(categoria);
//        return ResponseEntity.ok(novaCategoria);
//    }
//
//    @PutMapping("/{id}") // Atualizar categoria
//    public ResponseEntity<CategoriaJogo> atualizarCategoria(@PathVariable UUID id, @Valid @RequestBody CategoriaJogo categoriaAtualizada) {
//        CategoriaJogo categoria = categoriaJogoService.atualizarCategoria(id, categoriaAtualizada);
//        return ResponseEntity.ok(categoria);
//    }
//
//    @DeleteMapping("/{id}") // Deletar categoria
//    public ResponseEntity<Void> deletarCategoria(@PathVariable UUID id) {
//        categoriaJogoService.deletarCategoria(id);
//        return ResponseEntity.noContent().build();
//    }
//}
