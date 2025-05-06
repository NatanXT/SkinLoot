package com.SkinLoot.SkinLoot.dto;

import jakarta.validation.constraints.NotBlank;

public class SkinRequest{

    @NotBlank
    private String nome;

    @NotBlank
    private String imagemUrl;

    @NotBlank
    private String jogoNome; // <- novo campo baseado em nome

        // Getters e setters
    }


