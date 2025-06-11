package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.DMarketKeyRequest;
import com.SkinLoot.SkinLoot.model.UserDMarketKeys;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UserDMarketKeysRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.SkinLoot.SkinLoot.service.DMarketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/dmarket")
public class DMarketController {

    private final UserDMarketKeysRepository repository;
    private final DMarketService service;

    public DMarketController(UserDMarketKeysRepository repository, DMarketService service) {
        this.repository = repository;
        this.service = service;
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody DMarketKeyRequest req, @RequestParam UUID userId) {
        boolean isValid = service.validateKeys(req.getPublicKey(), req.getSecretKey());
        if (!isValid) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid DMarket keys");

        UserDMarketKeys keys = new UserDMarketKeys();
        keys.setUserId(userId);
        keys.setPublicKey(req.getPublicKey());
        keys.setSecretKey(req.getSecretKey());

        repository.save(keys);

        return ResponseEntity.ok(Map.of("message", "DMarket keys saved successfully"));
    }
}
