package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.AnuncioLike;
import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AnuncioLikeRepository extends JpaRepository<AnuncioLike, UUID> {
    Optional<AnuncioLike> findByAnuncioAndUsuario(Anuncio anuncio, Usuario usuario);
}
