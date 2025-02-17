package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {// JpaRepository<Jogo, UUID>: Extende JpaRepository, que já fornece métodos como save, findById, findAll, deleteById, etc.

    // Método para buscar um usuário pelo e-mail
    Optional<Usuario> findByEmail(String email);

    // Método para verificar se um e-mail já está cadastrado
    boolean existsByEmail(String email);
}
