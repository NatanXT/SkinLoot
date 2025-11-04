package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.dto.CsgoDto.Csgo2Request;
import com.SkinLoot.SkinLoot.dto.riotDto.LolRequest;
import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.model.enums.Status;
import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * DTO usado para criar ou atualizar anúncios.
 * Agora suporta envio de imagem em Base64 bruto (sem prefixo data:).
 */
public class AnuncioRequest {

    // Campos principais do anúncio
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Status status;
    // Vínculo opcional ao catálogo (quando existir)
    private UUID skinId;

    private UUID jogoId;
    private Csgo2Request detalhesCsgo;
    private LolRequest detalhesLol;

    // Nome livre digitado pelo usuário (modo não-vinculado ao catálogo)
    @JsonAlias({ "skin_name", "skinName" })
    private String skinName;

    // URL opcional da imagem (mantido para compatibilidade)
    @JsonAlias({ "skin_image_url", "skinImageUrl", "imagemUrl", "imageUrl", "imagem" })
    private String skinImageUrl;

    // ======== NOVOS CAMPOS: suporte a Base64 bruto =========
    // Base64 cru (APENAS a parte depois da vírgula do data URL)
    @JsonAlias({ "skin_image_base64", "skinImageBase64" })
    private String skinImageBase64;

    // Mime type correspondente (ex.: image/png, image/jpeg)
    @JsonAlias({ "skin_image_mime", "skinImageMime" })
    private String skinImageMime;
    // =======================================================

    // Metadados opcionais da instância
    // private Double desgasteFloat;
    // private String qualidade;

    // ---------------- Getters e Setters ----------------

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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public UUID getSkinId() {
        return skinId;
    }

    public void setSkinId(UUID skinId) {
        this.skinId = skinId;
    }

    public UUID getJogoId() {
        return jogoId;
    }

    public void setJogoId(UUID jogoId) {
        this.jogoId = jogoId;
    }

    public String getSkinName() {
        return skinName;
    }
    public void setSkinName(String skinName) {
        this.skinName = skinName;
    }

    public String getSkinImageUrl() {
        return skinImageUrl;
    }

    public void setSkinImageUrl(String skinImageUrl) {
        this.skinImageUrl = skinImageUrl;
    }

    public String getSkinImageBase64() {
        return skinImageBase64;
    }

    public void setSkinImageBase64(String skinImageBase64) {
        this.skinImageBase64 = skinImageBase64;
    }

    public String getSkinImageMime() {
        return skinImageMime;
    }

    public void setSkinImageMime(String skinImageMime) {
        this.skinImageMime = skinImageMime;
    }

    public Csgo2Request getDetalhesCsgo() {
        return detalhesCsgo;
    }

    public void setDetalhesCsgo(Csgo2Request detalhesCsgo) {
        this.detalhesCsgo = detalhesCsgo;
    }

    public LolRequest getDetalhesLol() {
        return detalhesLol;
    }

    public void setDetalhesLol(LolRequest detalhesLol) {
        this.detalhesLol = detalhesLol;
    }
}
