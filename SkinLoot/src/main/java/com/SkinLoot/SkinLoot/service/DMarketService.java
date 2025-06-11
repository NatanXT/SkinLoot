package com.SkinLoot.SkinLoot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.apache.commons.codec.digest.HmacUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Service
public class DMarketService {

    @Value("${dmarket.api.test-endpoint}")
    private String testEndpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean validateKeys(String publicKey, String secretKey) {
        try {
            String path = "/account/v1/balance";
            String method = "GET";
            String date = DateTimeFormatter.ISO_INSTANT.format(Instant.now());

            String signatureBase = method + path + date;
            String signature = HmacUtils.hmacSha256Hex(secretKey, signatureBase);

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Api-Key", publicKey);
            headers.set("X-Request-Sign", signature);
            headers.set("X-Sign-Date", date);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.dmarket.com" + path,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            System.out.println("DMarket response: " + response.getBody());

            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
