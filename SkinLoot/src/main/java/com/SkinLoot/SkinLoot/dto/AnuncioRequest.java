package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Status;

import java.math.BigDecimal;
import java.util.UUID;

public class AnuncioRequest {
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Status status;
    private Long steamItemId;    // O ID do item que vem da API da Steam
    private String skinName;
    private String skinImageUrl;
    private String skinQuality;



    // Getters e Setters para todos os campos
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Long getSteamItemId() {
        return steamItemId;
    }

    public void setSteamItemId(Long steamItemId) {
        this.steamItemId = steamItemId;
    }

    public String getSkinName() {
        return skinName;
    }

    public void setSkinName(String skinName) {
        this.skinName = skinName;
    }

    public String getSkinImageUrl() {
        return skinImageUrl;
    }

    public void setSkinImageUrl(String skinImageUrl) {
        this.skinImageUrl = skinImageUrl;
    }

    public String getSkinQuality() {
        return skinQuality;
    }

    public void setSkinQuality(String skinQuality) {
        this.skinQuality = skinQuality;
    }
}

