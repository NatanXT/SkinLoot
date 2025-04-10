package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*; // Importa as anotações JPA (@Entity, @Id, @GeneratedValue, @Column)
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity // Define que esta classe representa uma tabela no banco de dados
public class CategoriaJogo{

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Gera automaticamente um UUID como ID único
    private UUID id;

    @Column(nullable = false, unique = true) // O nome da categoria deve ser único
    @NotNull(message = "O nome da CategoriaJogo não pode ser nulo") // Valida que o nome não seja nulo
    private String nome;

    @ManyToMany(mappedBy = "categorias")
    private List<Jogo> jogos;

    public CategoriaJogo(){

    }

    // Getters e Setters
    public UUID getId(){
        return id;
    }

    public void setId(UUID id){
        this.id = id;
    }

    public String getNome(){
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
