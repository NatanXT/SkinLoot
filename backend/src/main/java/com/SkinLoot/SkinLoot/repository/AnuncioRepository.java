package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AnuncioRepository extends JpaRepository<Anuncio, UUID> {

//    @Query("SELECT a FROM Anuncio a WHERE a.status = :status AND (:jogoId IS NULL OR :jogoId MEMBER OF a.jogos)")
//    List<Anuncio> findByStatusAndJogo(@Param("status") Status status, @Param("jogoId") UUID jogoId);

}
