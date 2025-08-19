package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Qualidade;
import com.SkinLoot.SkinLoot.model.enums.Raridade;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "skin")
@Getter
@Setter
public class Skin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @Size(min = 3, max = 100)
    @Column(nullable = false)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Raridade raridade;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jogo_id", nullable = false) // ✅ Chave estrangeira pelo ID do jogo
    private Jogo jogo;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @NotBlank
    @Column(nullable = false)
    private String icon;

    @Column(name = "asset_id")
    private String assetId;

    @Column(name = "desgaste_float")
    private Double desgasteFloat; // ✅ Nome corrigido (camelCase)

    @Enumerated(EnumType.STRING)
    private Qualidade qualidade;

//    // Construtores que já fizemos antes...
//    public Skin(String nome, Raridade raridade, Jogo jogo, Usuario usuario, String icon) {
//        this.nome = nome;
//        this.raridade = raridade;
//        this.jogo = jogo;
//        this.usuario = usuario;
//        this.icon = icon;
//    }
    public Skin() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public @NotNull @Size(min = 3, max = 100) String getNome() {
        return nome;
    }

    public void setNome(@NotNull @Size(min = 3, max = 100) String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public @NotNull Raridade getRaridade() {
        return raridade;
    }

    public void setRaridade(@NotNull Raridade raridade) {
        this.raridade = raridade;
    }

    public @NotNull Jogo getJogo() {
        return jogo;
    }

    public void setJogo(@NotNull Jogo jogo) {
        this.jogo = jogo;
    }

    public @NotNull Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(@NotNull Usuario usuario) {
        this.usuario = usuario;
    }

    public @NotBlank String getIcon() {
        return icon;
    }

    public void setIcon(@NotBlank String icon) {
        this.icon = icon;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public Double getDesgasteFloat() {
        return desgasteFloat;
    }

    public void setDesgasteFloat(Double desgasteFloat) {
        this.desgasteFloat = desgasteFloat;
    }

    public Qualidade getQualidade() {
        return qualidade;
    }

    public void setQualidade(Qualidade qualidade) {
        this.qualidade = qualidade;
    }
}
