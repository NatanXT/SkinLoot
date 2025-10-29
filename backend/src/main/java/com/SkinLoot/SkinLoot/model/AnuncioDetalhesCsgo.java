package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "anuncio_detalhes_csgo")
public class AnuncioDetalhesCsgo {

    @Id
    @Column(name = "anuncio_id") // Nome da coluna que será a PK e FK
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Diz ao JPA que o 'id' desta entidade é mapeado pelo relacionamento 'anuncio'
    @JoinColumn(name = "anuncio_id") // Especifica a coluna de junção
    private Anuncio anuncio;

    @Column(name = "desgaste_float")
    private Double desgasteFloat; // Valor de desgaste (float value)

    @Column(name = "pattern_index")
    private Integer patternIndex; // Índice do pattern

    @Column(name = "stat_trak")
    private Boolean statTrak; // Se é StatTrak™ ou não

    @Column(name = "exterior", length = 50)
    private String exterior; // Ex: "Factory New", "Minimal Wear", etc. (Poderia ser um Enum também)

    public AnuncioDetalhesCsgo() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Anuncio getAnuncio() {
        return anuncio;
    }

    public void setAnuncio(Anuncio anuncio) {
        this.anuncio = anuncio;
    }

    public Double getDesgasteFloat() {
        return desgasteFloat;
    }

    public void setDesgasteFloat(Double desgasteFloat) {
        this.desgasteFloat = desgasteFloat;
    }

    public Integer getPatternIndex() {
        return patternIndex;
    }

    public void setPatternIndex(Integer patternIndex) {
        this.patternIndex = patternIndex;
    }

    public Boolean getStatTrak() {
        return statTrak;
    }

    public void setStatTrak(Boolean statTrak) {
        this.statTrak = statTrak;
    }

    public String getExterior() {
        return exterior;
    }

    public void setExterior(String exterior) {
        this.exterior = exterior;
    }
}
