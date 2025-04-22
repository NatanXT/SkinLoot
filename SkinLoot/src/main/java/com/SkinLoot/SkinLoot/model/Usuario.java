package com.SkinLoot.SkinLoot.model;

import com.SkinLoot.SkinLoot.model.enums.Genero;
import com.SkinLoot.SkinLoot.model.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Entity // Define a classe como uma entidade JPA (tabela no banco de dados)
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Gera automaticamente um UUID para o ID
    private UUID id;

    @Column(nullable = false) // Nome obrigatório
    @NotNull(message = "O nome não pode ser nulo")// Garante que o nome não seja nulo
    @Size(min = 3, max = 65, message = "O nome deve ter entre 3 a 65 caracteres")// Restrição do tamanho do nome
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Genero genero;

    @Column(nullable = false, unique = true) // E-mail único e obrigatório
    @NotNull(message = "O e-mail não pode ser nulo") // Garante que o e-mail não seja nulo
    @Email(message = "E-mail inválido ou inexistente") // Validação de e-mail
    private String email;

    @Column(nullable = false) // Senha obrigatória
    @NotNull(message = "A senha não pode ser nula") // Garante que a senha não seja nula
    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres") // Define um tamanho mínimo para senha
    private String senha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;



    @OneToMany(mappedBy = "usuario", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true, fetch = FetchType.LAZY) 
    // Um usuário pode possuir várias skins associadas a ele
    // CascadeType.PERSIST: Permite que novas skins sejam salvas automaticamente ao serem associadas a um usuário
    // CascadeType.MERGE: Permite que skins existentes sejam atualizadas ao serem associadas a um usuário
    // orphanRemoval = true: Remove skins órfãs automaticamente ao serem desvinculadas do usuário
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

    public Genero getGenero() {
        return genero;
    }

    public void setGenero(Genero genero) {
        this.genero = genero;
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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
