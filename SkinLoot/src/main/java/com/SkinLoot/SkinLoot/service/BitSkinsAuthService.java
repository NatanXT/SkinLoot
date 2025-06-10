package com.SkinLoot.SkinLoot.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BitSkinsAuthService {

    @Value("${bitskins.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate;

    public BitSkinsAuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Faz login na BitSkins e retorna o x-auth-token
     */
    public String login(String email, String password) {
        String url = baseUrl + "/auth/login";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = String.format("{\"email\": \"%s\", \"password\": \"%s\"}", email, password);
        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<LoginResponse> response = restTemplate.postForEntity(url, request, LoginResponse.class);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().getToken();
        }
        throw new RuntimeException("Erro ao autenticar no BitSkins");
    }

    /**
     * Cria a API key do usuário via x-auth-token
     */
    public String createApiKey(String authToken) {
        String url = baseUrl + "/account/apikey/create";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(authToken);

        HttpEntity<String> request = new HttpEntity<>("{}", headers);
        ResponseEntity<ApiKeyResponse> response = restTemplate.postForEntity(url, request, ApiKeyResponse.class);
        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            return response.getBody().getApiKey();
        }
        throw new RuntimeException("Erro ao criar API Key no BitSkins");
    }

    // DTOs internos
    private static class LoginResponse {
        private String token;
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }
    private static class ApiKeyResponse {
        private String api_key;
        public String getApiKey() { return api_key; }
        public void setApiKey(String api_key) { this.api_key = api_key; }
    }
}

