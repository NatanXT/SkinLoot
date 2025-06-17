package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class InteracaoUsuarioSkin {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    private Usuario usuario;

    @ManyToOne
    private Skin skin;

    private String tipo; // ex: visualizacao, clique, favorito
    private Double tempoVisualizacao; // em segundos
    private LocalDateTime dataHora;


    // Getters e Setters
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public Usuario getUsuario() {
        return usuario;
    }
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    public Skin getSkin() {
        return skin;
    }
    public void setSkin(Skin skin) {
        this.skin = skin;
    }
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public Double getTempoVisualizacao() {
        return tempoVisualizacao;
    }
    public void setTempoVisualizacao(Double tempoVisualizacao) {
        this.tempoVisualizacao = tempoVisualizacao;
    }
    public LocalDateTime getDataHora() {
        return dataHora;
    }
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
