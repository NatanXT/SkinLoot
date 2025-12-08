package com.SkinLoot.SkinLoot.util;

import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.model.PlanoAssinatura;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.*;
import com.SkinLoot.SkinLoot.repository.JogoRepository;
import com.SkinLoot.SkinLoot.repository.PlanoAssinaturaRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;


@Component
@ConditionalOnProperty(name = "app.db.init-data", havingValue = "true", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private JogoRepository jogoRepository;
    @Autowired
    private PlanoAssinaturaRepository planoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder; // Injeta o encoder de senha

    @Override
    public void run(String... args) {
        // 1. Criar Planos se não existirem
        if (planoRepository.count() == 0) {
            PlanoAssinatura gratuito = new PlanoAssinatura();
            gratuito.setNome(TipoPlano.GRATUITO);
            gratuito.setLimiteAnuncios(5);
            // ... setar outros campos
            planoRepository.save(gratuito);

            // Repetir para PRO, etc.
        }

        // 2. Criar Jogos se não existirem
        if (jogoRepository.findByNome("CS2").isEmpty()) {
            Jogo cs2 = new Jogo();
            cs2.setNome("CS2");
            cs2.setCategorias(List.of(CategoriaJogo.FPS, CategoriaJogo.TATICO));
            jogoRepository.save(cs2);
        }
        String emailAdmin = "admin@skinloot.com";

        if (usuarioRepository.findByEmail(emailAdmin).isEmpty()) {
            System.out.println("Criando usuário ADMIN padrão...");

            Usuario admin = new Usuario();
            admin.setNome("Admin Master");
            admin.setEmail(emailAdmin);
            admin.setSenha(passwordEncoder.encode("admin123")); // Senha criptografada
            admin.setRole(Role.ADMIN); // <--- A MÁGICA ACONTECE AQUI
            admin.setGenero(Genero.OUTRO);
            // Defina outros campos obrigatórios (status, plano, etc) se necessário
            admin.setStatusAssinatura(StatusAssinatura.ATIVA); // Já nasce ATIVO

            // Buscar um plano padrão para não ficar null
            PlanoAssinatura planoGratuito = planoRepository.findByNome(TipoPlano.GRATUITO)
                    .orElse(null);
            if (planoGratuito != null) {
                admin.setPlanoAssinatura(planoGratuito);
            }
            usuarioRepository.save(admin);
        }
    }
}
