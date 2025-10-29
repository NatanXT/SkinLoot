package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class AnuncioDetalhesLol{

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

}
