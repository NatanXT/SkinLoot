package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.CategoriaJogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoriaJogoRepository extends JpaRepository<CategoriaJogo, UUID> {// JpaRepository<CategoriaJogo, UUID>: Extende JpaRepository, que já fornece métodos como save, findById, findAll, deleteById, etc.

    // Método para buscar uma categoriajogo pelo nome
    Optional<CategoriaJogo> findByNome(String nome);

    // Método para verificar se uma categoriajogo já existe pelo nome
    boolean existsByNome(String nome);
}
