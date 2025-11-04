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
}
