package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Usuario;

public class LoginResponse {
    private String token;
    private Usuario user;

    public LoginResponse(String token, Usuario user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Usuario getUser() {
        return user;
    }

    public void setUser(Usuario user) {
        this.user = user;
    }
}