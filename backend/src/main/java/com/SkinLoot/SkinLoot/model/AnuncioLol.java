package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class AnuncioLol {

    @Id
    @Column(name = "anuncio_id")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "anuncio_id")
    private Anuncio anuncio;

    @Column(length = 100)
    private String chroma; // Nome do Chroma (se aplicável)

    @Column(name = "tipo_skin", length = 50)
    private String tipoSkin; // Ex: "Lendária", "Mítica", "Ultimate", "Prestigio" (Poderia ser Enum)


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

    public String getChroma() {
        return chroma;
    }

    public void setChroma(String chroma) {
        this.chroma = chroma;
    }

    public String getTipoSkin() {
        return tipoSkin;
    }

    public void setTipoSkin(String tipoSkin) {
        this.tipoSkin = tipoSkin;
    }
}
