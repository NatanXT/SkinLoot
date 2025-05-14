package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.RegisterRequest;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Genero;
import com.SkinLoot.SkinLoot.model.enums.Role;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service // Define esta classe como um serviço gerenciado pelo Spring
public class UsuarioService {

    @Autowired // Injeta automaticamente a dependência do repositório
    private UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    public UsuarioService(UsuarioRepository usuarioRepository,PasswordEncoder passwordEncoder, UserDetailsService userDetailsService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
    }

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

    public UserDetails autenticar(String email, String senha) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
//        System.out.println("🔍 Buscando userDetails por email: " + email);


        if (!passwordEncoder.matches(senha, userDetails.getPassword())) {
//            System.out.println("Comparando senha recebida com a salva...");

            throw new RuntimeException("Senha inválida");
        }

        return userDetails;
    }
    public Optional<Usuario> buscarPorNome(String nome) {
        return usuarioRepository.findByNome(nome);
    }



    public Usuario cadastrarUsuario(RegisterRequest request) {
        if (usuarioRepository.findByNome(request.getNome()).isPresent()) {
            throw new RuntimeException("Username já existe");
        }

        Usuario novo = new Usuario();
        novo.setNome(request.getNome());
        novo.setGenero(Genero.valueOf(request.getGenero()));
        novo.setEmail(request.getEmail());
        novo.setSenha(passwordEncoder.encode(request.getSenha()));
        novo.setRole(Role.USER); // Padrão

        return usuarioRepository.save(novo);
    }


    @Transactional // Garante a integridade da transação ao deletar um usuário
    public void deletarUsuario(UUID id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }
}
