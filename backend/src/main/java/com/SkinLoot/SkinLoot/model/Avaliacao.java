package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.time.LocalDateTime;

@Entity
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // O usuário que FEZ a avaliação (o comprador)
    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliador_id")
    private Usuario avaliador;

    // O usuário que RECEBEU a avaliação (o vendedor)
    @ManyToOne(optional = false)
    @JoinColumn(name = "avaliado_id")
    private Usuario avaliado;

    // O anúncio que originou esta avaliação
    @ManyToOne(optional = false)
    @JoinColumn(name = "anuncio_id")
    private Anuncio anuncio;

    @Min(1) @Max(5)
    @Column(nullable = false)
    private int nota; // 1 a 5

    @Column(columnDefinition = "TEXT")
    private String comentario;

    private LocalDateTime dataCriacao = LocalDateTime.now();



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getAvaliador() {
        return avaliador;
    }

    public void setAvaliador(Usuario avaliador) {
        this.avaliador = avaliador;
    }

    public Usuario getAvaliado() {
        return avaliado;
    }

    public void setAvaliado(Usuario avaliado) {
        this.avaliado = avaliado;
    }

    public Anuncio getAnuncio() {
        return anuncio;
    }

    public void setAnuncio(Anuncio anuncio) {
        this.anuncio = anuncio;
    }

    @Min(1)
    @Max(5)
    public int getNota() {
        return nota;
    }

    public void setNota(@Min(1) @Max(5) int nota) {
        this.nota = nota;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
