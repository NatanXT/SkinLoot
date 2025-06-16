package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.AnuncioRequest;
import com.SkinLoot.SkinLoot.dto.MochilaPlayerDto;
import com.SkinLoot.SkinLoot.model.Anuncio;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Status;
import com.SkinLoot.SkinLoot.repository.AnuncioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AnuncioService {

    @Autowired
    private final AnuncioRepository anuncioRepository;

    private final SteamInventoryService steamInventoryService;

    @Value("{steam.id.user}")
    private String steamId;

    public AnuncioService(AnuncioRepository anuncioRepository, SteamInventoryService steamInventoryService) {
        this.anuncioRepository = anuncioRepository;
        this.steamInventoryService = steamInventoryService;
    }

    @Transactional // Garante que toda a operação seja atômica
    public Anuncio criarAnuncioParaItemExterno(Long itemId, AnuncioRequest request, Usuario usuario) {
        final int TF2_APP_ID = 440; // Define o AppID para TF2

        try {
            // 1. Valida se o usuário realmente possui o item e se ele é negociável
            List<MochilaPlayerDto> inventario = steamInventoryService.getMochilaPlayerDto(steamId, TF2_APP_ID);

            MochilaPlayerDto itemParaAnunciar = inventario.stream()
                    .filter(item -> item.getItemId() == itemId && item.isTradable())
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Item não encontrado no inventário do usuário ou não é negociável."));

            // 2. Se a validação passar, cria a nova entidade Anuncio
            Anuncio novoAnuncio = new Anuncio();
            novoAnuncio.setUsuario(usuario);
            novoAnuncio.setTitulo(request.getTitulo());
            novoAnuncio.setDescricao(request.getDescricao());
            novoAnuncio.setPreco(request.getPreco());
            novoAnuncio.setStatus(Status.ATIVO);
            novoAnuncio.setDataCriacao(LocalDateTime.now());

            // 3. Preenche com os dados do item vindo da API da Steam
            novoAnuncio.setSteamItemId(itemParaAnunciar.getItemId());
            novoAnuncio.setSkinName(itemParaAnunciar.getName());
            novoAnuncio.setSkinImageUrl(itemParaAnunciar.getImageUrl());
            novoAnuncio.setSkinQuality(itemParaAnunciar.getQualityName());

            // 4. Salva no banco de dados
            return anuncioRepository.save(novoAnuncio);

        } catch (Exception e) {
            // Lança uma exceção mais específica para o controller tratar
            throw new RuntimeException("Falha ao criar anúncio: " + e.getMessage(), e);
        }
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
