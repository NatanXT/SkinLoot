package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Status;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * Entidade que representa um anúncio de venda de skin.
 * Agora com suporte a imagem em Base64 bruto (além de URL).
 */
@Entity
@Table(name = "anuncio")
public class Anuncio {

    // ===================== Identificação =====================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // ===================== Dados principais =====================
    private String titulo;

    @Column(columnDefinition = "text")
    private String descricao;

    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    private Status status;

    // Catálogo (campos desnormalizados para exibição)
    private String skinName;

    // URL pública da imagem (fallback quando não usamos Base64)
    @Column(name = "skin_image_url")
    private String skinImageUrl;

    // ======== NOVOS CAMPOS PARA BASE64 =========
    /** Conteúdo Base64 cru (apenas a parte depois da vírgula do data URL). */
    @Column(name = "skin_image_b64", columnDefinition = "text")
    private String skinImageBase64;

    /** Mime type correspondente ao Base64 (ex.: image/png, image/jpeg). */
    @Column(name = "skin_image_mime", length = 100)
    private String skinImageMime;
    // ===========================================

    // Atributo adicional da instância
    private String qualidade;

    // ===================== Relacionamentos =====================
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skin_id", nullable = true) // a relação é opcional
    private Skin skin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jogo_id")
    private Jogo jogo;

    private LocalDateTime dataCriacao;

    @OneToMany(mappedBy = "anuncio", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AnuncioLike> likes;

    @Formula("(select count(*) from anuncio_like al where al.anuncio_id = id)")
    private int likesCount;

    @OneToOne(mappedBy = "anuncio", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true, orphanRemoval = true)
    private AnuncioCsgo2 detalhesCsgo;

    @OneToOne(mappedBy = "anuncio", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = true, orphanRemoval = true)
    private AnuncioLol detalhesLol;

    // ===================== Construtores =====================
    public Anuncio() {
    }

    public Anuncio(
            UUID id,
            String titulo,
            String descricao,
            BigDecimal preco,
            Status status,
            String skinName,
            String skinImageUrl,
            Usuario usuario,
            Skin skin,
            Jogo jogo,
            LocalDateTime dataCriacao,
            Long steamItemId, // (mantido conforme sua assinatura anterior)
            Set<AnuncioLike> likes,
            int likesCount,
            AnuncioCsgo2 detalhesCsgo,
            AnuncioLol detalhesLol
            ) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.preco = preco;
        this.status = status;
        this.skinName = skinName;
        this.skinImageUrl = skinImageUrl;
        this.usuario = usuario;
        this.skin = skin;
        this.jogo = jogo;
        this.dataCriacao = dataCriacao;
        this.likes = likes;
        this.likesCount = likesCount;
        this.detalhesCsgo = detalhesCsgo;
        this.detalhesLol = detalhesLol;
    }

    /** Construtor auxiliar usado em relações (precisa setar o id!). */
    public Anuncio(UUID anuncioId) {
        this.id = anuncioId;
    }

    // ===================== Helper de exibição =====================
    /**
     * Retorna a imagem pronta para o front consumir em &lt;img src="..."&gt;.
     * Se houver Base64, devolve "data:&lt;mime&gt;;base64,&lt;conteudo&gt;",
     * caso contrário, retorna a URL (pode ser nula).
     */
    @Transient
    public String getSkinImageDataUrl() {
        if (skinImageBase64 != null && !skinImageBase64.isBlank()) {
            String mime = (skinImageMime != null && !skinImageMime.isBlank()) ? skinImageMime : "image/*";
            return "data:" + mime + ";base64," + skinImageBase64;
        }
        return skinImageUrl;
    }

    // ===================== Getters / Setters =====================
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

    public String getSkinImageBase64() {
        return skinImageBase64;
    }

    public void setSkinImageBase64(String skinImageBase64) {
        this.skinImageBase64 = skinImageBase64;
    }

    public String getSkinImageMime() {
        return skinImageMime;
    }

    public void setSkinImageMime(String skinImageMime) {
        this.skinImageMime = skinImageMime;
    }

    public String getQualidade() {
        return qualidade;
    }

    public void setQualidade(String qualidade) {
        this.qualidade = qualidade;
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

    public Jogo getJogo() {
        return jogo;
    }

    public void setJogo(Jogo jogo) {
        this.jogo = jogo;
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

    public AnuncioCsgo2 getDetalhesCsgo() {
        return detalhesCsgo;
    }

    public void setDetalhesCsgo(AnuncioCsgo2 detalhesCsgo) {
        this.detalhesCsgo = detalhesCsgo;
    }

    public AnuncioLol getDetalhesLol() {
        return detalhesLol;
    }

    public void setDetalhesLol(AnuncioLol detalhesLol) {
        this.detalhesLol = detalhesLol;
    }
}
