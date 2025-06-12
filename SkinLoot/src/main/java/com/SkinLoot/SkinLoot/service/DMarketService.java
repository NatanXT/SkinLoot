package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.util.DMarketSignatureUtil;
import org.bouncycastle.util.encoders.Hex;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
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

    public ResponseEntity<String> getMarketItems(String publicKey, String secretKey, Map<String, String> queryParams) {
        try {
            String path = "/exchange/v1/market/items";
            String method = "GET";
            String timestamp = String.valueOf(Instant.now().getEpochSecond());

            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl("https://api.dmarket.com" + path);
            queryParams.forEach(builder::queryParam);
            URI uri = builder.build(true).toUri();

            String unsignedString = method + uri.getPath() + uri.getQuery() + timestamp;
            String signature = DMarketSignatureUtil.buildSignature(unsignedString, secretKey);

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", publicKey);
            headers.set("X-Sign-Date", timestamp);
            headers.set("X-Request-Sign", signature);

            HttpEntity<String> entity = new HttpEntity<>(headers);
            return restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao buscar itens do marketplace");
        }
    }

}
