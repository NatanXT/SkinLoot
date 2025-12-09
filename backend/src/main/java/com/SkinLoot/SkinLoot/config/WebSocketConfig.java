package com.SkinLoot.SkinLoot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // O frontend conecta aqui: new SockJS('http://localhost:8080/ws-chat')
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*") // Libera o CORS para o React (porta 5173)
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefixo para mensagens que vão DO servidor PARA o cliente
        // O frontend se inscreve em: /user/queue/mensagens
        registry.enableSimpleBroker("/queue", "/topic");

        // Prefixo para mensagens que vão DO cliente PARA o servidor (@MessageMapping)
        // O frontend envia para: /app/chat/enviar
        registry.setApplicationDestinationPrefixes("/app");

        // Prefixo para mensagens privadas (convertAndSendToUser)
        registry.setUserDestinationPrefix("/user");
    }
}

