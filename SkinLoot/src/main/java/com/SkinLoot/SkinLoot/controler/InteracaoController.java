//package com.SkinLoot.SkinLoot.controler;
//
//import java.time.LocalDateTime;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import com.SkinLoot.SkinLoot.dto.InteracaoRequest;
//import com.SkinLoot.SkinLoot.model.InteracaoUsuarioSkin;
//import com.SkinLoot.SkinLoot.model.Skin;
//import com.SkinLoot.SkinLoot.model.Usuario;
//import com.SkinLoot.SkinLoot.repository.InteracaoUsuarioSkinRepository;
//import com.SkinLoot.SkinLoot.service.SkinService;
//import com.SkinLoot.SkinLoot.service.UsuarioService;
//
//@RestController
//@RequestMapping("/interacoes")
//public class InteracaoController {
//
//    @Autowired
//    private InteracaoUsuarioSkinRepository interacaoRepo;
//
//    @Autowired
//    private UsuarioService usuarioService;
//
//    @Autowired
//    private SkinService skinService;
//
//    @PostMapping("/registrar")
//    public ResponseEntity<Void> registrar(@RequestBody InteracaoRequest request, @AuthenticationPrincipal UserDetails userDetails) {
//        Usuario usuario = usuarioService.buscarUsuarioPorEmail(userDetails.getUsername())
//                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
//
//        Skin skin = skinService.buscarPorId(request.getSkinId())
//                .orElseThrow(() -> new RuntimeException("Skin não encontrada"));
//
////        InteracaoUsuarioSkin i = new InteracaoUsuarioSkin();
//        i.setUsuario(usuario);
//        i.setSkin(skin);
//        i.setTipo(request.getTipo());
//        i.setTempoVisualizacao(request.getTempo());
//        i.setDataHora(LocalDateTime.now());
//
//        interacaoRepo.save(i);
//        return ResponseEntity.ok().build();
//    }
//}
