package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Skin;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SkinResponse {

    private UUID id;
    private String nome;
    private String descricao;
    private String icon;
    private String raridade;
    private String qualidade;
    private Double desgasteFloat;
    private String assetId;
    private UUID jogoId;
    private String jogoNome;

    /**
     * ✅ ESTE É O ÚNICO CONSTRUTOR DE CONVERSÃO QUE PRECISAMOS.
     * Ele centraliza toda a lógica de mapeamento aqui.
     */
    public SkinResponse(Skin skin) {
        this.id = skin.getId();
        this.nome = skin.getNome();
        this.descricao = skin.getDescricao();
        this.icon = skin.getIcon();
        this.desgasteFloat = skin.getDesgasteFloat(); // Usa o getter com nome correto
        this.assetId = skin.getAssetId();

        if (skin.getRaridade() != null) {
            this.raridade = skin.getRaridade().name();
        }
        if (skin.getQualidade() != null) {
            this.qualidade = skin.getQualidade().name();
        }
        if (skin.getJogo() != null) {
            this.jogoId = skin.getJogo().getId();
            this.jogoNome = skin.getJogo().getNome();
        }
    }
}