package com.SkinLoot.SkinLoot.dto;

import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.enums.Qualidade;
import com.SkinLoot.SkinLoot.model.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public class AnuncioResponse {
    private UUID id;
    private String titulo;
    private String descricao;
    private BigDecimal preco;
    private Long skinId; // Agora é o ID da Steam (Long)
    private String skinIcon;
    private String skinNome;
    private String planoNome; // ✅ Novo campo
    private Status status;
    private LocalDateTime dataCriacao;
    private String usuarioNome;
    private int likesCount;
    private Map<String, Object> detalhesEspecificos;


    public AnuncioResponse() {
    }

    public AnuncioResponse(Anuncio anuncio) {
        this.id = anuncio.getId();
        this.titulo = anuncio.getTitulo();
        this.descricao = anuncio.getDescricao();
        this.preco = anuncio.getPreco();
        this.status = anuncio.getStatus();
        this.dataCriacao = anuncio.getDataCriacao();

        // Mapeando os campos da skin que já existem no Anuncio
        this.skinId = anuncio.getSteamItemId();
        this.skinNome = anuncio.getSkinName();
        this.skinIcon = anuncio.getSkinImageUrl();
        this.likesCount = anuncio.getLikesCount();
        this.detalhesEspecificos = anuncio.getDetalhesEspecificos(); // Mapeia o campo da entidade


        // Verifica se o usuário associado ao anúncio não é nulo
        if (anuncio.getUsuario() != null) {
            this.usuarioNome = anuncio.getUsuario().getNome();

            // --- LÓGICA PARA OBTER O NOME DO PLANO ---
            // Verifica se o plano do usuário também não é nulo antes de tentar acessá-lo
            if (anuncio.getUsuario().getPlanoAssinatura() != null) {
                this.planoNome = anuncio.getUsuario().getPlanoAssinatura().getNome().name();
            }
        }
    }

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

    public Long getSkinId() {
        return skinId;
    }

    public void setSkinId(Long skinId) {
        this.skinId = skinId;
    }

    public String getSkinIcon() {
        return skinIcon;
    }

    public void setSkinIcon(String skinIcon) {
        this.skinIcon = skinIcon;
    }

    public String getSkinNome() {
        return skinNome;
    }

    public void setSkinNome(String skinNome) {
        this.skinNome = skinNome;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public String getUsuarioNome() {
        return usuarioNome;
    }

    public void setUsuarioNome(String usuarioNome) {
        this.usuarioNome = usuarioNome;
    }

    public String getPlanoNome() {
        return planoNome;
    }

    public void setPlanoNome(String planoNome) {
        this.planoNome = planoNome;
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
