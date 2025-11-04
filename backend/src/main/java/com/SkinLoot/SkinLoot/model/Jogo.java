package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.CategoriaJogo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

@Entity // Define que esta classe representa uma tabela no banco de dados
public class Jogo {

    //Um jogo pode ter várias categorias.
    //
    //Uma categoria pode ser aplicada a vários jogos.

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Gera automaticamente um UUID como ID único
    private UUID id;

    @Column(nullable = false, unique = true) // O nome do jogo é obrigatório e deve ser único
    @NotNull(message = "O nome do jogo não pode ser nulo") // Valida que o nome não seja nulo
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 a 100 caracteres") // Restringe o tamanho do nome
    private String nome;

//    @Enumerated(EnumType.STRING)
//    private Plataforma tipoPlataforma; // STEAM, EPIC, ROBLOX, etc


    @ElementCollection(targetClass = CategoriaJogo.class)
    @CollectionTable(
            name = "jogo_categorias",
            joinColumns = @JoinColumn(name = "jogo_nome", referencedColumnName = "nome") // <- aqui está o ajuste
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria")
    private List<CategoriaJogo> categorias;
    
    @OneToMany(mappedBy = "jogo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // Um jogo pode ter várias skins associadas a ele
    // CascadeType.ALL: Se o jogo for deletado, suas skins também são removidas
    // orphanRemoval = true: Remove skins órfãs automaticamente
    // FetchType.LAZY: As skins só são carregadas quando necessário, otimizando a performance
    @JsonIgnore
    private List<Skin> skins;

    public Jogo() {
    }

    public Jogo(UUID id, String nome, List<CategoriaJogo> categorias, List<Skin> skins) {
        this.id = id;
        this.nome = nome;
        this.categorias = categorias;
        this.skins = skins;
    }

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

    public List<CategoriaJogo> getCategorias() {
        return categorias;
    }

    public void setCategorias(List<CategoriaJogo> categorias) {
        this.categorias = categorias;
    }

    public List<Skin> getSkins() {
        return skins;
    }

    public void setSkins(List<Skin> skins) {
        this.skins = skins;
    }
}
