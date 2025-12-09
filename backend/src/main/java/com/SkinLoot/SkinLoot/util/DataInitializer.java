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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
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
    @Transactional // Garante que tudo seja salvo ou nada seja salvo em caso de erro
    public void run(String... args) {
        inicializarPlanos();
        inicializarJogos();
        inicializarAdmin();
    }

    private void inicializarPlanos() {
        if (planoRepository.count() == 0) {
            System.out.println("Inicializando Planos de Assinatura...");

            // 1. Plano Gratuito (Baseado no seu dataPlano.sql)
            PlanoAssinatura gratuito = new PlanoAssinatura();
            gratuito.setNome(TipoPlano.GRATUITO);
            gratuito.setPrecoMensal(BigDecimal.ZERO);
            gratuito.setLimiteAnuncios(5);
            gratuito.setDestaqueAnuncio(false);

            // 2. Plano Prata/Intermediário (Baseado no SQL 'INTERMEDIARIO' - R$ 19.90)
            // OBS: Verifique se no seu Enum TipoPlano é PRATA ou INTERMEDIARIO
            PlanoAssinatura prata = new PlanoAssinatura();
            prata.setNome(TipoPlano.INTERMEDIARIO);
            prata.setPrecoMensal(new BigDecimal("19.90"));
            prata.setLimiteAnuncios(20);
            prata.setDestaqueAnuncio(true);

            // 3. Plano Ouro/Plus (Baseado no SQL 'PLUS' - R$ 49.90)
            PlanoAssinatura ouro = new PlanoAssinatura();
            ouro.setNome(TipoPlano.PLUS);
            ouro.setPrecoMensal(new BigDecimal("49.90"));
            ouro.setLimiteAnuncios(100);
            ouro.setDestaqueAnuncio(true);

            planoRepository.saveAll(Arrays.asList(gratuito, prata, ouro));
        }
    }

    private void inicializarJogos() {
        // Verifica se existem jogos, se não, cria a lista completa do seu dataJogos.sql
        if (jogoRepository.count() == 0) {
            System.out.println("Inicializando Jogos e Categorias...");

            // CS2 (Antigo CS:GO)
            criarJogoSeNaoExiste("CS2", List.of(CategoriaJogo.FPS, CategoriaJogo.TATICO, CategoriaJogo.COMPETITIVO));

            // Valorant
            criarJogoSeNaoExiste("Valorant", List.of(CategoriaJogo.FPS, CategoriaJogo.TATICO, CategoriaJogo.HERO_SHOOTER));

            // League of Legends
            criarJogoSeNaoExiste("League of Legends", List.of(CategoriaJogo.MOBA, CategoriaJogo.ESTRATEGIA, CategoriaJogo.COMPETITIVO));

            // Dota 2
            criarJogoSeNaoExiste("Dota 2", List.of(CategoriaJogo.MOBA, CategoriaJogo.ESTRATEGIA, CategoriaJogo.COMPETITIVO));

            // Rust
            criarJogoSeNaoExiste("Rust", List.of(CategoriaJogo.SOBREVIVENCIA, CategoriaJogo.MUNDO_ABERTO, CategoriaJogo.FPS));
        }
    }

    private void criarJogoSeNaoExiste(String nome, List<CategoriaJogo> categorias) {
        // Método auxiliar para evitar duplicação de código
        if (jogoRepository.findByNome(nome).isEmpty()) {
            Jogo jogo = new Jogo();
            jogo.setNome(nome);
            jogo.setCategorias(categorias);
            jogoRepository.save(jogo);
        }
    }

    private void inicializarAdmin() {
        String emailAdmin = "admin@skinloot.com";

        if (usuarioRepository.findByEmail(emailAdmin).isEmpty()) {
            System.out.println("Criando usuário ADMIN padrão...");

            Usuario admin = new Usuario();
            admin.setNome("Admin Master");
            admin.setEmail(emailAdmin);
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setGenero(Genero.OUTRO); // Assumindo enum Genero
            admin.setStatusAssinatura(StatusAssinatura.ATIVA);

            // Busca o plano Gratuito para associar
            PlanoAssinatura planoGratuito = planoRepository.findByNome(TipoPlano.GRATUITO)
                    .orElseThrow(() -> new RuntimeException("Erro Crítico: Plano Gratuito não encontrado na inicialização!"));

            admin.setPlanoAssinatura(planoGratuito);

            usuarioRepository.save(admin);
        }
    }
}
