package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.TipoPlano;
import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
public class PlanoAssinatura{

    @Id
    @GeneratedValue(generator = "UUID") // <--- ADICIONAR ESTA LINHA
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private TipoPlano nome;

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

    public TipoPlano getNome() {
        return nome;
    }

    public void setNome(TipoPlano nome) {
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
