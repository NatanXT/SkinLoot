package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Usuario;

import java.math.BigDecimal;
import java.util.UUID;

public class AnuncioRequest {

    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private UUID skinId;

    public AnuncioRequest() {
    }

    public AnuncioRequest(String titulo, String descricao, BigDecimal preco, UUID skinId) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.preco = preco;
        this.skinId = skinId;
    }

    // Getters e Setters
    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public UUID getSkinId() {
        return skinId;
    }
    public void setSkinId(UUID skinId) {
        this.skinId = skinId;
    }
}

