package com.SkinLoot.SkinLoot.dto;

public class LoginResponse{
    private String token;
    private String nome;

    public LoginResponse(String token, String nome) {
            this.token = token;
            this.nome = nome;
    }

        // Getters e setters

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
