package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.AvaliacaoRequest;
import com.SkinLoot.SkinLoot.dto.AvaliacaoResponse;
import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.Avaliacao;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.AnuncioRepository;
import com.SkinLoot.SkinLoot.repository.AvaliacaoRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AvaliacaoService{

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AnuncioRepository anuncioRepository;

    public AvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                            UsuarioRepository usuarioRepository,
                            AnuncioRepository anuncioRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.anuncioRepository = anuncioRepository;
    }

    @Transactional
    public Avaliacao criarAvaliacao(String emailAvaliador, AvaliacaoRequest request) {

        // 1. Encontrar o Avaliador (usuário logado)
        Usuario avaliador = usuarioRepository.findByEmail(emailAvaliador)
                .orElseThrow(() -> new RuntimeException("Usuário avaliador não encontrado."));

        // 2. Encontrar o Anúncio
        Anuncio anuncio = anuncioRepository.findById(request.getAnuncioId())
                .orElseThrow(() -> new RuntimeException("Anúncio não encontrado."));

        // 3. Encontrar o Avaliado (vendedor do anúncio)
        Usuario avaliado = anuncio.getUsuario();

        // 4. Validação: Ninguém pode avaliar a si mesmo
        if (avaliador.getId().equals(avaliado.getId())) {
            throw new RuntimeException("Você não pode avaliar seu próprio anúncio.");
        }

        // 5. Validação: Evitar spam (1 avaliação por usuário por anúncio)
        boolean jaAvaliou = avaliacaoRepository.existsByAvaliadorAndAnuncio(avaliador, anuncio);
        if (jaAvaliou) {
            throw new RuntimeException("Você já avaliou esta negociação.");
        }

        // 6. Criar e salvar a entidade
        Avaliacao novaAvaliacao = new Avaliacao();
        novaAvaliacao.setAvaliador(avaliador);
        novaAvaliacao.setAvaliado(avaliado);
        novaAvaliacao.setAnuncio(anuncio);
        novaAvaliacao.setNota(request.getNota());
        novaAvaliacao.setComentario(request.getComentario());

        return avaliacaoRepository.save(novaAvaliacao);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponse> listarPorAvaliado(UUID avaliadoId) {

        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadoIdOrderByDataCriacaoDesc(avaliadoId);

        return avaliacoes.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private AvaliacaoResponse toDto(Avaliacao entity) {
        AvaliacaoResponse dto = new AvaliacaoResponse(entity);
        dto.setId(entity.getId());
        dto.setAvaliadoId(entity.getAvaliado().getId());
        dto.setAvaliadorId(entity.getAvaliador().getId());

        // --- PREENCHENDO OS DADOS QUE FALTAVAM ---
        // 1. Nome do Avaliador (Comprador)
        if (entity.getAvaliador() != null) {
            dto.setAvaliadorNome(entity.getAvaliador().getNome());
        } else {
            dto.setAvaliadorNome("Usuário Deletado");
        }

        // 2. Comentário e Nota
        dto.setComentario(entity.getComentario()); // Certifique-se que na Entity o campo é 'comentario'
        dto.setNota(entity.getNota());
        // -----------------------------------------

        if (entity.getAnuncio() != null) {
            dto.setAnuncioId(entity.getAnuncio().getId());
        }

        dto.setDataCriacao(entity.getDataCriacao());

        return dto;
    }
}
