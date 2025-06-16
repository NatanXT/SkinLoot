package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.DMarketKeyRequest;
import com.SkinLoot.SkinLoot.dto.DMarketResponseDto;
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
    private final UsuarioRepository usuarioRepository;

    public DMarketController(UserDMarketKeysRepository repository, DMarketService service, UsuarioRepository usuarioRepository) {
        this.repository = repository;
        this.service = service;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connect(@RequestBody DMarketKeyRequest req){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = auth.getName();

        Optional<Usuario> optionalUser = usuarioRepository.findByEmail(principal);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado com email: " + principal);
        }

        UUID userId = optionalUser.get().getId();

        boolean isValid = service.validateKeys(req.getPublicKey(), req.getSecretKey());
        if (!isValid) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Chaves DMarket inválidas");

        UserDMarketKeys keys = repository.findById(userId).orElse(new UserDMarketKeys());
        keys.setUserId(userId);
        keys.setPublicKey(req.getPublicKey().trim());
        keys.setSecretKey(req.getSecretKey().trim());

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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Chaves DMarket não cadastradas para o usuário"));
        }

        UserDMarketKeys keys = keysOpt.get();

        // 1. O serviço é chamado e retorna o DTO fortemente tipado
        DMarketResponseDto responseDto = service.getMarketItems(keys.getPublicKey(), keys.getSecretKey(), allParams);

        // 2. Retorna o DTO completo na resposta. O Spring o converterá para JSON.
        // O frontend receberá um objeto { "objects": [...] }
        return ResponseEntity.ok(responseDto);
    }

    // Adicione este método à sua classe DMarketController

    @GetMapping("/inventory")
    public ResponseEntity<?> getUserInventory(@RequestParam Map<String, String> allParams) {
        // 1. Pega a autenticação do usuário logado, como nos outros métodos
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String principal = auth.getName();

        Optional<Usuario> optionalUser = usuarioRepository.findByEmail(principal);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado com email: " + principal);
        }

        // Validação: Garante que o GameID foi enviado pelo frontend, pois é obrigatório na API da DMarket
        if (!allParams.containsKey("GameID")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "O parâmetro 'GameID' é obrigatório."));
        }

        // 2. Busca as chaves da DMarket para este usuário no banco de dados
        UUID userId = optionalUser.get().getId();
        Optional<UserDMarketKeys> keysOpt = repository.findById(userId);
        if (keysOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Chaves DMarket não cadastradas para o usuário"));
        }

        UserDMarketKeys keys = keysOpt.get();

        // 3. Chama o novo método do serviço, passando as chaves e todos os parâmetros de filtro
        DMarketResponseDto responseDto = service.getUserInventory(keys.getPublicKey(), keys.getSecretKey(), allParams);

        // 4. Retorna a resposta (que contém a lista de itens) com status 200 OK
        return ResponseEntity.ok(responseDto);
    }
}
