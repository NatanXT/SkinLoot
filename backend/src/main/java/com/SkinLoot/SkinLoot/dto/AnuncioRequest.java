package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.enums.Status;

import java.math.BigDecimal;
import java.util.UUID;

public class AnuncioRequest {

    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Status status;

    // ID da skin do catálogo (UUID)
    private UUID skinId;

    // Metadados opcionais da instância
    private Double desgasteFloat;
    private String qualidade;

    // Getters/Setters
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public UUID getSkinId() {
        return skinId;
    }

    public void setSkinId(UUID skinId) {
        this.skinId = skinId;
    }

    public Double getDesgasteFloat() {
        return desgasteFloat;
    }

    public void setDesgasteFloat(Double desgasteFloat) {
        this.desgasteFloat = desgasteFloat;
    }

    public String getQualidade() {
        return qualidade;
    }

    public void setQualidade(String qualidade) {
        this.qualidade = qualidade;
    }
}
