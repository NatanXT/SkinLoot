package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Plataforma;
import com.SkinLoot.SkinLoot.model.enums.StatusTransacao;
import jakarta.persistence.*;
import org.springframework.data.annotation.Id;

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
}
