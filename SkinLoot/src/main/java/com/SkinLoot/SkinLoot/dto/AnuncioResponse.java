package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AnuncioResponse {
    private UUID id;
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Long skinId; // Agora é o ID da Steam (Long)
    private String skinIcon;
    private String skinNome;
    private String planoNome; // ✅ Novo campo
    private Status status;
    private LocalDateTime dataCriacao;
    private String usuarioNome;
    private String skinQualidade;

    public AnuncioResponse() {
    }

    public AnuncioResponse(UUID id, String titulo, String descricao, BigDecimal preco, Long skinId, String skinIcon, String skinNome, Status status, String usuarioNome, LocalDateTime dataCriacao, String skinQualidade) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.preco = preco;
        this.skinId = skinId;
        this.skinIcon = skinIcon;
        this.skinNome = skinNome;
        this.status = status;
        this.usuarioNome = usuarioNome;
        this.dataCriacao = dataCriacao;
        this.skinQualidade = skinQualidade;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public Long getSkinId() {
        return skinId;
    }

    public void setSkinId(Long skinId) {
        this.skinId = skinId;
    }

    public String getSkinIcon() {
        return skinIcon;
    }

    public void setSkinIcon(String skinIcon) {
        this.skinIcon = skinIcon;
    }

    public String getSkinNome() {
        return skinNome;
    }

    public void setSkinNome(String skinNome) {
        this.skinNome = skinNome;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public String getSkinQualidade() {
        return skinQualidade;
    }

    public void setSkinQualidade(String skinQualidade) {
        this.skinQualidade = skinQualidade;
    }
}
