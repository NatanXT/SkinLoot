package com.SkinLoot.SkinLoot.repository;

import com.SkinLoot.SkinLoot.model.UserDMarketKeys;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserDMarketKeysRepository extends JpaRepository<UserDMarketKeys, UUID> {
}
