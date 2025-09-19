package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Plataforma;
import com.SkinLoot.SkinLoot.model.enums.StatusTransacao;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "anuncio_id", nullable = false)
    private Anuncio anuncio;

    @ManyToOne
    @JoinColumn(name = "comprador_id", nullable = false)
    private Usuario comprador;

    @ManyToOne
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @Enumerated(EnumType.STRING)
    private StatusTransacao status;

    @Enumerated(EnumType.STRING)
    private Plataforma tipoPlataforma;

    private String idTradeOferta; // Opcional, ex: tradeofferid da Steam

    private LocalDateTime dataInicio;
    private LocalDateTime dataConclusao;

    private String observacao;

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

    public Usuario getVendedor() {
        return vendedor;
    }

    public void setVendedor(Usuario vendedor) {
        this.vendedor = vendedor;
    }

    public Usuario getComprador() {
        return comprador;
    }

    public void setComprador(Usuario comprador) {
        this.comprador = comprador;
    }

    public StatusTransacao getStatus() {
        return status;
    }

    public void setStatus(StatusTransacao status) {
        this.status = status;
    }

    public Plataforma getTipoPlataforma() {
        return tipoPlataforma;
    }

    public void setTipoPlataforma(Plataforma tipoPlataforma) {
        this.tipoPlataforma = tipoPlataforma;
    }

    public String getIdTradeOferta() {
        return idTradeOferta;
    }

    public void setIdTradeOferta(String idTradeOferta) {
        this.idTradeOferta = idTradeOferta;
    }

    public LocalDateTime getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDateTime dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDateTime getDataConclusao() {
        return dataConclusao;
    }

    public void setDataConclusao(LocalDateTime dataConclusao) {
        this.dataConclusao = dataConclusao;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
