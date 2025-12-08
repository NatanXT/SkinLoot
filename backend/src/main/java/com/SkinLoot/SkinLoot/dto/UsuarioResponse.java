package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Usuario;

import java.util.UUID;

public class UsuarioResponse {
  private UUID id;
  private String nome;
  private String email;
  private String plano;
  private String role;
   private Double mediaNotas;
  private Integer totalAvaliacoes;

  public static UsuarioResponse of(Usuario u) {
    UsuarioResponse r = new UsuarioResponse();
    r.id = u.getId();
    r.nome = u.getNome();
    r.email = u.getEmail();
    // adapte se seu modelo guardar o plano de outra forma:
    r.plano = u.getPlanoAssinatura() != null
        ? u.getPlanoAssinatura().getNome().name().toLowerCase()
        : "gratuito";
    r.mediaNotas = u.getMediaNotas();
    r.totalAvaliacoes = u.getTotalAvaliacoes();
    r.role = u.getRole().name();
    return r;
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

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPlano() {
    return plano;
  }

  public void setPlano(String plano) {
    this.plano = plano;
  }

  public String getRole() {
      return role;
  }
  public void setRole(String role) {
      this.role = role;
  }
}
