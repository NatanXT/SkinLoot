package com.SkinLoot.SkinLoot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data // Gera Getters, Setters, toString, etc.
@NoArgsConstructor // Necessário para o new ChatMessageResponse()
@AllArgsConstructor // Útil para criar o DTO de forma mais limpa
public class ChatMessageResponse {

    private Long id;
    private String conteudo;
    private LocalDateTime timestamp;
// nome do usuário que enviou. (Ex: "joao")
    private String remetenteNome;
    //O nome do usuário que recebeu. (Ex: "satam")
    private String destinatarioNome;
    private UUID remetenteId;
    private UUID destinatarioId;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
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

    public UUID getRemetenteId() {
        return remetenteId;
    }

    public void setRemetenteId(UUID remetenteId) {
        this.remetenteId = remetenteId;
    }

    public UUID getDestinatarioId() {
        return destinatarioId;
    }

    public void setDestinatarioId(UUID destinatarioId) {
        this.destinatarioId = destinatarioId;
    }
}
