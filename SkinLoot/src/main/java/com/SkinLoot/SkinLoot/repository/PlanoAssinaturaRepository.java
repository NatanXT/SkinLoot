package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.PlanoAssinatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlanoAssinaturaRepository extends JpaRepository<PlanoAssinatura, UUID> {

    // Método para buscar um plano pelo nome (ex: "Gratuito")
    Optional<PlanoAssinatura> findByNome(String nome);
}
