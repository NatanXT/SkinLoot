package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Raridade;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity // Define a classe como uma entidade JPA (tabela no banco de dados)
public class Skin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Gera automaticamente um ID único
    private Long id;

    @Column(nullable = false) // Nome obrigatório
    @NotNull(message = "O nome não pode ser nulo") // Garante que o nome não seja nulo
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 a 100 caracteres") // Restrição do tamanho do nome
    private String nome;
//
//    @Column(nullable = false) // Preço obrigatório
//    @NotNull(message = "O preço não pode ser nulo") // Garante que o preço não seja nulo
//    @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero") // Define um valor mínimo válido
//    private BigDecimal preco;

    @Enumerated(EnumType.STRING) // Define a raridade como um Enum armazenado como String
    @Column(nullable = false) // Raridade obrigatória
    @NotNull(message = "A raridade não pode ser nula") // Garante que a raridade não seja nula
    private Raridade raridade;

    @ManyToOne // Muitas skins podem pertencer a um jogo
    @JoinColumn(name = "jogo_id", nullable = false) // Chave estrangeira para Jogo
    @NotNull(message = "O jogo não pode ser nulo") // Garante que a skin esteja associada a um jogo
    private Jogo jogo;

    @ManyToOne // Muitas skins podem pertencer a um usuário (dono)
    @JoinColumn(name = "usuario_id", nullable = false) // Chave estrangeira para Usuario
    @NotNull(message = "O usuário não pode ser nulo") // Garante que a skin tenha um dono
    private Usuario usuario;

    @Column(nullable = false) // Ícone da skin (URL da imagem)
    @NotNull(message = "O ícone da skin não pode ser nulo") // Garante que o ícone não seja nulo
    private String icon;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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
}

