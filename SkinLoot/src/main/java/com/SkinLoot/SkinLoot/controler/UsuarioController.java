package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.LoginRequest;
import com.SkinLoot.SkinLoot.dto.LoginResponse;
import com.SkinLoot.SkinLoot.dto.RegisterRequest;
import com.SkinLoot.SkinLoot.dto.UsuarioDto;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import com.SkinLoot.SkinLoot.util.JwtTokenUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController // Define essa classe como um controlador REST do Spring
@RequestMapping("/usuarios") // Define a rota base para todos os endpoints: /usuarios
@RequiredArgsConstructor // Lombok: gera automaticamente um construtor com os campos finais (injeção de dependência)
public class UsuarioController {

    // Repositório de usuários para acesso direto ao banco de dados (pode ser movido 100% para o service)
    private final UsuarioRepository usuarioRepository;

    // Serviço de usuários, responsável pela lógica de negócio (login, cadastro, busca, etc.)
    private final UsuarioService usuarioService;

    // Utilitário de geração e validação de tokens JWT
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * Lista todos os usuários cadastrados no sistema.
     * Rota: GET /usuarios
     */
    @GetMapping
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    /**
     * Retorna os dados de um usuário específico com base no ID.
     * Rota: GET /usuarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarUsuarioPorId(@PathVariable UUID id) {
        Optional<Usuario> usuario = usuarioRepository.findById(id);

        // Se o usuário for encontrado, retorna 200 OK com o objeto; senão, 404 Not Found
        return usuario.map(ResponseEntity::ok)
                      .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Retorna o perfil do usuário autenticado com base no token JWT.
     * Rota: GET /usuarios/user
     */
    @GetMapping("/user")
    public ResponseEntity<UsuarioDto> getPerfil(Authentication authentication) {
        // Recupera o e-mail do usuário a partir do token JWT
        String email = authentication.getName();

        // Busca o usuário pelo e-mail
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // Retorna os dados públicos do usuário no formato DTO
        return ResponseEntity.ok(new UsuarioDto(usuario));
    }

    /**
     * Realiza a autenticação (login) e retorna um token JWT junto com os dados do usuário.
     * Rota: POST /usuarios/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // Autentica o usuário com o e-mail e senha informados
        UserDetails userDetails = usuarioService.autenticar(loginRequest.getEmail(), loginRequest.getSenha());

        // Gera um token JWT com base no usuário autenticado
        String token = jwtTokenUtil.generateToken(userDetails);

        // Recupera o usuário completo com base no e-mail
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        // Retorna o token + usuário
        return ResponseEntity.ok(new LoginResponse(token, usuario));
    }

    /**
     * Cadastra um novo usuário no sistema e retorna um token JWT de acesso.
     * Rota: POST /usuarios/register
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> registrar(@RequestBody @Valid RegisterRequest request) {
        // Cadastra o novo usuário com os dados informados
        Usuario novoUsuario = usuarioService.cadastrarUsuario(request);

        // Gera o token de acesso JWT com base no e-mail
        String accessToken = jwtTokenUtil.generateAccessToken(novoUsuario.getEmail());

        // Retorna o token + usuário cadastrado
        return ResponseEntity.ok(new LoginResponse(accessToken, novoUsuario));
    }

    /**
     * Atualiza os dados de um usuário existente.
     * Rota: PUT /usuarios/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizarUsuario(
            @PathVariable UUID id,
            @Valid @RequestBody Usuario usuarioAtualizado) {

        // Verifica se o usuário existe antes de tentar atualizar
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build(); // 404
        }

        // Define o ID e salva a atualização
        usuarioAtualizado.setId(id);
        Usuario usuarioSalvo = usuarioRepository.save(usuarioAtualizado);

        // Retorna 200 OK com o usuário atualizado
        return ResponseEntity.ok(usuarioSalvo);
    }

    /**
     * Exclui um usuário do sistema com base no ID.
     * Rota: DELETE /usuarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable UUID id) {
        // Verifica se o usuário existe
        if (!usuarioRepository.existsById(id)) {
            return ResponseEntity.notFound().build(); // 404
        }

        // Remove do banco de dados
        usuarioRepository.deleteById(id);

        // Retorna 204 No Content (remoção bem-sucedida)
        return ResponseEntity.noContent().build();
    }
}
