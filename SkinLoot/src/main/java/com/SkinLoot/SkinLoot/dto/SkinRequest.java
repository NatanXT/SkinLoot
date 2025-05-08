package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.enums.Qualidade;
import com.SkinLoot.SkinLoot.model.enums.Raridade;
import jakarta.validation.constraints.NotBlank;

public class SkinRequest{

    private String nome;
    private String descricao;
    private Raridade raridade;
    private String jogoNome;
    private String icon;
    private String assetId;
    private Double desgastefloat;
    private Qualidade qualidade;

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

    public Raridade getRaridade() {
        return raridade;
    }

    public void setRaridade(Raridade raridade) {
        this.raridade = raridade;
    }

    public String getJogoNome() {
        return jogoNome;
    }

    public void setJogoNome(String jogoNome) {
        this.jogoNome = jogoNome;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public Double getDesgastefloat() {
        return desgastefloat;
    }

    public void setDesgastefloat(Double desgastefloat) {
        this.desgastefloat = desgastefloat;
    }

    public Qualidade getQualidade() {
        return qualidade;
    }

    public void setQualidade(Qualidade qualidade) {
        this.qualidade = qualidade;
    }
}


