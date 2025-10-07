package com.SkinLoot.SkinLoot.dto;

public class UsuarioDevSeedRequest {
  private String email;
  private String nome;
  private String plano; // "gratuito" | "intermediario" | "plus"

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getNome() {
    return nome;
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public String getPlano() {
    return plano;
  }

  public void setPlano(String plano) {
    this.plano = plano;
  }
}
