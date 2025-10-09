//package com.SkinLoot.SkinLoot.controler.dev;
//import com.SkinLoot.SkinLoot.dto.UsuarioResponse;
//import com.SkinLoot.SkinLoot.model.Usuario;
//import com.SkinLoot.SkinLoot.service.UsuarioService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Optional;
//
///**
// * Endpoints DEV (sem auth) para facilitar desenvolvimento:
// * - Semear (criar/atualizar) um usuário por e-mail
// * - Buscar usuário por e-mail
// *
// * Habilite só em DEV. Em produção, desabilite este controller.
// */
//@RestController
//@RequestMapping("/dev/users")
//public class DevUserController {
//
//  private final UsuarioService usuarioService;
//
//  public DevUserController(UsuarioService usuarioService) {
//    this.usuarioService = usuarioService;
//  }
//
//  /** Cria/atualiza usuário por e-mail (nome + plano). */
//  @PostMapping("/seed")
//  public ResponseEntity<UsuarioResponse> seed(@RequestBody UsuarioDevSeedRequest body) {
//    if (body == null || body.getEmail() == null || body.getEmail().isBlank()) {
//      return ResponseEntity.badRequest().build();
//    }
//    final String email = body.getEmail().trim().toLowerCase();
//    final String nome = Optional.ofNullable(body.getNome()).orElse("Usuário DEV").trim();
//    final String plano = Optional.ofNullable(body.getPlano()).orElse("gratuito").trim().toLowerCase();
//
//    Usuario user = usuarioService.criarOuAtualizarDev(email, nome, plano);
//    return ResponseEntity.ok(UsuarioResponse.of(user));
//  }
//
//  /**
//   * Busca usuário por e-mail (útil para o Perfil quando estiver em DEV-login).
//   */
//  @GetMapping("/by-email")
//  public ResponseEntity<UsuarioResponse> getByEmail(@RequestParam("email") String email) {
//    if (email == null || email.isBlank())
//      return ResponseEntity.badRequest().build();
//
//    return usuarioService.buscarUsuarioPorEmail(email.trim().toLowerCase())
//        .map(u -> ResponseEntity.ok(UsuarioResponse.of(u)))
//        .orElse(ResponseEntity.notFound().build());
//  }
//}
