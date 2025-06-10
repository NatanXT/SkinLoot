package com.SkinLoot.SkinLoot.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ConversaResumoResponse {
    private UUID usuarioId;
    private String nome;
    private String email;
    private String ultimaMensagem;
    private LocalDateTime dataHora;
    private boolean possuiNaoLidas;

    // Getters e Setters
    public UUID getUsuarioId() {
        return usuarioId;
    }
    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }
    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getUltimaMensagem() {
        return ultimaMensagem;
    }
    public void setUltimaMensagem(String ultimaMensagem) {
        this.ultimaMensagem = ultimaMensagem;
    }
    public LocalDateTime getDataHora() {
        return dataHora;
    }
    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
    public boolean isPossuiNaoLidas() {
        return possuiNaoLidas;
    }
    public void setPossuiNaoLidas(boolean possuiNaoLidas) {
        this.possuiNaoLidas = possuiNaoLidas;
    }

    
}
