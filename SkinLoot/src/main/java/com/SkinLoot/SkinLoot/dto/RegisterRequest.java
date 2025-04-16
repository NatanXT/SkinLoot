package com.SkinLoot.SkinLoot.dto;

public class RegisterRequest {
        private String nome;
        private String genero;
        private String email;
        private String senha;

    public String getUsername() {
        return nome;
    }

    public void setUsername(String nome) {
        this.nome = nome;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}


