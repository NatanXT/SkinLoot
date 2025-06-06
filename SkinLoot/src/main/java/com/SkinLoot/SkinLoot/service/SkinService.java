package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.SkinResponse;
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

    private SkinResponse toDto(Skin s) {
        return new SkinResponse(
                s.getId(),
                s.getNome(),
                s.getDescricao(),
                s.getIcon(),
                s.getRaridade(),
                s.getQualidade(),
                s.getDesgastefloat(),
                s.getAssetId(),
                s.getJogo().getId(),
                s.getJogo().getNome()
        );
    }

    public SkinResponse salvarERetornarDto(Skin skin) {
        Skin salva = skinRepository.save(skin);
        return toDto(salva); // usa o método privado
    }


    public Skin salvar(Skin skin) {
        return skinRepository.save(skin);
    }

    public List<SkinResponse> listarPorUsuario(UUID usuarioId) {
        return skinRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toDto)
                .toList();
    }


    public List<SkinResponse> listarPorJogo(UUID jogoId) {
        return skinRepository.findByJogoId(jogoId).stream()
                .map(this::toDto)
                .toList();
    }

    public List<SkinResponse> listarTodas() {
        return skinRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }



    public Optional<Skin> buscarPorId(UUID id) {
        return skinRepository.findById(id);
    }
}

