package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Status;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public class AnuncioRequest {
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Map<String, Object> detalhesEspecificos;
    private Status status;
    //private Long steamItemId;    // O ID do item que vem da API da Steam
    private UUID skinId;

    // Getters e Setters para todos os campos
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public UUID getSkinId() {
        return skinId;
    }

    public void setSkinId(UUID skinId) {
        this.skinId = skinId;
    }

    public Map<String, Object> getDetalhesEspecificos() {
        return detalhesEspecificos;
    }

    public void setDetalhesEspecificos(Map<String, Object> detalhesEspecificos) {
        this.detalhesEspecificos = detalhesEspecificos;
    }
}

