package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.ChatMessage;
import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByTimestampAsc(
        Usuario remetente1, Usuario destinatario1,
        Usuario remetente2, Usuario destinatario2
    );

    @Query(value =
            // Esta query usa "DISTINCT ON" (específico do PostgreSQL) para fazer o agrupamento
            "SELECT DISTINCT ON ( " +
                    // 1. Define um "parceiro de conversa" (o outro usuário)
                    "    CASE " +
                    "        WHEN remetente_id = :userId THEN destinatario_id " +
                    "        ELSE remetente_id " +
                    "    END " +
                    ") * " + // Seleciona a linha inteira
                    "FROM chat_message " + // Da tabela de mensagens
                    "WHERE remetente_id = :userId OR destinatario_id = :userId " + // Onde o usuário está envolvido
                    "ORDER BY " +
                    // 2. Garante que o agrupamento "DISTINCT ON" funcione
                    "    CASE " +
                    "        WHEN remetente_id = :userId THEN destinatario_id " +
                    "        ELSE remetente_id " +
                    "    END, " +
                    "    timestamp DESC", // 3. Pega a mais recente (DESC) de cada grupo
            nativeQuery = true)
    List<ChatMessage> findLatestMessagePerConversation(@Param("userId") UUID userId);
}

