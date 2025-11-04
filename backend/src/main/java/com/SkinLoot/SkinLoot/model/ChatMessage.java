package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data // Adiciona Getters, Setters, toString, etc. (via Lombok)
@NoArgsConstructor // Construtor vazio (requerido pelo JPA)
@AllArgsConstructor // Construtor com todos os argumentos
@Entity
@Table(name = "chat_message") // Define o nome da tabela no banco
public class ChatMessage {

    /**
     * A chave primária da mensagem.
     * Usamos Long para corresponder ao seu ChatMessageRepository<ChatMessage, Long>
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * O usuário que enviou a mensagem.
     * É um relacionamento Muitos-para-Um: muitas mensagens podem vir de um usuário.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remetente_id", nullable = false)
    private Usuario remetente; //

    /**
     * O usuário que recebeu a mensagem.
     * Também é um relacionamento Muitos-para-Um.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario; //

    /**
     * O conteúdo de texto da mensagem.
     * @Column(columnDefinition = "TEXT") é usado para permitir mensagens longas.
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo; //

    /**
     * A data e hora exatas em que a mensagem foi salva.
     */
    @Column(nullable = false)
    private LocalDateTime timestamp;

    // ---
    // O Lombok (@Data) gera automaticamente os getters e setters
    // que seu ChatController usa (ex: setRemetente, setConteudo, etc.)
    // ---
}
