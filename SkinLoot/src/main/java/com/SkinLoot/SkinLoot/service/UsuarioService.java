package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.RegisterRequest;
import com.SkinLoot.SkinLoot.model.PlanoAssinatura;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Genero;
import com.SkinLoot.SkinLoot.model.enums.Role;
import com.SkinLoot.SkinLoot.model.enums.TipoPlano;
import com.SkinLoot.SkinLoot.repository.PlanoAssinaturaRepository;
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
    private PlanoAssinaturaRepository planoAssinaturaRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    public UsuarioService(UsuarioRepository usuarioRepository,PasswordEncoder passwordEncoder, UserDetailsService userDetailsService, PlanoAssinaturaRepository planoAssinaturaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.planoAssinaturaRepository = planoAssinaturaRepository;
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



    @Transactional
    public Usuario cadastrarUsuario(RegisterRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        // 1. Busque o plano padrão no banco de dados.
        //    Isso garante que o plano "Gratuito" deve existir na sua tabela.
        TipoPlano tipoPlano = TipoPlano.valueOf("GRATUITO");
        PlanoAssinatura planoPadrao = planoAssinaturaRepository.findByNome(tipoPlano.GRATUITO)
                .orElseThrow(() -> new RuntimeException("Plano de assinatura padrão 'Gratuito' não encontrado no banco de dados."));

        // 2. Crie o novo usuário
        Usuario novo = new Usuario();
        novo.setNome(request.getNome());
        novo.setGenero(Genero.valueOf(request.getGenero().toUpperCase())); // Garante o enum em maiúsculo
        novo.setEmail(request.getEmail());
        novo.setSenha(passwordEncoder.encode(request.getSenha()));
        novo.setRole(Role.USER);

        // 3. Atribua o plano padrão ao novo usuário
        novo.setPlanoAssinatura(planoPadrao);

        // 4. Salve o usuário. O plano será associado automaticamente.
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
