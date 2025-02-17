package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service // Define esta classe como um serviço gerenciado pelo Spring
public class UsuarioService {

    @Autowired // Injeta automaticamente a dependência do repositório
    private UsuarioRepository usuarioRepository;

    // Retorna uma lista de todos os usuários cadastrados
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    // Busca um usuário pelo ID
    public Optional<Usuario> buscarUsuarioPorId(UUID id) {
        return usuarioRepository.findById(id);
    }

    // Busca um usuário pelo e-mail
    public Optional<Usuario> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    @Transactional // Garante a integridade da transação ao criar um usuário
    public Usuario criarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("E-mail já cadastrado");
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional // Garante a integridade da transação ao atualizar um usuário
    public Usuario atualizarUsuario(UUID id, Usuario usuarioAtualizado) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        usuarioAtualizado.setId(id);
        return usuarioRepository.save(usuarioAtualizado);
    }

    @Transactional // Garante a integridade da transação ao deletar um usuário
    public void deletarUsuario(UUID id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}