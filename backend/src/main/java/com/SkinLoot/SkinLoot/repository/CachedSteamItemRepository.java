package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.CachedSteamItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CachedSteamItemRepository extends JpaRepository<CachedSteamItem,Long> {
    List<CachedSteamItem> findByOwnerSteamId(String steamId);

}
