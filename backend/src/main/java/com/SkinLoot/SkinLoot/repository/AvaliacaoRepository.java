package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.Avaliacao;
import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    // Para exibir o "mural" de avaliações de um vendedor
    List<Avaliacao> findByAvaliadoIdOrderByDataCriacaoDesc(UUID avaliadoId);

    // Para evitar spam: o usuário só pode avaliar um anúncio uma vez
    boolean existsByAvaliadorAndAnuncio(Usuario avaliador, Anuncio anuncio);


}
