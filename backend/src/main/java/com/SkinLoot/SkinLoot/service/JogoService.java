package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.repository.JogoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service // Define esta classe como um serviço gerenciado pelo Spring
public class JogoService {
    
    @Autowired // Injeta automaticamente a dependência do repositório
    private JogoRepository jogoRepository;
    
    // Criar um novo jogo
    @Transactional
    public Jogo criarJogo(Jogo jogo) {
        if (jogoRepository.existsByNome(jogo.getNome())) {
            throw new IllegalArgumentException("Já existe um jogo com esse nome.");
        }
        return jogoRepository.save(jogo);
    }

    public Optional<Jogo> buscarPorId(UUID id) {
        return jogoRepository.findById(id);
    }
    // Listar todos os jogos
    public List<Jogo> listarJogos() {
        return jogoRepository.findAll();
    }

    // Buscar um jogo pelo ID
    public Optional<Jogo> buscarJogoPorId(UUID id) {
        return jogoRepository.findById(id);
    }

    // Atualizar um jogo existente
    @Transactional
    public Jogo atualizarJogo(UUID id, Jogo jogoAtualizado) {
        if (!jogoRepository.existsById(id)) {
            throw new IllegalArgumentException("Jogo não encontrado.");
        }
        jogoAtualizado.setId(id);
        return jogoRepository.save(jogoAtualizado);
    }

    // Deletar um jogo pelo ID
    @Transactional
    public void deletarJogo(UUID id) {
        if (!jogoRepository.existsById(id)) {
            throw new IllegalArgumentException("Jogo não encontrado.");
        }
        jogoRepository.deleteById(id);
    }
}
