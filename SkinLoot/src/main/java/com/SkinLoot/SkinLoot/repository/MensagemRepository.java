package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.Mensagem;
import com.SkinLoot.SkinLoot.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MensagemRepository extends JpaRepository<Mensagem, UUID> {
    List<Mensagem> findByRemetenteAndDestinatarioOrDestinatarioAndRemetenteOrderByDataHoraAsc(
        Usuario r1, Usuario d1, Usuario r2, Usuario d2
    );

    List<Mensagem> findTop1ByRemetenteOrDestinatarioOrderByDataHoraDesc(Usuario u1, Usuario u2);
}
