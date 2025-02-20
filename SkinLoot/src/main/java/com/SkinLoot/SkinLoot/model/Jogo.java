package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.List;
import java.util.UUID;

@Entity // Define que esta classe representa uma tabela no banco de dados
public class Jogo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Gera automaticamente um UUID como ID único
    private UUID id;

    @Column(nullable = false, unique = true) // O nome do jogo é obrigatório e deve ser único
    @NotNull(message = "O nome do jogo não pode ser nulo") // Valida que o nome não seja nulo
    @Size(min = 3, max = 100, message = "O nome deve ter entre 3 a 100 caracteres") // Restringe o tamanho do nome
    private String nome;
    
    @Enumerated(EnumType.STRING) // Armazena a categoria como string no banco de dados
    @Column(nullable = false) // A categoria do jogo é obrigatória
    @NotNull(message = "A categoria do jogo não pode ser nula") // Valida que a categoria não seja nula
    private CategoriaJogo categoria;
    
    @OneToMany(mappedBy = "jogo", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // Um jogo pode ter várias skins associadas a ele
    // CascadeType.ALL: Se o jogo for deletado, suas skins também são removidas
    // orphanRemoval = true: Remove skins órfãs automaticamente
    // FetchType.LAZY: As skins só são carregadas quando necessário, otimizando a performance
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

    public CategoriaJogo getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaJogo categoria) {
        this.categoria = categoria;
    }

    public List<Skin> getSkins() {
        return skins;
    }

    public void setSkins(List<Skin> skins) {
        this.skins = skins;
    }
}
