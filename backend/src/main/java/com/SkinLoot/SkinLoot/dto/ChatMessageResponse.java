package com.SkinLoot.SkinLoot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data // Gera Getters, Setters, toString, etc.
@NoArgsConstructor // Necessário para o new ChatMessageResponse()
@AllArgsConstructor // Útil para criar o DTO de forma mais limpa
public class ChatMessageResponse {

    /**
     * O ID da mensagem (Long), correspondendo ao ChatMessageRepository
     */
    private Long id;

    /**
     * O texto da mensagem.
     */
    private String conteudo;

    /**
     * A data e hora em que foi enviada.
     */
    private LocalDateTime timestamp;

    /**
     * O nome do usuário que enviou. (Ex: "joao")
     */
    private String remetenteNome;

    /**
     * O nome do usuário que recebeu. (Ex: "satam")
     */
    private String destinatarioNome;

    // Se você não usar Lombok (@Data), adicione manualmente
    // todos os Getters e Setters para estes cinco campos.
}
