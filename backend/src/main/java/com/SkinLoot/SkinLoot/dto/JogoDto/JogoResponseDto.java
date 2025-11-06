package com.SkinLoot.SkinLoot.dto.JogoDto;

import com.SkinLoot.SkinLoot.model.Jogo;

import java.util.UUID;

public class JogoResponseDto{
    private UUID id;
    private String nome;

    public JogoResponseDto(Jogo entidade){
        this.id = entidade.getId();
        this.nome = entidade.getNome();
    }

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
}
