package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
public class PlanoAssinatura {

    @Id
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;
    private String nome;
    private BigDecimal precoMensal;
    private int limiteAnuncios;
    private boolean destaqueAnuncio;

    public PlanoAssinatura() {
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

    public BigDecimal getPrecoMensal() {
        return precoMensal;
    }

    public void setPrecoMensal(BigDecimal precoMensal) {
        this.precoMensal = precoMensal;
    }

    public int getLimiteAnuncios() {
        return limiteAnuncios;
    }

    public void setLimiteAnuncios(int limiteAnuncios) {
        this.limiteAnuncios = limiteAnuncios;
    }

    public boolean isDestaqueAnuncio() {
        return destaqueAnuncio;
    }

    public void setDestaqueAnuncio(boolean destaqueAnuncio) {
        this.destaqueAnuncio = destaqueAnuncio;
    }
}
