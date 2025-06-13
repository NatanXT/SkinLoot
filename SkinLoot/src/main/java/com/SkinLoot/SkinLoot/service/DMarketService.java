package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.DMarketResponseDto;
import com.SkinLoot.SkinLoot.util.DMarketSignatureUtil;
import org.bouncycastle.util.encoders.Hex;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
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
            // Monta a URI com todos os query parameters
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.dmarket.com" + path);
            queryParams.forEach(builder::queryParam);
            URI uri = builder.build(true).toUri();

            // Cria a string para assinatura (METHOD + PATH + QUERY + TIMESTAMP)
            String unsignedString = method + uri.getPath() + uri.getQuery() + timestamp;
            // --- ADICIONE ESTAS DUAS LINHAS PARA O TESTE ---
            System.out.println("Chave Secreta Original (com possível \\n): '" + secretKey + "'");
            String chaveLimpa = secretKey.trim();
            System.out.println("Chave Secreta Após .trim(): '" + chaveLimpa + "'");
            // ---------------------------------------------
            String signature = DMarketSignatureUtil.buildSignature(unsignedString, secretKey.trim());

            // Monta os headers da requisição
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", publicKey);
            headers.set("X-Sign-Date", timestamp);
            headers.set("X-Request-Sign", signature);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Faz a chamada, especificando que a resposta deve ser mapeada para DMarketResponseDto.class
            ResponseEntity<DMarketResponseDto> dmarketResponse = restTemplate.exchange(
                    uri,
                    HttpMethod.GET,
                    entity,
                    DMarketResponseDto.class
            );

            // Retorna o corpo da resposta, que agora é um objeto Java fortemente tipado
            return dmarketResponse.getBody();

        } catch (HttpClientErrorException e) {
            // Lança uma exceção com o status e corpo do erro da DMarket para melhor depuração
            throw new ResponseStatusException(e.getStatusCode(), e.getResponseBodyAsString());
        }
    }

}
