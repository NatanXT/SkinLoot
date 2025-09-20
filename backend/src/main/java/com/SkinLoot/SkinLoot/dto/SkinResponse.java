package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Skin;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
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
    private String assetId;
    private UUID jogoId;
    private String jogoNome;
    private String statusModeracao;
    private LocalDateTime dataSubmissao;

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
    }
}
