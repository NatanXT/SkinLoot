package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.enums.Qualidade;
import com.SkinLoot.SkinLoot.model.enums.Raridade;
import jakarta.validation.constraints.NotBlank;

import java.util.Map;
import java.util.UUID;

public class SkinRequest{

    private String nome;
    private String descricao;
    private Raridade raridade;
    private UUID jogoId;
    private String icon;

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

    public UUID getJogoId() {
        return jogoId;
    }

    public void setJogoId(UUID jogoId) {
        this.jogoId = jogoId;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }
}


