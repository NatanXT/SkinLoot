package com.SkinLoot.SkinLoot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean // Este método agora é uma "fábrica" de RestTemplate
    public RestTemplate restTemplate() {
        // Se precisar de configuração, você faz aqui.
        return new RestTemplate();
    }
}
