//package com.SkinLoot.SkinLoot.service;
//
//import com.SkinLoot.SkinLoot.repository.CategoriaJogoRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//import java.util.Optional;
//import java.util.UUID;
//
//@Service // Define esta classe como um serviço gerenciado pelo Spring
//public class CategoriaJogoService {
//
//    @Autowired // Injeta automaticamente a dependência do repositório
//    private CategoriaJogoRepository categoriaJogoRepository;
//
//    // Listar todas as categorias
//    public List<CategoriaJogo> listarCategorias() {
//        return categoriaJogoRepository.findAll();
//    }
//
//    // Buscar categoria por ID
//    public Optional<CategoriaJogo> buscarPorSkinId(UUID id) {
//        return categoriaJogoRepository.findById(id);
//    }
//
//    // Buscar categoria por nome
//    public Optional<CategoriaJogo> buscarPorNome(String nome) {
//        return categoriaJogoRepository.findByNome(nome);
//    }
//
//    // Criar nova categoria
//    @Transactional
//    public CategoriaJogo criarCategoria(CategoriaJogo categoria) {
//        if (categoriaJogoRepository.existsByNome(categoria.getNome())) {
//            throw new RuntimeException("Categoria já cadastrada");
//        }
//        return categoriaJogoRepository.save(categoria);
//    }
//
//    // Atualizar categoria existente
//    @Transactional
//    public CategoriaJogo atualizarCategoria(UUID id, CategoriaJogo categoriaAtualizada) {
//        if (!categoriaJogoRepository.existsById(id)) {
//            throw new RuntimeException("Categoria não encontrada");
//        }
//        categoriaAtualizada.setId(id);
//        return categoriaJogoRepository.save(categoriaAtualizada);
//    }
//
//    // Deletar categoria
//    @Transactional
//    public void deletarCategoria(UUID id) {
//        if (!categoriaJogoRepository.existsById(id)) {
//            throw new RuntimeException("Categoria não encontrada");
//        }
//        categoriaJogoRepository.deleteById(id);
//    }
//}
