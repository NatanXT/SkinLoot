package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.InteracaoUsuarioSkin;
import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InteracaoUsuarioSkinRepository extends JpaRepository<InteracaoUsuarioSkin, UUID> {
    List<InteracaoUsuarioSkin> findByUsuarioOrderByDataHoraDesc(Usuario usuario);
}