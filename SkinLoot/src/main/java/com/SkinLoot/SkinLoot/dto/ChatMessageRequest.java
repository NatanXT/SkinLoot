package com.SkinLoot.SkinLoot.dto;

import java.util.UUID;

public class ChatMessageRequest {

    private String conteudo;
    // ANTES: private Long destinatarioId;
    private UUID destinatarioId; // ✅ CORRIGIDO para UUID

    // Getters e Setters
    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public UUID getDestinatarioId() {
        return destinatarioId;
    }

    public void setDestinatarioId(UUID destinatarioId) {
        this.destinatarioId = destinatarioId;
    }
}