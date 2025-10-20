package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.RegisterRequest;
import com.SkinLoot.SkinLoot.model.PlanoAssinatura;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Genero;
import com.SkinLoot.SkinLoot.model.enums.Role;
import com.SkinLoot.SkinLoot.model.enums.StatusAssinatura;
import com.SkinLoot.SkinLoot.model.enums.TipoPlano;
import com.SkinLoot.SkinLoot.repository.PlanoAssinaturaRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PlanoAssinaturaRepository planoAssinaturaRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsService userDetailsService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            UserDetailsService userDetailsService,
            PlanoAssinaturaRepository planoAssinaturaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsService = userDetailsService;
        this.planoAssinaturaRepository = planoAssinaturaRepository;
    }

    // ---------- Consultas básicas ----------
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> buscarUsuarioPorId(UUID id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Optional<Usuario> buscarPorNome(String nome) {
        return usuarioRepository.findByNome(nome);
    }

    // ---------- Autenticação ----------
    public UserDetails autenticar(String email, String senha) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (!passwordEncoder.matches(senha, userDetails.getPassword())) {
            throw new RuntimeException("Senha inválida");
        }
        return userDetails;
    }

    // ---------- Cadastro normal ----------
    @Transactional
    public Usuario cadastrarUsuario(RegisterRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        PlanoAssinatura planoPadrao = planoAssinaturaRepository.findByNome(TipoPlano.GRATUITO)
                .orElseThrow(() -> new RuntimeException(
                        "Plano de assinatura padrão 'Gratuito' não encontrado no banco de dados."));

        Usuario novo = new Usuario();
        novo.setNome(request.getNome());
        novo.setGenero(Genero.valueOf(request.getGenero().toUpperCase(Locale.ROOT)));
        novo.setEmail(request.getEmail());
        novo.setSenha(passwordEncoder.encode(request.getSenha()));
        novo.setRole(Role.USER);
        novo.setPlanoAssinatura(planoPadrao);
        novo.setStatusAssinatura(StatusAssinatura.ATIVA);
        novo.setDataExpira(LocalDate.now().plusYears(100));

        return usuarioRepository.save(novo);
    }

    // ---------- Remoção ----------
    @Transactional
    public void deletarUsuario(UUID id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        usuarioRepository.deleteById(id);
    }

    // ---------- DEV: criar/atualizar usuário por e-mail + plano ----------
    @Transactional
    public Usuario criarOuAtualizarDev(String email, String nome, String planoKey) {
        final String emailNorm = email.trim().toLowerCase(Locale.ROOT);
        final String planoNorm = (planoKey == null ? "gratuito" : planoKey.trim().toLowerCase(Locale.ROOT));

        // Mapeia string -> enum do seu modelo
        final TipoPlano tipoPlano = mapPlano(planoNorm);

        // Busca o PlanoAssinatura correspondente
        PlanoAssinatura plano = planoAssinaturaRepository.findByNome(tipoPlano)
                .orElseThrow(() -> new RuntimeException(
                        "Plano '" + tipoPlano + "' não encontrado. Cadastre na tabela de planos."));

        Usuario u = usuarioRepository.findByEmail(emailNorm).orElse(null);
        if (u == null) {
            // cria novo
            u = new Usuario();
            u.setEmail(emailNorm);
            u.setNome(nome != null ? nome.trim() : "Usuário DEV");
            // senha dummy para DEV
            u.setSenha(passwordEncoder.encode("dev123456"));
            u.setRole(Role.USER);
        } else {
            // atualiza nome (opcional)
            if (nome != null && !nome.isBlank()) {
                u.setNome(nome.trim());
            }
        }

        // aplica/atualiza o plano
        u.setPlanoAssinatura(plano);

        return usuarioRepository.save(u);
    }

    private TipoPlano mapPlano(String key) {
        switch (key.toLowerCase(Locale.ROOT)) {
            case "plus":
                return TipoPlano.PLUS;
            case "intermediario":
            case "intermediário":
                return TipoPlano.INTERMEDIARIO;
            case "gratuito":
            default:
                return TipoPlano.GRATUITO;
        }
    }
}
