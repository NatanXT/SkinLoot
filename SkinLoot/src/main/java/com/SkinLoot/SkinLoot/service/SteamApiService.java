package com.SkinLoot.SkinLoot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class SteamApiService {

    // É uma boa prática colocar a URL base em seu arquivo application.properties
    @Value("${steam.api.base-url}")
    private String steamApiBaseUrl; // Ex: https://api.steampowered.com

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Busca os itens do inventário de um jogador para um jogo específico.
     * @param apiKey A sua chave de API da Steam.
     * @param steamId O SteamID de 64 bits do jogador.
     * @param appId O ID do aplicativo do jogo (ex: 440 para TF2, 730 para CS2).
     * @return Uma string JSON com a resposta da API.
     */
    public String getPlayerItems(String apiKey, String steamId, int appId) {
        // Constrói a URL do endpoint dinamicamente com base no AppID
        String path = String.format("/IEconItems_%d/GetPlayerItems/v1/", appId);

        try {
            // Monta a URI com os parâmetros necessários
            URI uri = UriComponentsBuilder.fromHttpUrl(steamApiBaseUrl + path)
                    .queryParam("key", apiKey)
                    .queryParam("steamid", steamId)
                    .build()
                    .toUri();

            System.out.println("DEBUG - Chamando a URL da Steam API: " + uri);

            // Executa a chamada GET e retorna o corpo da resposta como uma String JSON
            return restTemplate.getForObject(uri, String.class);

        } catch (HttpClientErrorException e) {
            System.err.println("Erro ao chamar a Steam API: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            // Você pode querer um tratamento de erro mais robusto aqui
            throw e;
        }
    }
    /**
     * Busca o schema completo de itens para um jogo, contendo detalhes como nome e imagem.
     * Este método substitui o antigo GetSchema.
     * @param apiKey A sua chave de API da Steam.
     * @param appId O ID do aplicativo do jogo (ex: 440 para TF2).
     * @return Uma string JSON com a resposta da API (o catálogo de itens).
     */
    public String getSchemaItems(String apiKey, int appId) {
        // Constrói o path do endpoint dinamicamente
        String path = String.format("/IEconItems_%d/GetSchemaItems/v1/", appId);

        try {
            // Monta a URI com os parâmetros necessários
            URI uri = UriComponentsBuilder.fromHttpUrl(steamApiBaseUrl + path)
                    .queryParam("key", apiKey)
                    .queryParam("language", "pt_BR") // Opcional: Tenta obter os nomes e descrições em português
                    .build()
                    .toUri();

            System.out.println("DEBUG - Chamando GetSchemaItems: " + uri);

            // Executa a chamada GET e retorna o corpo da resposta como uma String JSON
            return restTemplate.getForObject(uri, String.class);

        } catch (HttpClientErrorException e) {
            System.err.println("Erro ao chamar a Steam API (GetSchemaItems): " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            throw e;
        }
    }
}
