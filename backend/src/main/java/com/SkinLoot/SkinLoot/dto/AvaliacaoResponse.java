package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Avaliacao;

import java.time.LocalDateTime;

public class AvaliacaoResponse {

    private Long id;
    private int nota;
    private String comentario;
    private String avaliadorNome; // Nome de quem avaliou
    private String anuncioTitulo; // Título do anúncio avaliado
    private LocalDateTime dataCriacao;


    public AvaliacaoResponse(Avaliacao avaliacao) {
        this.id = id;
        this.nota = nota;
        this.comentario = comentario;
        this.avaliadorNome = avaliadorNome;
        if (avaliacao.getAvaliador() != null) {
            this.avaliadorNome = avaliacao.getAvaliador().getNome();
        }
        if (avaliacao.getAnuncio() != null) {
            this.anuncioTitulo = avaliacao.getAnuncio().getTitulo();
        }
    }
}
