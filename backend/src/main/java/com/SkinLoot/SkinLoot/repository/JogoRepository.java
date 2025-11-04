package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Jogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface JogoRepository extends JpaRepository<Jogo, UUID> {// JpaRepository<Jogo, UUID>: Extende JpaRepository, que já fornece métodos como save, findById, findAll, deleteById, etc.

    // Método para buscar um jogo pelo nome
    Optional<Jogo> findByNome(String nome);

    // Método para verificar se um jogo com determinado nome já existe
    boolean existsByNome(String nome);
}
