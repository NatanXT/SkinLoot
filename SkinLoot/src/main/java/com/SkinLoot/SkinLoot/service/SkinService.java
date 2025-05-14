package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SkinService {

    @Autowired
    private SkinRepository skinRepository;

    public Skin salvar(Skin skin) {
        return skinRepository.save(skin);
    }

    public List<Skin> listarPorUsuario(UUID usuarioId) {
        return skinRepository.findByUsuarioId(usuarioId);
    }

    public List<Skin> listarPorJogo(UUID jogoId) {
        return skinRepository.findByJogoId(jogoId);
    }

    public Optional<Skin> buscarPorId(UUID id) {
        return skinRepository.findById(id);
    }
}

