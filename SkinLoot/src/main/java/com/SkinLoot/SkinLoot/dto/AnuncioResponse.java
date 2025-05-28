package com.SkinLoot.SkinLoot.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class AnuncioResponse {
    private UUID id;
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private UUID skinId;
    private String skinNome;

    public AnuncioResponse() {}

    public AnuncioResponse(UUID id, String titulo,String descricao, BigDecimal preco,  UUID skinId, String skinNome) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.preco = preco;
        this.skinId = skinId;
        this.skinNome = skinNome;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

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

    public String getSkinNome() {
        return skinNome;
    }

    public void setSkinNome(String skinNome) {
        this.skinNome = skinNome;
    }
}
