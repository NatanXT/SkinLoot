package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.util.DMarketSignatureUtil;
import org.bouncycastle.util.encoders.Hex;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
}
