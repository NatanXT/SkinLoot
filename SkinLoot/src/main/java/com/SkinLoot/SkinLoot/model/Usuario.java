package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.UUID;

@Entity // Define a classe como uma entidade JPA (tabela no banco de dados)
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Gera automaticamente um UUID para o ID
    private UUID id;

    @Column(nullable = false) // Nome obrigatório
    private String nome;

    @Column(nullable = false, unique = true) // E-mail único e obrigatório
    private String email;

    @Column(nullable = false) // Senha obrigatória
    private String senha;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true) 
    // Relacionamento de um usuário para várias skins, remoção em cascata
    private List<Skin> skins;
    

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public List<Skin> getSkins() {
        return skins;
    }

    public void setSkins(List<Skin> skins) {
        this.skins = skins;
    }
}
