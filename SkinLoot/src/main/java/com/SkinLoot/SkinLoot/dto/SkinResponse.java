package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.enums.Qualidade;
import com.SkinLoot.SkinLoot.model.enums.Raridade;

import java.util.UUID;

public class SkinResponse {
    private UUID id;
    private String nome;
    private String descricao;
    private String icon;
    private Raridade raridade;
    private Qualidade qualidade;
    private Double desgasteFloat;
    private String assetId;

    private UUID jogoId;
    private String jogoNome;

    // ✅ Construtor
    public SkinResponse(UUID id, String nome, String descricao, String icon,
                        Raridade raridade, Qualidade qualidade, Double desgasteFloat,
                        String assetId, UUID jogoId, String jogoNome) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.icon = icon;
        this.raridade = raridade;
        this.qualidade = qualidade;
        this.desgasteFloat = desgasteFloat;
        this.assetId = assetId;
        this.jogoId = jogoId;
        this.jogoNome = jogoNome;
    }

    // ✅ Getters e setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Raridade getRaridade() {
        return raridade;
    }

    public void setRaridade(Raridade raridade) {
        this.raridade = raridade;
    }

    public Qualidade getQualidade() {
        return qualidade;
    }

    public void setQualidade(Qualidade qualidade) {
        this.qualidade = qualidade;
    }

    public Double getDesgasteFloat() {
        return desgasteFloat;
    }

    public void setDesgasteFloat(Double desgasteFloat) {
        this.desgasteFloat = desgasteFloat;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public UUID getJogoId() {
        return jogoId;
    }

    public void setJogoId(UUID jogoId) {
        this.jogoId = jogoId;
    }

    public String getJogoNome() {
        return jogoNome;
    }

    public void setJogoNome(String jogoNome) {
        this.jogoNome = jogoNome;
    }
}
