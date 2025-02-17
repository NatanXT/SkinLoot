package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Skin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkinRepository extends JpaRepository<Skin, Long> {

    // Método para buscar skins por jogo
    List<Skin> findByJogoId(Long jogoId);

    // Método para buscar skins por usuário (dono)
    List<Skin> findByUsuarioId(Long usuarioId);
}
