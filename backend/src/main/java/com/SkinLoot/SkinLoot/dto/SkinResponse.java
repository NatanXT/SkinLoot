package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Skin;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@NoArgsConstructor
public class SkinResponse {

    private UUID id;
    private String nome;
    private String descricao;
    private String icon;
    private String raridade;
    private String assetId;
    private UUID jogoId;
    private String jogoNome;
    private String statusModeracao;
    private LocalDateTime dataSubmissao;
    private UUID usuarioId;
    private String usuarioNome;

    /**
     * ✅ ESTE É O ÚNICO CONSTRUTOR DE CONVERSÃO QUE PRECISAMOS.
     * Ele centraliza toda a lógica de mapeamento aqui.
     */
    public SkinResponse(Skin skin) {
        this.id = skin.getId();
        this.nome = skin.getNome();
        this.descricao = skin.getDescricao();
        this.icon = skin.getIcon();
        this.assetId = skin.getAssetId();
        this.dataSubmissao = skin.getDataSubmissao();
        if (skin.getStatusModeracao() != null) {
            this.statusModeracao = skin.getStatusModeracao().name(); // Converte o enum para String
        }
        // ------------------------------------

        if (skin.getRaridade() != null) {
            this.raridade = skin.getRaridade().name();
        }
        if (skin.getJogo() != null) {
            this.jogoId = skin.getJogo().getId();
            this.jogoNome = skin.getJogo().getNome();
        }
        if (skin.getUsuario() != null) {
            this.usuarioId = skin.getUsuario().getId();
            this.usuarioNome = skin.getUsuario().getNome();
        }
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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getRaridade() {
        return raridade;
    }

    public void setRaridade(String raridade) {
        this.raridade = raridade;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public UUID getJogoId() {
        return jogoId;
    }

    public void setJogoId(UUID jogoId) {
        this.jogoId = jogoId;
    }

    public String getJogoNome() {
        return jogoNome;
    }

    public void setJogoNome(String jogoNome) {
        this.jogoNome = jogoNome;
    }

    public String getStatusModeracao() {
        return statusModeracao;
    }

    public void setStatusModeracao(String statusModeracao) {
        this.statusModeracao = statusModeracao;
    }

    public LocalDateTime getDataSubmissao() {
        return dataSubmissao;
    }

    public void setDataSubmissao(LocalDateTime dataSubmissao) {
        this.dataSubmissao = dataSubmissao;
    }

    public UUID getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(UUID usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }
}
