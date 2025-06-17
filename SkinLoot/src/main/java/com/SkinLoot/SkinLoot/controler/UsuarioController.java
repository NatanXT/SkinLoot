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
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
        // PASSO 1: Autentica o usuário usando o serviço (que usa o AuthenticationManager do Spring Security)
        UserDetails userDetails = usuarioService.autenticar(loginRequest.getEmail(), loginRequest.getSenha());

        // PASSO 2: Gera os dois tokens necessários
        String accessToken = jwtTokenUtil.generateToken(userDetails); // Token de acesso de curta duração
        String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails.getUsername()); // Token de atualização de longa duração

        // PASSO 3: Configura o REFRESH token no cookie HttpOnly (padrão seguro, como no seu projeto Tavola)
        ResponseCookie refreshTokenCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Mantenha false para desenvolvimento local (HTTP)
                .path("/")     // Disponível em todo o site
                .maxAge(30 * 24 * 60 * 60) // 30 dias de validade
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString());

        // PASSO 4: Prepara a resposta JSON com o ACCESS token e os dados do usuário
        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado após autenticação bem-sucedida."));

        // Retorna o access token no corpo da resposta para o frontend usar
        return ResponseEntity.ok(new LoginResponse(accessToken, usuario));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        // PASSO 1: Extrai o refreshToken do cookie HttpOnly
        String refreshTokenValue = null;
        if (request.getCookies() != null) {
            refreshTokenValue = Arrays.stream(request.getCookies())
                    .filter(c -> "refreshToken".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);
        }

        // PASSO 2: Valida o refreshToken
        if (refreshTokenValue == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token não encontrado.");
        }
        if (!jwtTokenUtil.isTokenValid(refreshTokenValue)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token inválido ou expirado.");
        }

        // PASSO 3: Gera um NOVO accessToken a partir do refreshToken
        String email = jwtTokenUtil.parseToken(refreshTokenValue).getSubject();
        String newAccessToken = jwtTokenUtil.generateTokenFromEmail(email);

        // PASSO 4: Retorna o novo accessToken no corpo da resposta, como o frontend espera
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("token", newAccessToken);

        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/auth/status")
    public ResponseEntity<?> authStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticated = auth != null && auth.isAuthenticated()
                && !(auth instanceof AnonymousAuthenticationToken);
        if (isAuthenticated) {
            return ResponseEntity.ok(Collections.singletonMap("authenticated", true));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("authenticated", false));
        }
    }

    @GetMapping("/auth/me")
    public ResponseEntity<Usuario> getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();

        Optional<Usuario> usuarioOpt = usuarioService.buscarUsuarioPorEmail(email);

        return usuarioOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Remover Access Token
        Cookie tokenCookie = new Cookie("accessToken", null);
        tokenCookie.setHttpOnly(true);
        tokenCookie.setSecure(true);  // ou false se estiver local
        tokenCookie.setPath("/");
        tokenCookie.setMaxAge(0);
        response.addCookie(tokenCookie);

        // Remover Refresh Token
        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);  // ou false se estiver local
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

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
