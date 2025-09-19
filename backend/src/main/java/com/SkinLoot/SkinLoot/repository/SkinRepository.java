package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Skin;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository

public interface SkinRepository extends JpaRepository<Skin, UUID> {

    // Método para buscar skins por jogo
    List<Skin> findByJogoId(UUID jogoId);

    // Método para buscar skins por usuário (dono)
    List<Skin> findByUsuarioId(UUID usuarioId);

    // ✅ 3. ADICIONE este método
    // Ele sobrescreve o findAll() padrão e aplica o plano de busca
    @Override
    @EntityGraph(value = "Skin.withJogoAndUsuario")
    List<Skin> findAll();

    Optional<Skin> findByIdAndUsuarioId(UUID id, UUID usuarioId);

}
