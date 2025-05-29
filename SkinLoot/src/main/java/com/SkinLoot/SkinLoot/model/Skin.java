package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Qualidade;
import com.SkinLoot.SkinLoot.model.enums.Raridade;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity // Define a classe como uma entidade JPA (tabela no banco de dados)
@Table(name = "skin")

public class Skin {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false) // Nome obrigatório
    @NotNull(message = "O nome não pode ser nulo") // Garante que o nome não seja nulo
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 a 100 caracteres") // Restrição do tamanho do nome
    private String nome;


    private String descricao;

//    @Column(nullable = false) // Preço obrigatório
//    @NotNull(message = "O preço não pode ser nulo") // Garante que o preço não seja nulo
//    @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero") // Define um valor mínimo válido
//    private BigDecimal preco;

    @Enumerated(EnumType.STRING) // Define a raridade como um Enum armazenado como String
    @Column(nullable = false) // Raridade obrigatória
    @NotNull(message = "A raridade não pode ser nula") // Garante que a raridade não seja nula
    private Raridade raridade;

    @ManyToOne // Muitas skins podem pertencer a um jogo
    @JoinColumn(name = "jogo_nome", nullable = false) // Chave estrangeira para Jogo
    @NotNull(message = "O jogo não pode ser nulo") // Garante que a skin esteja associada a um jogo
    private Jogo jogo;

    @ManyToOne // Muitas skins podem pertencer a um usuário (dono)
    @JoinColumn(name = "usuario_id", nullable = false) // Chave estrangeira para Usuario
    @NotNull(message = "O usuário não pode ser nulo") // Garante que a skin tenha um dono
    private Usuario usuario;

    @Column(nullable = false) // Ícone da skin (URL da imagem)
    @NotNull(message = "O ícone da skin não pode ser nulo") // Garante que o ícone não seja nulo
    private String icon;

    private String assetId; // Opcional para CS:GO

    private Double desgastefloat; // Opcional para CS:GO

    @Enumerated(EnumType.STRING)
    private Qualidade qualidade; // Opcional para CS:GO

    // Getters e Setters


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

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public Raridade getRaridade() {
        return raridade;
    }

    public void setRaridade(Raridade raridade) {
        this.raridade = raridade;
    }

    public Jogo getJogo() {
        return jogo;
    }

    public void setJogo(Jogo jogo) {
        this.jogo = jogo;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getAssetId() {
        return assetId;
    }

    public void setAssetId(String assetId) {
        this.assetId = assetId;
    }

    public Double getDesgastefloat() {
        return desgastefloat;
    }

    public void setDesgastefloat(Double desgastefloat) {
        this.desgastefloat = desgastefloat;
    }

    public Qualidade getQualidade() {
        return qualidade;
    }

    public void setQualidade(Qualidade qualidade) {
        this.qualidade = qualidade;
    }
}

