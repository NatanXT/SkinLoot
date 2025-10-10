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
import org.springframework.transaction.annotation.Transactional; // Importe a anotação
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.stream.Collectors; // Importe o Collectors


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AnuncioService {

    @Autowired
    private final AnuncioRepository anuncioRepository;

    //private final SteamInventoryService steamInventoryService;

    private UsuarioRepository usuarioRepository;

    private AnuncioLikeRepository anuncioLikeRepository;

    private final SkinRepository skinRepository; // ✅ Adicione o SkinRepository


    @Value("${steam.id.user}")
    private String steamId;

    public AnuncioService(SkinRepository skinRepository, AnuncioLikeRepository anuncioLikeRepository, UsuarioRepository usuarioRepository, AnuncioRepository anuncioRepository) {
        this.skinRepository = skinRepository;
        this.anuncioLikeRepository = anuncioLikeRepository;
        this.usuarioRepository = usuarioRepository;
        this.anuncioRepository = anuncioRepository;
    }

    @Transactional // Garante que toda a operação seja atômica
    public Anuncio criarAnuncio(AnuncioRequest request, Usuario usuario) {

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

            // 2. Cria a nova entidade Anuncio
            Anuncio novoAnuncio = new Anuncio();
            novoAnuncio.setUsuario(usuario);
            novoAnuncio.setTitulo(request.getTitulo());
            novoAnuncio.setDescricao(request.getDescricao());
            novoAnuncio.setPreco(request.getPreco());

            // 4. Copia (desnormaliza) os dados do catálogo para o anúncio
            novoAnuncio.setSkinName(skinDeCatalogo.getNome());
            novoAnuncio.setSkinImageUrl(skinDeCatalogo.getIcon());

            // 5. Define valores padrão
            novoAnuncio.setStatus(Status.ATIVO);
            novoAnuncio.setDataCriacao(LocalDateTime.now());

            // 6. Salva o anúncio completo no banco de dados
            return anuncioRepository.save(novoAnuncio);
        } catch (Exception e) {
            // Lança uma exceção mais específica para o controller tratar
            throw new RuntimeException("Falha ao criar anúncio: " + e.getMessage(), e);
        }
    }
    // É idempotente: se o like já existir, o banco de dados (com a constraint correta) não fará nada.
    public void likeAnuncio(UUID anuncioId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Verificamos a existência do anúncio para segurança
        if (!anuncioRepository.existsById(anuncioId)) {
            throw new RuntimeException("Anúncio não encontrado");
        }

        // Apenas tenta salvar. Nenhuma leitura prévia é feita.
        AnuncioLike newLike = new AnuncioLike(usuario, new Anuncio(anuncioId)); // Usamos referência
        anuncioLikeRepository.save(newLike);
    }

    // ✅ NOVO MÉTODO: Apenas remove o like.
// É idempotente: se o like não existir, não faz nada.
    @Transactional
    public void unlikeAnuncio(UUID anuncioId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Apenas tenta deletar. Nenhuma leitura prévia é feita.
        anuncioLikeRepository.deleteByAnuncioIdAndUsuarioId(anuncioId, usuario.getId());
    }

    @Transactional(readOnly = true) // Otimiza a consulta e evita erros de Lazy Loading
    public List<AnuncioResponse> listarPorUsuario(UUID usuarioId) {
        return anuncioRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(AnuncioResponse::new) // Converte cada Anuncio para AnuncioResponse
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

    public Optional<Anuncio> findById(UUID id){
        return anuncioRepository.findById(id);
    }

    public void deleteById(UUID id) {
        anuncioRepository.deleteById(id);
    }
}
