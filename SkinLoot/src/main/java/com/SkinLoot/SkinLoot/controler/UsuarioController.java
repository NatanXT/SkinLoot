package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.LoginRequest;
import com.SkinLoot.SkinLoot.dto.LoginResponse;
import com.SkinLoot.SkinLoot.dto.RegisterRequest;
import com.SkinLoot.SkinLoot.dto.UsuarioDto;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import com.SkinLoot.SkinLoot.util.JwtTokenUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.*;

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
    @GetMapping("/user")
    public ResponseEntity<UsuarioDto> getPerfil(Authentication authentication) {
        String email = authentication.getName(); // extraído do token

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return ResponseEntity.ok(new UsuarioDto(usuario));
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        UserDetails userDetails = usuarioService.autenticar(loginRequest.getEmail(), loginRequest.getSenha());
        String accessToken = jwtTokenUtil.generateToken(userDetails); // curto (10 min)
        String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails.getUsername()); // longo (ex: 30h)

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // true se for HTTPS
                .path("/") // só é enviado quando acessar esta rota
                .maxAge(30 * 60 * 60) // 30h
                .sameSite("Strict")
                .build();

        ResponseCookie accessCookie = ResponseCookie.from("accessToken", accessToken)
                .httpOnly(true)
                .secure(false)      // marque true em produção
                .path("/")          // enviado em TODAS as requisições
                .maxAge(10 * 60)    // 10 min de validade
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        String token = jwtTokenUtil.generateToken(userDetails);

        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return ResponseEntity.ok(new LoginResponse(token, usuario));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<Void> refreshToken(
            HttpServletRequest request,
            HttpServletResponse response  // ← injete o response aqui
    ) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String refreshToken = Arrays.stream(cookies)
                .filter(c -> "refreshToken".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (refreshToken == null || !jwtTokenUtil.isTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwtTokenUtil.parseToken(refreshToken).getSubject();
        String newAccessToken = jwtTokenUtil.generateTokenFromEmail(email);

        // ── AQUI: criar o cookie de accessToken ──
        ResponseCookie accessCookie = ResponseCookie.from("accessToken", newAccessToken)
                .httpOnly(true)            // JavaScript não consegue ler
                .secure(false)             // troque para true em produção HTTPS
                .path("/")                 // enviado em todas as rotas
                .maxAge(Duration.ofMinutes(15))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());

        // Você pode retornar vazio, já que o token está no cookie
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody @Valid RegisterRequest request) {
        Usuario novoUsuario = usuarioService.cadastrarUsuario(request); // ✅ já salva e valida

        String accessToken = jwtTokenUtil.generateAccessToken(novoUsuario.getEmail());
//        String refreshToken = jwtTokenUtil.generateRefreshToken(novoUsuario.getId().toString());

        return ResponseEntity.ok(new LoginResponse(accessToken, novoUsuario));

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
