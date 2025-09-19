package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Usuario;

public class UsuarioDto {
    private String nome;
    private String email;
    private String genero;
    private String role;

    public UsuarioDto(Usuario usuario) {
        this.nome = nome;
        this.email = email;
        this.genero = genero;
        this.role = role;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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
}
