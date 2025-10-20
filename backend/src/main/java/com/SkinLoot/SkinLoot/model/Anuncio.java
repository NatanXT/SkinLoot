package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Status;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Entity
public class Anuncio {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    private String titulo;
    private String descricao;
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    private Status status;

    // Catálogo (desnormalizado)
    private String skinName;
    private String skinImageUrl;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skin_id", nullable = true) // ✅ A chave é nullable = true
    private Skin skin;

    private LocalDateTime dataCriacao;

    @OneToMany(mappedBy = "anuncio", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AnuncioLike> likes;

    @Formula("(select count(*) from anuncio_like al where al.anuncio_id = id)")
    private int likesCount;

    @JdbcTypeCode(SqlTypes.JSON)                // Informa ao Hibernate o tipo JDBC a ser usado
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> detalhesEspecificos;


    public Anuncio() {
    }


    public Anuncio(UUID id, String titulo, String descricao, BigDecimal preco, Status status,
            String skinName, String skinImageUrl, Usuario usuario, Skin skin, LocalDateTime dataCriacao,
            Long steamItemId, Set<AnuncioLike> likes, int likesCount, Map<String, Object> detalhesEspecificos) {


        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.preco = preco;
        this.status = status;
        this.skinName = skinName;
        this.skinImageUrl = skinImageUrl;
        this.usuario = usuario;
        this.skin = skin;
        this.dataCriacao = dataCriacao;
        this.likes = likes;
        this.likesCount = likesCount;
        this.detalhesEspecificos = detalhesEspecificos;
    }

    /** Construtor auxiliar usado em relações (precisa setar o id!). */
    public Anuncio(UUID anuncioId) {
        this.id = anuncioId;
    }

    // GETTERS E SETTERS

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPreco() {
        return preco;
    }

    public void setPreco(BigDecimal preco) {
        this.preco = preco;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getSkinName() {
        return skinName;
    }

    public void setSkinName(String skinName) {
        this.skinName = skinName;
    }

    public String getSkinImageUrl() {
        return skinImageUrl;
    }

    public void setSkinImageUrl(String skinImageUrl) {
        this.skinImageUrl = skinImageUrl;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Skin getSkin() {
        return skin;
    }

    public void setSkin(Skin skin) {
        this.skin = skin;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public Set<AnuncioLike> getLikes() {
        return likes;
    }

    public void setLikes(Set<AnuncioLike> likes) {
        this.likes = likes;
    }

    public int getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(int likesCount) {
        this.likesCount = likesCount;
    }

    public Map<String, Object> getDetalhesEspecificos() {
        return detalhesEspecificos;
    }
    public void setDetalhesEspecificos(Map<String, Object> detalhesEspecificos) {
        this.detalhesEspecificos = detalhesEspecificos;
    }



}
