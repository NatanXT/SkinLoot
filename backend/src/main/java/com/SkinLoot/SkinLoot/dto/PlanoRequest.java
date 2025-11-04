package com.SkinLoot.SkinLoot.dto;

public class PlanoRequest {
    private String planoNovo; // Usado pelo /upgrade
    private String planoAtual; // Usado pelo /renovar

    // Getters e Setters
    public String getPlanoNovo() { return planoNovo; }
    public void setPlanoNovo(String planoNovo) { this.planoNovo = planoNovo; }

    public String getPlanoAtual() { return planoAtual; }
    public void setPlanoAtual(String planoAtual) { this.planoAtual = planoAtual; }
}
