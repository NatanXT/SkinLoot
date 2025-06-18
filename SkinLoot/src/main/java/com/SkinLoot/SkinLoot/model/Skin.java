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
@NoArgsConstructor
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

    // Construtores que já fizemos antes...
    public Skin(String nome, Raridade raridade, Jogo jogo, Usuario usuario, String icon) {
        this.nome = nome;
        this.raridade = raridade;
        this.jogo = jogo;
        this.usuario = usuario;
        this.icon = icon;
    }
}