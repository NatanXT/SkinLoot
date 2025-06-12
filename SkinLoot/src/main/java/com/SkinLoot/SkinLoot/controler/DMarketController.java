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

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/dmarket")
public class DMarketController {

    private final UserDMarketKeysRepository repository;
    private final DMarketService service;
    private final UsuarioRepository usuarioRepository;

    public DMarketController(UserDMarketKeysRepository repository, DMarketService service, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.service = service;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody DMarketKeyRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = auth.getName();

        Optional<Usuario> optionalUser = usuarioRepository.findByEmail(principal);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado com email: " + principal);
        }

        UUID userId = optionalUser.get().getId();

        boolean isValid = service.validateKeys(req.getPublicKey(), req.getSecretKey());
        if (!isValid) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chaves DMarket inválidas");

        UserDMarketKeys keys = new UserDMarketKeys();
        keys.setUserId(userId);
        keys.setPublicKey(req.getPublicKey());
        keys.setSecretKey(req.getSecretKey());

        repository.save(keys);

        return ResponseEntity.ok(Map.of("message", "Chaves DMarket salvas com sucesso"));
    }

    @GetMapping("/items")
    public ResponseEntity<?> getMarketItems(@RequestParam Map<String, String> allParams) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = auth.getName();

        Optional<Usuario> optionalUser = usuarioRepository.findByEmail(principal);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado com email: " + principal);
        }

        UUID userId = optionalUser.get().getId();
        Optional<UserDMarketKeys> keysOpt = repository.findById(userId);
        if (keysOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Chaves DMarket não cadastradas para o usuário");
        }

        UserDMarketKeys keys = keysOpt.get();
        return service.getMarketItems(keys.getPublicKey(), keys.getSecretKey(), allParams);
    }
}
