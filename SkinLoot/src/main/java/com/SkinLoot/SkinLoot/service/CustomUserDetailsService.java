package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String nome) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByNome(nome)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + nome));

        return new org.springframework.security.core.userdetails.User(
                usuario.getNome(),
                usuario.getSenha(),
                Collections.singletonList(new SimpleGrantedAuthority(usuario.getRole().name()))
        );
    }
}

