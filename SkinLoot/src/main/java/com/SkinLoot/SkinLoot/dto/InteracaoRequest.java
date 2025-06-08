package com.SkinLoot.SkinLoot.dto;

import java.util.UUID;

public class InteracaoRequest {
    private UUID skinId;
    private String tipo;
    private Double tempo;

    // Getters e Setters
    public UUID getSkinId() {
        return skinId;
    }
    public void setSkinId(UUID skinId) {
        this.skinId = skinId;
    }
    public String getTipo() {
        return tipo;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public Double getTempo() {
        return tempo;
    }
    public void setTempo(Double tempo) {
        this.tempo = tempo;
    }
}
