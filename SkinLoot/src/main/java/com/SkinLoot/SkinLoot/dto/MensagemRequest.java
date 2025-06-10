package com.SkinLoot.SkinLoot.dto;

import java.util.UUID;

public class MensagemRequest {
    private UUID destinatarioId;
    private String conteudo;

    // Getters e Setters
    public UUID getDestinatarioId() {
        return destinatarioId;
    }
    public void setDestinatarioId(UUID destinatarioId) {
        this.destinatarioId = destinatarioId;
    }
    public String getConteudo() {
        return conteudo;
    }
    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }
}
