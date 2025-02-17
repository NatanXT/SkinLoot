package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkinService {

    @Autowired
    private SkinRepository skinRepository;

    // Listar todas as skins
    public List<Skin> listarSkins() {
        return skinRepository.findAll();
    }

    // Buscar uma skin pelo ID
    public Optional<Skin> buscarSkinPorId(Long id) {
        return skinRepository.findById(id);
    }

    // Criar uma nova skin
    public Skin criarSkin(Skin skin) {
        return skinRepository.save(skin);
    }

    // Atualizar uma skin existente
    public Optional<Skin> atualizarSkin(Long id, Skin skinAtualizada) {
        if (!skinRepository.existsById(id)) {
            return Optional.empty();
        }
        skinAtualizada.setId(id);
        return Optional.of(skinRepository.save(skinAtualizada));
    }

    // Deletar uma skin pelo ID
    public boolean deletarSkin(Long id) {
        if (!skinRepository.existsById(id)) {
            return false;
        }
        skinRepository.deleteById(id);
        return true;
    }

    // Buscar skins por jogo
    public List<Skin> buscarSkinsPorJogo(Long jogoId) {
        return skinRepository.findByJogoId(jogoId);
    }

    // Buscar skins por usuário (dono)
    public List<Skin> buscarSkinsPorUsuario(Long usuarioId) {
        return skinRepository.findByUsuarioId(usuarioId);
    }
}
