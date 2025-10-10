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
        Skin skin = skinRepository.findById(request.getSkinId())
                .orElseThrow(() -> new RuntimeException("Skin não encontrada no catálogo."));


        Anuncio a = new Anuncio();
        a.setUsuario(usuario);
        a.setTitulo(request.getTitulo());
        a.setDescricao(request.getDescricao());
        a.setPreco(request.getPreco());

        a.setDesgasteFloat(request.getDesgasteFloat());
        a.setQualidade(request.getQualidade());

        // desnormaliza dados principais da skin do catálogo
        a.setSkinName(skin.getNome());
        a.setSkinImageUrl(skin.getIcon());

        // TODO: ajuste setSteamItemId(...) conforme o tipo real do campo na entidade
        // Anuncio.
        // Se steamItemId for Long, não use skin.getId() com UUID. No exemplo mantive a
        // ideia; adapte se necessário.
        // a.setSteamItemId(...);

        a.setStatus(Status.ATIVO);
        a.setDataCriacao(LocalDateTime.now());

        return anuncioRepository.save(a);
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
        if (request.getDesgasteFloat() != null) {
            a.setDesgasteFloat(request.getDesgasteFloat());
        }
        if (request.getQualidade() != null) {
            a.setQualidade(request.getQualidade());
        }

        // Se vier skinId, recarrega do catálogo e espelha nome/ícone
        if (request.getSkinId() != null) {
            Skin skin = skinRepository.findById(request.getSkinId())
        // Para garantir que estamos trabalhando com a versão mais atual do usuário no banco
        Usuario usuarioAtualizado = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado para criação de anúncio."));

        // ✅ ================= INÍCIO DA IMPLEMENTAÇÃO ================= ✅

        // 1. Verifica se a assinatura do usuário está ativa e dentro da validade
        if (usuarioAtualizado.getStatusAssinatura() != StatusAssinatura.ATIVA || usuarioAtualizado.getDataExpira().isBefore(LocalDate.now())) {
            throw new AcessoNegadoException("Sua assinatura não está ativa ou expirou. Por favor, regularize seu plano para criar novos anúncios.");
        }

        // 2. Verifica se o usuário atingiu o limite de anúncios do seu plano
        if (!podeCriarNovoAnuncio(usuarioAtualizado)) {
            throw new LimiteExcedidoException("Você atingiu o limite de " + usuarioAtualizado.getPlanoAssinatura().getLimiteAnuncios() + " anúncios do seu plano.");
        }

        try {
            Skin skinDeCatalogo = skinRepository.findById(request.getSkinId())
                    .orElseThrow(() -> new RuntimeException("Skin não encontrada no catálogo."));

            // TODO: ajuste setSteamItemId(...) conforme o tipo real do campo na entidade
            // Anuncio.
            // Se steamItemId for Long, não use skin.getId() com UUID. No exemplo mantive a
            // ideia; adapte se necessário.
            // a.setSteamItemId(...);

            a.setSkinName(skin.getNome());
            a.setSkinImageUrl(skin.getIcon());
        }

        // Status opcional vindo do request
        if (request.getStatus() != null) {
            a.setStatus(request.getStatus());
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
