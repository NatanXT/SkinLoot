//package com.SkinLoot.SkinLoot.repository;
//
//import com.SkinLoot.SkinLoot.model.ChatMessage;
//import com.SkinLoot.SkinLoot.model.Usuario;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//
//public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
//    List<ChatMessage> findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByTimestampAsc(
//        Usuario remetente1, Usuario destinatario1,
//        Usuario remetente2, Usuario destinatario2
//    );
//}
