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
            // 1. Seleciona distintamente pelo "partner_id" (calculado abaixo)
            "SELECT DISTINCT ON (partner_id) * " +
                    "FROM ( " +
                    // 2. Sub-query para calcular o "partner_id"
                    "    SELECT *, " +
                    "           (CASE " +
                    "               WHEN remetente_id = ?1 THEN destinatario_id " +
                    "               ELSE remetente_id " +
                    "           END) AS partner_id " + // 3. Cria o alias "partner_id"
                    "    FROM chat_message " +
                    "    WHERE remetente_id = ?1 OR destinatario_id = ?1 " +
                    ") AS subquery " + // Fim da sub-query
                    // 4. Agora o ORDER BY usa o alias simples
                    "ORDER BY partner_id, timestamp DESC",
            nativeQuery = true)
    List<ChatMessage> findLatestMessagePerConversation(UUID userId);
}

