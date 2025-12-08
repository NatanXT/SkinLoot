package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Avaliacao;

import java.time.LocalDateTime;
import java.util.UUID;

public class AvaliacaoResponse {

    private Long id;
    private UUID avaliadoId;   // ID do Vendedor
    private UUID avaliadorId;  // ID do Comprador
    private UUID anuncioId;    // <--- CAMPO NOVO ADICIONADO

    private int nota;
    private String comentario;
    private String avaliadorNome;
    private String anuncioTitulo;
    private LocalDateTime dataCriacao;

    // Construtor que converte a Entidade em DTO
    public AvaliacaoResponse(Avaliacao avaliacao) {
        this.id = avaliacao.getId();
        this.nota = avaliacao.getNota();
        this.comentario = avaliacao.getComentario();
        this.dataCriacao = avaliacao.getDataCriacao();

        // Mapeia Vendedor
        if (avaliacao.getAvaliado() != null) {
            this.avaliadoId = avaliacao.getAvaliado().getId();
        }

        // Mapeia Comprador
        if (avaliacao.getAvaliador() != null) {
            this.avaliadorId = avaliacao.getAvaliador().getId();
            this.avaliadorNome = avaliacao.getAvaliador().getNome();
        } else {
            this.avaliadorNome = "Usuário Excluído";
        }

        // Mapeia Anúncio (ID e Título)
        if (avaliacao.getAnuncio() != null) {
            this.anuncioId = avaliacao.getAnuncio().getId(); // <--- PREENCHENDO O ID
            this.anuncioTitulo = avaliacao.getAnuncio().getTitulo();
        }
    }

    // ================= GETTERS E SETTERS =================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getAvaliadoId() { return avaliadoId; }
    public void setAvaliadoId(UUID avaliadoId) { this.avaliadoId = avaliadoId; }

    public UUID getAvaliadorId() { return avaliadorId; }
    public void setAvaliadorId(UUID avaliadorId) { this.avaliadorId = avaliadorId; }

    // Getter e Setter do novo campo
    public UUID getAnuncioId() { return anuncioId; }
    public void setAnuncioId(UUID anuncioId) { this.anuncioId = anuncioId; }

    public int getNota() { return nota; }
    public void setNota(int nota) { this.nota = nota; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public String getAvaliadorNome() { return avaliadorNome; }
    public void setAvaliadorNome(String avaliadorNome) { this.avaliadorNome = avaliadorNome; }

    public String getAnuncioTitulo() { return anuncioTitulo; }
    public void setAnuncioTitulo(String anuncioTitulo) { this.anuncioTitulo = anuncioTitulo; }

    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
}
