package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.*;
import com.SkinLoot.SkinLoot.dto.SkinResponse;
import com.SkinLoot.SkinLoot.repository.InteracaoUsuarioSkinRepository;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecomendacaoService {

    @Autowired
    private InteracaoUsuarioSkinRepository interacaoRepo;

    @Autowired
    private SkinRepository skinRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<SkinResponse> recomendarSkins(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<InteracaoUsuarioSkin> interacoes = interacaoRepo.findByUsuarioOrderByDataHoraDesc(usuario);

        if (interacoes.isEmpty()) return List.of(); // nenhuma recomendação

        // Agrupar por RARIDADE mais frequente
        Map<Raridade, Long> contagem = interacoes.stream()
                .map(i -> i.getSkin().getRaridade())
                .collect(Collectors.groupingBy(r -> r, Collectors.counting()));

        Raridade preferida = contagem.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        List<Skin> recomendadas = skinRepository.findAll().stream()
                .filter(s -> s.getRaridade().equals(preferida))
                .limit(10)
                .toList();

        return recomendadas.stream().map(SkinResponse::new).collect(Collectors.toList());
    }
}
