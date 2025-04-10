package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController // Define esta classe como um controlador REST
@RequestMapping("/usuarios") // Define o endpoint base para esse controlador
public class UsuarioController {

    @Autowired // Injeta automaticamente a dependência do repositório
    private UsuarioRepository usuarioRepository;

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

    @PostMapping // Cria um novo usuário
    public ResponseEntity<Usuario> criarUsuario(@Valid @RequestBody Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            return ResponseEntity.badRequest().build(); // Retorna erro se o e-mail já estiver cadastrado
        }
        Usuario novoUsuario = usuarioRepository.save(usuario);
        return ResponseEntity.ok(novoUsuario);
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
