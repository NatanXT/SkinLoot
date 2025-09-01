package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Status;
import jakarta.persistence.*;
import org.hibernate.annotations.Formula;
import org.hibernate.annotations.GenericGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
public class Anuncio {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // --- Campos do seu formulário ---
    private String titulo;
    private String descricao;
    private BigDecimal preco;

    @Enumerated(EnumType.STRING)
    private Status status;

    // --- Campos que substituem a relação com a entidade Skin ---
    private Long steamItemId; // O ID do item que vem da API da Steam
    private String skinName;
    private String skinImageUrl;
    private String skinQuality;
    // -----------------------------------------------------------

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    private LocalDateTime dataCriacao;

    @OneToMany(mappedBy = "anuncio", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AnuncioLike> likes;

    // ✅ Esta fórmula mágica calcula os likes diretamente no banco de dados!
    @Formula("(select count(*) from anuncio_like al where al.anuncio_id = id)")
    private int likesCount;

    // Construtores, Getters e Setters para TODOS os campos acima...
    // (É importante ter todos os getters e setters para que o Spring funcione corretamente)

    public Anuncio() {}

    public Anuncio(UUID id, String titulo, String descricao, BigDecimal preco, Status status, String skinName, String skinImageUrl, String skinQuality, Usuario usuario, LocalDateTime dataCriacao, Long steamItemId,
                   Set<AnuncioLike> likes, int likesCount) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.preco = preco;
        this.status = status;
        this.skinName = skinName;
        this.skinImageUrl = skinImageUrl;
        this.skinQuality = skinQuality;
        this.usuario = usuario;
        this.dataCriacao = dataCriacao;
        this.steamItemId = steamItemId;
        this.likes = likes;
        this.likesCount = likesCount;
    }

    // GETTERS E SETTERS
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public BigDecimal getPreco() { return preco; }
    public void setPreco(BigDecimal preco) { this.preco = preco; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Long getSteamItemId() { return steamItemId; }
    public void setSteamItemId(Long steamItemId) { this.steamItemId = steamItemId; }
    public String getSkinName() { return skinName; }
    public void setSkinName(String skinName) { this.skinName = skinName; }
    public String getSkinImageUrl() { return skinImageUrl; }
    public void setSkinImageUrl(String skinImageUrl) { this.skinImageUrl = skinImageUrl; }
    public String getSkinQuality() { return skinQuality; }
    public void setSkinQuality(String skinQuality) { this.skinQuality = skinQuality; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public void setDataCriacao(LocalDateTime dataCriacao) { this.dataCriacao = dataCriacao; }
    public Set<AnuncioLike> getLikes() { return likes; }
    public void setLikes(Set<AnuncioLike> likes) { this.likes = likes; }
    public int getLikesCount() { return likesCount; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
}
