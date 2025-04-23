package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.LoginRequest;
import com.SkinLoot.SkinLoot.dto.LoginResponse;
import com.SkinLoot.SkinLoot.dto.RegisterRequest;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import com.SkinLoot.SkinLoot.util.JwtTokenUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController // Define esta classe como um controlador REST
@RequestMapping("/usuarios") // Define o endpoint base para esse controlador
public class UsuarioController {

    @Autowired // Injeta automaticamente a dependência do repositório
    private UsuarioRepository usuarioRepository;

    private final UsuarioService usuarioService;
    private final JwtTokenUtil jwtTokenUtil;

    public UsuarioController(UsuarioService usuarioService, JwtTokenUtil jwtTokenUtil) {
        this.usuarioService = usuarioService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping // Lista todos os usuários
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @GetMapping("/{id}") // Obtém um usuário específico pelo ID
    public ResponseEntity<Usuario> buscarUsuarioPorId(@PathVariable UUID id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);
        return usuario.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        UserDetails userDetails = usuarioService.autenticar(loginRequest.getNome(), loginRequest.getSenha());

        String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(new LoginResponse(token, userDetails.getUsername()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody @Valid RegisterRequest request) {
        Usuario novoUsuario = usuarioService.cadastrarUsuario(request); // ✅ já salva e valida

        String accessToken = jwtTokenUtil.generateAccessToken(novoUsuario.getEmail());
//        String refreshToken = jwtTokenUtil.generateRefreshToken(novoUsuario.getId().toString());

        return ResponseEntity.ok(new LoginResponse(accessToken, novoUsuario.getNome()));

    }



    @PutMapping("/{id}") // Atualiza um usuário existente
    public ResponseEntity<Usuario> atualizarUsuario(@PathVariable UUID id, @Valid @RequestBody Usuario usuarioAtualizado) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioAtualizado.setId(id);
        Usuario usuarioSalvo = usuarioRepository.save(usuarioAtualizado);
        return ResponseEntity.ok(usuarioSalvo);
    }

    @DeleteMapping("/{id}") // Remove um usuário pelo ID
    public ResponseEntity<Void> deletarUsuario(@PathVariable UUID id) {
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
