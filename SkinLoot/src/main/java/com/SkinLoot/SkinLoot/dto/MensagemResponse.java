package com.SkinLoot.SkinLoot.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class MensagemResponse {
    private UUID id;
    private String conteudo;
    private LocalDateTime dataHora;
    private String remetenteNome;
    private String destinatarioNome;

    // Getters e Setters
    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public String getConteudo() {
        return conteudo;
    }
    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }
    public LocalDateTime getDataHora() {
        return dataHora;
    }
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
    public String getRemetenteNome() {
        return remetenteNome;
    }
    public void setRemetenteNome(String remetenteNome) {
        this.remetenteNome = remetenteNome;
    }
    public String getDestinatarioNome() {
        return destinatarioNome;
    }
    public void setDestinatarioNome(String destinatarioNome) {
        this.destinatarioNome = destinatarioNome;
    }

    
}
