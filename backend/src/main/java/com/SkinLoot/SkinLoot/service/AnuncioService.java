package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.AnuncioRequest;
import com.SkinLoot.SkinLoot.dto.AnuncioResponse;

import com.SkinLoot.SkinLoot.dto.MochilaPlayerDto;
import com.SkinLoot.SkinLoot.exceptions.AcessoNegadoException;
import com.SkinLoot.SkinLoot.exceptions.LimiteExcedidoException;
import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.AnuncioLike;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Status;
import com.SkinLoot.SkinLoot.model.enums.StatusAssinatura;
import com.SkinLoot.SkinLoot.repository.AnuncioLikeRepository;
import com.SkinLoot.SkinLoot.repository.AnuncioRepository;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDate;
import java.util.stream.Collectors; // Importe o Collectors



import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnuncioService {

    private final AnuncioRepository anuncioRepository;
    private final UsuarioRepository usuarioRepository;
    private final AnuncioLikeRepository anuncioLikeRepository;
    private final SkinRepository skinRepository;

    public AnuncioService(
            SkinRepository skinRepository,
            AnuncioLikeRepository anuncioLikeRepository,
            UsuarioRepository usuarioRepository,
            AnuncioRepository anuncioRepository) {
        this.skinRepository = skinRepository;
        this.anuncioLikeRepository = anuncioLikeRepository;
        this.usuarioRepository = usuarioRepository;
        this.anuncioRepository = anuncioRepository;
    }

    @Transactional
    public Anuncio criarAnuncio(AnuncioRequest request, Usuario usuario) {
        // valida skin
        // Para garantir que estamos trabalhando com a versão mais atual do usuário no banco
        Usuario usuarioAtualizado = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado para criação de anúncio."));

        // 1. Verifica se a assinatura do usuário está ativa e dentro da validade
        if (usuarioAtualizado.getStatusAssinatura() != StatusAssinatura.ATIVA || usuarioAtualizado.getDataExpira().isBefore(LocalDate.now())) {
            throw new AcessoNegadoException("Sua assinatura não está ativa ou expirou. Por favor, regularize seu plano para criar novos anúncios.");
        }

        // 2. Verifica se o usuário atingiu o limite de anúncios do seu plano
        if (!podeCriarNovoAnuncio(usuarioAtualizado)) {
            throw new LimiteExcedidoException("Você atingiu o limite de " + usuarioAtualizado.getPlanoAssinatura().getLimiteAnuncios() + " anúncios do seu plano.");
        }

        // 3. Valida a skin
        Skin skinDeCatalogo = skinRepository.findById(request.getSkinId())
                .orElseThrow(() -> new RuntimeException("Skin não encontrada no catálogo."));

        Anuncio novoAnuncio = new Anuncio();
        novoAnuncio.setUsuario(usuarioAtualizado);
        novoAnuncio.setTitulo(request.getTitulo());
        novoAnuncio.setDescricao(request.getDescricao());
        novoAnuncio.setPreco(request.getPreco());

        // 4. Desnormaliza dados principais da skin do catálogo
        novoAnuncio.setSkinName(skinDeCatalogo.getNome());
        novoAnuncio.setSkinImageUrl(skinDeCatalogo.getIcon());

        // 5. Copia os detalhes específicos do anúncio (float, pattern, etc.)
        novoAnuncio.setDetalhesEspecificos(request.getDetalhesEspecificos());

        // 6. Define valores padrão
        novoAnuncio.setStatus(Status.ATIVO);
        novoAnuncio.setDataCriacao(LocalDateTime.now());

        // 7. Salva o anúncio completo no banco de dados
        return anuncioRepository.save(novoAnuncio);
    }

    @Transactional
    public Anuncio atualizar(UUID id, AnuncioRequest request, Usuario usuario) {
        Anuncio a = anuncioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anúncio não encontrado."));

        // segurança básica: só o dono edita
        if (a.getUsuario() == null || !a.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para editar este anúncio.");
        }

        // Atualiza campos principais
        if (request.getTitulo() != null) {
            a.setTitulo(request.getTitulo());
        }
        if (request.getDescricao() != null) {
            a.setDescricao(request.getDescricao());
        }
        if (request.getPreco() != null) {
            a.setPreco(request.getPreco());
        }

        if (request.getStatus() != null) {
            a.setStatus(request.getStatus());
        }
        if (request.getDetalhesEspecificos() != null) {
            a.setDetalhesEspecificos(request.getDetalhesEspecificos());
        }

        // Se o usuário está tentando mudar a Skin base do anúncio
        if (request.getSkinId() != null) {
            Skin novaSkin = skinRepository.findById(request.getSkinId())
                    .orElseThrow(() -> new RuntimeException("Nova skin não encontrada no catálogo."));
            // Atualiza os dados desnormalizados
            a.setSkinName(novaSkin.getNome());
            a.setSkinImageUrl(novaSkin.getIcon());
        }

        return anuncioRepository.save(a);
    }

    @Transactional
    public void alterarStatus(UUID id, String emailDono, Status novoStatus) {
        Anuncio a = anuncioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anúncio não encontrado."));

        // só o dono pode alterar status
        if (a.getUsuario() == null ||
                a.getUsuario().getEmail() == null ||
                !a.getUsuario().getEmail().equalsIgnoreCase(emailDono)) {
            throw new RuntimeException("Você não tem permissão para alterar o status deste anúncio.");
        }

        a.setStatus(novoStatus);
        anuncioRepository.save(a);
    }

    // ---------- Likes ----------

    public void likeAnuncio(UUID anuncioId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Anuncio anuncio = anuncioRepository.findById(anuncioId)
            .orElseThrow(() -> new RuntimeException("Anúncio não encontrado"));

        // Observação: exige que exista um construtor Anuncio(UUID id) ou então recupere
        // a entidade.
        AnuncioLike like = new AnuncioLike(usuario, new Anuncio(anuncioId));
        anuncioLikeRepository.save(like);
    }

    

    @Transactional
    public void unlikeAnuncio(UUID anuncioId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        anuncioLikeRepository.deleteByAnuncioIdAndUsuarioId(anuncioId, usuario.getId());
    }

    // ---------- Listagens ----------

    @Transactional(readOnly = true)
    public List<AnuncioResponse> listarPorUsuario(UUID usuarioId) {
        return anuncioRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(AnuncioResponse::new)
                .collect(Collectors.toList());
    }


    private boolean podeCriarNovoAnuncio(Usuario usuario) {
        // Conta quantos anúncios ATIVOS o usuário já possui
        long anunciosAtuais = anuncioRepository.countByUsuarioAndStatus(usuario, Status.ATIVO);
        // Pega o limite definido no plano de assinatura do usuário
        int limiteDoPlano = usuario.getPlanoAssinatura().getLimiteAnuncios();

        return anunciosAtuais < limiteDoPlano;
    }

    public Anuncio save(Anuncio anuncio) {
        return anuncioRepository.save(anuncio);
    }

    public List<Anuncio> findAll() {
        return anuncioRepository.findAll();
    }

    public Optional<Anuncio> findById(UUID id) {
        return anuncioRepository.findById(id);
    }
}
