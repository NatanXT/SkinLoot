package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.SkinResponse;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
//@RequiredArgsConstructor // Forma moderna de injeção de dependência com Lombok
public class SkinService {

    private final SkinRepository skinRepository;

    public SkinService(SkinRepository skinRepository) {
        this.skinRepository = skinRepository;
    }

    // ✅ O método privado "toDto" foi REMOVIDO! Ele não é mais necessário.

    public SkinResponse salvarERetornarDto(Skin skin) {
        Skin skinSalva = skinRepository.save(skin);
        // Chama o construtor diretamente. Simples e limpo.
        return new SkinResponse(skinSalva);
    }

    public Skin salvar(Skin skin) {
        return skinRepository.save(skin);
    }

    public List<SkinResponse> listarPorUsuario(UUID usuarioId) {
        return skinRepository.findByUsuarioId(usuarioId).stream()
                .map(SkinResponse::new) // ✅ Forma correta e moderna de mapear
                .collect(Collectors.toList());
    }

    public List<SkinResponse> listarPorJogo(UUID jogoId) {
        return skinRepository.findByJogoId(jogoId).stream()
                .map(SkinResponse::new) // ✅ Forma correta e moderna de mapear
                .collect(Collectors.toList());
    }

    public List<SkinResponse> listarTodas() {
        return skinRepository.findAll().stream()
                .map(SkinResponse::new) // ✅ Forma correta e moderna de mapear
                .collect(Collectors.toList());
    }

    public Optional<Skin> buscarPorId(UUID id) {
        return skinRepository.findById(id);
    }
}
