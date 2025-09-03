package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.AnuncioLike;
import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
@Repository
public interface AnuncioLikeRepository extends JpaRepository<AnuncioLike, UUID> {
    Optional<AnuncioLike> findByAnuncioAndUsuario(Anuncio anuncio, Usuario usuario);

    void deleteByAnuncioIdAndUsuarioId(UUID anuncioId, UUID usuarioId);
}
