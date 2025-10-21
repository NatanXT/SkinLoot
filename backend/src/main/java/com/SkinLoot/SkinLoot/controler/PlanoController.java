package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.PlanoRequest;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/planos")
public class PlanoController {

    @Autowired
    private UsuarioService usuarioService;

    /**
     * Recebe a chamada do frontend para fazer upgrade de plano.
     */
    @PostMapping("/upgrade")
    public ResponseEntity<Usuario> upgradePlano(@RequestBody PlanoRequest request) {
        // Pega o usuário logado (autenticado)
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();

        try {
            // Chama o novo método de serviço (que vamos criar)
            Usuario usuarioAtualizado = usuarioService.atualizarPlanoUsuario(email, request.getPlanoNovo());
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null); // Trate o erro como preferir
        }
    }

    /**
     * Recebe a chamada do frontend para renovar o plano.
     */
    @PostMapping("/renovar")
    public ResponseEntity<Usuario> renovarPlano(@RequestBody PlanoRequest request) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = userDetails.getUsername();

        try {
            // Chama o novo método de serviço (que vamos criar)
            Usuario usuarioAtualizado = usuarioService.renovarPlanoUsuario(email);
            return ResponseEntity.ok(usuarioAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
