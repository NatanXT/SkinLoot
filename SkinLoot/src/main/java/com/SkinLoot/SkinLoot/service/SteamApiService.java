package com.SkinLoot.SkinLoot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class SteamApiService {

    @Value("${steam.api.base-url}")
    private String steamApiBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // --- Configurações para nossa lógica manual de Retry ---
    private static final int MAX_ATTEMPTS = 10; // Número máximo de tentativas
    private static final long INITIAL_DELAY_MS = 1500 * 4; // Tempo inicial de espera: 1.5 segundos

    /**
     * Busca os itens do inventário de um jogador com lógica de retry manual.
     */
    public String getPlayerItems(String apiKey, String steamId, int appId) {
        String path = String.format("/IEconItems_%d/GetPlayerItems/v1/", appId);
        long currentDelay = INITIAL_DELAY_MS;
        HttpServerErrorException lastError = null;

        // Laço que representa nossas tentativas
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                URI uri = UriComponentsBuilder.fromHttpUrl(steamApiBaseUrl + path)
                        .queryParam("key", apiKey)
                        .queryParam("steamid", steamId)
                        .build()
                        .toUri();

                System.out.println("INFO - (Tentativa " + attempt + "/" + MAX_ATTEMPTS + ") Chamando GetPlayerItems...");

                // Se a chamada for bem-sucedida, retorna o resultado e sai do método
                return restTemplate.getForObject(uri, String.class);

            } catch (HttpServerErrorException e) { // Erro de servidor (5xx) - VAMOS TENTAR DE NOVO
                lastError = e; // Guarda o último erro
                System.err.println("ERRO DE SERVIDOR na tentativa " + attempt + ": " + e.getStatusCode() + ". Tentando novamente em " + (currentDelay / 1000.0) + "s...");

                // Se for a última tentativa, não precisa esperar, apenas sai do laço para lançar o erro final
                if (attempt == MAX_ATTEMPTS) {
                    break;
                }

                // Pausa a execução pelo tempo de espera
                try {
                    Thread.sleep(currentDelay);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt(); // Boa prática
                    throw new RuntimeException("A espera para nova tentativa foi interrompida.", interruptedException);
                }

                // Aumenta o tempo de espera para a próxima tentativa (Backoff Exponencial)
                currentDelay *= 2;

            } catch (HttpClientErrorException e) { // Erro de cliente (4xx) - NÃO TENTA DE NOVO
                System.err.println("ERRO DE CLIENTE ao chamar GetPlayerItems: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
                // Relança a exceção imediatamente, pois não adianta tentar de novo.
                throw e;
            }
        }

        // Se o laço terminou sem sucesso, lança a exceção final
        System.err.println("FALHA CRÍTICA: Todas as " + MAX_ATTEMPTS + " tentativas para getPlayerItems falharam.");
        throw new RuntimeException("O serviço da Steam para buscar inventários está indisponível no momento. Por favor, tente novamente mais tarde.", lastError);
    }

    /**
     * Busca o schema de itens com lógica de retry manual.
     */
    public String getSchemaItems(String apiKey, int appId) {
        String path = String.format("/IEconItems_%d/GetSchemaItems/v1/", appId);
        long currentDelay = INITIAL_DELAY_MS;
        HttpServerErrorException lastError = null;

        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                URI uri = UriComponentsBuilder.fromHttpUrl(steamApiBaseUrl + path)
                        .queryParam("key", apiKey)
                        .queryParam("language", "pt_BR")
                        .build()
                        .toUri();

                System.out.println("INFO - (Tentativa " + attempt + "/" + MAX_ATTEMPTS + ") Chamando GetSchemaItems...");
                return restTemplate.getForObject(uri, String.class);

            } catch (HttpServerErrorException e) {
                lastError = e;
                System.err.println("ERRO DE SERVIDOR na tentativa " + attempt + ": " + e.getStatusCode() + ". Tentando novamente em " + (currentDelay / 1000.0) + "s...");

                if (attempt == MAX_ATTEMPTS) {
                    break;
                }

                try {
                    Thread.sleep(currentDelay);
                } catch (InterruptedException interruptedException) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("A espera para nova tentativa foi interrompida.", interruptedException);
                }

                currentDelay *= 2;

            } catch (HttpClientErrorException e) {
                System.err.println("ERRO DE CLIENTE ao chamar GetSchemaItems: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
                throw e;
            }
        }

        System.err.println("FALHA CRÍTICA: Todas as " + MAX_ATTEMPTS + " tentativas para getSchemaItems falharam.");
        throw new RuntimeException("O serviço da Steam para buscar informações de itens está indisponível no momento. Por favor, tente novamente mais tarde.", lastError);
    }
}