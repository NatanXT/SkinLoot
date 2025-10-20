package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.AnuncioRequest;
import com.SkinLoot.SkinLoot.dto.AnuncioResponse;
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
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Serviço responsável por gerenciar anúncios (CRUD, likes e regras de
 * assinatura).
 */
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

    /**
     * Cria um novo anúncio, respeitando as regras de assinatura e limite de
     * anúncios.
     */
    @Transactional
    public Anuncio criarAnuncio(AnuncioRequest request, Usuario usuario) {
        // 1. Busca o usuário e valida a assinatura (você já tem essa lógica)
        Usuario usuarioAtualizado = usuarioRepository.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (usuarioAtualizado.getStatusAssinatura() != StatusAssinatura.ATIVA
                || usuarioAtualizado.getDataExpira().isBefore(LocalDate.now())) {
            throw new AcessoNegadoException("Sua assinatura não está ativa ou expirou.");
        }

        if (!podeCriarNovoAnuncio(usuarioAtualizado)) {
            throw new LimiteExcedidoException("Você atingiu o limite de anúncios do seu plano.");
        }

        // 2. Cria o novo anúncio
        Anuncio novoAnuncio = new Anuncio();
        novoAnuncio.setUsuario(usuarioAtualizado);
        novoAnuncio.setTitulo(request.getTitulo());
        novoAnuncio.setDescricao(request.getDescricao());
        novoAnuncio.setPreco(request.getPreco());
        novoAnuncio.setDetalhesEspecificos(request.getDetalhesEspecificos());
        novoAnuncio.setStatus(request.getStatus() != null ? request.getStatus() : Status.ATIVO);
        novoAnuncio.setDataCriacao(LocalDateTime.now());

        // 3. ✅ LÓGICA DO MODELO HÍBRIDO
        if (request.getSkinId() != null) {
            // --- CAMINHO A: Anúncio VINCULADO ao catálogo ---
            Skin skinDeCatalogo = skinRepository.findById(request.getSkinId())
                    .orElseThrow(() -> new RuntimeException("Skin do catálogo não encontrada."));

            novoAnuncio.setSkin(skinDeCatalogo); // Define o relacionamento
            novoAnuncio.setSkinName(skinDeCatalogo.getNome()); // Desnormaliza o nome oficial
            novoAnuncio.setSkinImageUrl(skinDeCatalogo.getIcon()); // Desnormaliza a imagem oficial

        } else {
            // --- CAMINHO B: Anúncio LIVRE (não vinculado) ---
            if (request.getSkinName() == null || request.getSkinName().isBlank()) {
                throw new IllegalArgumentException(
                        "O nome da skin é obrigatório para anúncios não vinculados ao catálogo.");
            }

            novoAnuncio.setSkin(null); // O relacionamento fica nulo
            novoAnuncio.setSkinName(request.getSkinName()); // Usa o nome digitado pelo usuário
            novoAnuncio.setSkinImageUrl(request.getSkinImageUrl()); // Usa a URL (opcional)
        }

        return anuncioRepository.save(novoAnuncio);
    }

    /**
     * Atualiza um anúncio existente, apenas se o usuário for o dono.
     */
    @Transactional
    public Anuncio atualizar(UUID id, AnuncioRequest request, Usuario usuario) {
        Anuncio a = anuncioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anúncio não encontrado."));

        // Segurança: só o dono pode editar
        if (a.getUsuario() == null || !a.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Você não tem permissão para editar este anúncio.");
        }

        // Atualiza campos principais
        if (request.getTitulo() != null)
            a.setTitulo(request.getTitulo());
        if (request.getDescricao() != null)
            a.setDescricao(request.getDescricao());
        if (request.getPreco() != null)
            a.setPreco(request.getPreco());
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

    /**
     * Altera o status de um anúncio (ex: ativo, pausado, vendido)
     */
    @Transactional
    public void alterarStatus(UUID id, String emailDono, Status novoStatus) {
        Anuncio a = anuncioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anúncio não encontrado."));

        if (a.getUsuario() == null ||
                a.getUsuario().getEmail() == null ||
                !a.getUsuario().getEmail().equalsIgnoreCase(emailDono)) {
            throw new RuntimeException("Você não tem permissão para alterar o status deste anúncio.");
        }

        a.setStatus(novoStatus);
        anuncioRepository.save(a);
    }

    // ---------- Likes ----------

    /**
     * Adiciona um like a um anúncio.
     */
    public void likeAnuncio(UUID anuncioId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Anuncio anuncio = anuncioRepository.findById(anuncioId)
                .orElseThrow(() -> new RuntimeException("Anúncio não encontrado"));

        AnuncioLike like = new AnuncioLike(usuario, anuncio);
        anuncioLikeRepository.save(like);
    }

    /**
     * Remove o like de um anúncio.
     */
    @Transactional
    public void unlikeAnuncio(UUID anuncioId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        anuncioLikeRepository.deleteByAnuncioIdAndUsuarioId(anuncioId, usuario.getId());
    }

    // ---------- Listagens ----------

    /**
     * Lista todos os anúncios de um usuário.
     */
    @Transactional(readOnly = true)
    public List<AnuncioResponse> listarPorUsuario(UUID usuarioId) {
        return anuncioRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(AnuncioResponse::new)
                .collect(Collectors.toList());
    }

    // ---------- Auxiliares ----------

    /**
     * Verifica se o usuário pode criar um novo anúncio de acordo com o limite do
     * plano.
     */
    private boolean podeCriarNovoAnuncio(Usuario usuario) {
        long anunciosAtivos = anuncioRepository.countByUsuarioAndStatus(usuario, Status.ATIVO);
        int limite = usuario.getPlanoAssinatura().getLimiteAnuncios();
        return anunciosAtivos < limite;
    }

    // ---------- Métodos utilitários ----------

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
