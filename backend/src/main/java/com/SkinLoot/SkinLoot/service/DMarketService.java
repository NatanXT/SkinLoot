package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.util.DMarketSignatureUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.Map;

@Service
public class DMarketService {

    @Value("${dmarket.api.test-endpoint}")
    private String testEndpoint;


    private final RestTemplate restTemplate = new RestTemplate();

    public boolean validateKeys(String publicKey, String secretKey) {
        try {
            String path = "/account/v1/balance";
            String method = "GET";
            String body = "";
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String unsignedString = method + path + body + timestamp;

            String signature = DMarketSignatureUtil.buildSignature(unsignedString, secretKey);

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", publicKey);
            headers.set("X-Sign-Date", timestamp);
            headers.set("X-Request-Sign", signature);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    testEndpoint + path,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Mude o tipo de retorno de ResponseEntity<Object> para apenas Object
    public DMarketResponseDto getMarketItems(String publicKey, String secretKey, Map<String, String> queryParams) {
        String path = "/exchange/v1/market/items";
        String method = "GET";
        String timestamp = String.valueOf(Instant.now().getEpochSecond());

        try {
            // 1. Monta a URI final para a requisição. Esta parte está correta.
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.dmarket.com" + path);
            queryParams.forEach(builder::queryParam);
            URI uri = builder.build(true).toUri();

            // ------------------- INÍCIO DA CORREÇÃO CRÍTICA -------------------

            // 2. Monta a string para ser assinada, seguindo a fórmula da documentação:
            // FORMULA: (HTTP Method) + (Route path + HTTP query params) + (body string) + (timestamp)

            // Pega o path (ex: /exchange/v1/market/items)
            String routePath = uri.getPath();

            // Pega a query string (ex: gameId=...&currency=...). O '?' é importante.
            String queryString = uri.getQuery() != null ? "?" + uri.getQuery() : "";

            // Para requisições GET, o body é sempre uma string vazia, mas PRECISA ser incluído.
            String body = "";

            // Concatena tudo na ordem exata da documentação
            String unsignedString = method + routePath + queryString + body + timestamp;

            System.out.println("DEBUG - String Final para Assinatura: " + unsignedString);

            // ------------------- FIM DA CORREÇÃO CRÍTICA -------------------

            // 3. Gera a assinatura usando a chave limpa
            String signature = DMarketSignatureUtil.buildSignature(unsignedString, secretKey.trim());

            // 4. Monta os headers da requisição para a DMarket
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", publicKey);
            headers.set("X-Sign-Date", timestamp);
            headers.set("X-Request-Sign", signature);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 5. Executa a chamada e mapeia a resposta para o nosso DTO
            ResponseEntity<DMarketResponseDto> dmarketResponse = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    DMarketResponseDto.class
            );

            // 6. Retorna o corpo da resposta, que é um objeto Java fortemente tipado
            return dmarketResponse.getBody();

        } catch (HttpClientErrorException e) {
            // Se a DMarket retornar um erro (como 401), esta exceção será lançada.
            // Isso ajuda a depurar, mostrando o erro exato que a DMarket enviou.
            System.err.println("Erro da API DMarket: " + e.getResponseBodyAsString());
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        }
    }

    public DMarketResponseDto getUserInventory(String publicKey, String secretKey, Map<String, String> queryParams) {
        // 1. Define o path do endpoint correto, conforme a documentação
        String path = "/marketplace-api/v1/user-inventory";
        String method = "GET";
        String timestamp = String.valueOf(Instant.now().getEpochSecond());

        try {
            // 2. Monta a URI final com os parâmetros de busca (GameID, BasicFilters.Title, etc.)
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.dmarket.com" + path);
            queryParams.forEach(builder::queryParam);
            URI uri = builder.build(true).toUri();

            // 3. Cria a string para assinatura seguindo a fórmula exata da documentação
            // Fórmula: (HTTP Method) + (Route path + HTTP query params) + (body string) + (timestamp)
            String routePath = uri.getPath();
            String queryString = uri.getQuery() != null ? "?" + uri.getQuery() : "";
            String body = ""; // Body é sempre uma string vazia para requisições GET

            String unsignedString = method + routePath + queryString + body + timestamp;

            System.out.println("DEBUG - String para Assinar (Inventário): " + unsignedString);

            // 4. Gera a assinatura usando a chave limpa
            String signature = DMarketSignatureUtil.buildSignature(unsignedString, secretKey.trim());

            // 5. Monta os headers para a requisição
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", publicKey);
            headers.set("X-Sign-Date", timestamp);
            headers.set("X-Request-Sign", signature);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 6. Executa a chamada e mapeia a resposta para o DTO
            ResponseEntity<DMarketResponseDto> dmarketResponse = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    DMarketResponseDto.class
            );

            return dmarketResponse.getBody();

        } catch (HttpClientErrorException e) {
            System.err.println("Erro da API DMarket ao buscar inventário: " + e.getResponseBodyAsString());
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        }
    }


}
