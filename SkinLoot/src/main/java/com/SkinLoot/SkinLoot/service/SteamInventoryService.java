package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class SteamInventoryService {

    private final SteamApiService steamApiService;
    private final ObjectMapper objectMapper;

    @Value("${steam.api.key}")
    private String apiKey;

    // Cache em memória para o Schema. A chave é o AppID do jogo.
    private final Map<Integer, Map<Integer, SchemaItemDto>> schemaCache = new ConcurrentHashMap<>();

    public SteamInventoryService(SteamApiService steamApiService, ObjectMapper objectMapper) {
        this.steamApiService = steamApiService;
        this.objectMapper = objectMapper;
    }

    public List<MochilaPlayerDto> getMochilaPlayerDto(String steamId, int appId) throws Exception {
        // PASSO 1: Obter o Schema (do cache ou da API)
        Map<Integer, SchemaItemDto> schemaMap = getSchemaMap(appId);

        // PASSO 2: Obter os itens do jogador
        String playerItemsJson = steamApiService.getPlayerItems(apiKey, steamId, appId);
        SteamPlayerItemResponseDto playerItemsResponse = objectMapper.readValue(playerItemsJson, SteamPlayerItemResponseDto.class);

        if (playerItemsResponse == null || playerItemsResponse.getResult().getStatus() != 1) {
            throw new RuntimeException("Falha ao buscar o inventário do jogador da Steam.");
        }

        List<PlayerItemDto> playerItems = playerItemsResponse.getResult().getItems();
        List<MochilaPlayerDto> mochilaItens = new ArrayList<>();

        // PASSO 3: O ALGORITMO DE COMPARAÇÃO E COMBINAÇÃO
        for (PlayerItemDto playerItem : playerItems) {
            // Usa o 'defindex' do item do jogador para buscar os detalhes no mapa do Schema
            SchemaItemDto schemaItem = schemaMap.get(playerItem.getDefindex());

            if (schemaItem != null) {
                // Se encontramos os detalhes, criamos nosso objeto enriquecido
                MochilaPlayerDto enrichedItem = new MochilaPlayerDto(
                        playerItem.getId(),
                        schemaItem.getName(),
                        schemaItem.getImageUrl(),
                        schemaItem.getQualityName(),
                        !playerItem.isCannotTrade() // Inverte a flag para 'isTradable'
                );
                mochilaItens.add(enrichedItem);
            }
        }

        return mochilaItens;
    }

    private Map<Integer, SchemaItemDto> getSchemaMap(int appId) throws Exception {
        if (!schemaCache.containsKey(appId)) {
            System.out.println("DEBUG: Schema para o app " + appId + " não encontrado no cache. Buscando na API...");
            String schemaJson = steamApiService.getSchemaItems(apiKey, appId);
            SteamSchemaResponseDto schemaResponse = objectMapper.readValue(schemaJson, SteamSchemaResponseDto.class);

            if (schemaResponse == null || schemaResponse.getResult().getStatus() != 1) {
                throw new RuntimeException("Falha ao buscar o schema de itens da Steam.");
            }

            // Converte a lista de itens do Schema em um Mapa para busca rápida (defindex -> detalhes do item)
            Map<Integer, SchemaItemDto> schemaMap = schemaResponse.getResult().getItems().stream()
                    .collect(Collectors.toMap(SchemaItemDto::getDefindex, Function.identity(), (existing, replacement) -> existing));

            schemaCache.put(appId, schemaMap);
        }
        return schemaCache.get(appId);
    }
}
