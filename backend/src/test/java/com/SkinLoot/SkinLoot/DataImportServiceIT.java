package com.SkinLoot.SkinLoot;

import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.enums.StatusModeracao;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.service.DataImportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@SpringBootTest
@Transactional // ✅ Essencial! Garante que o banco de dados seja limpo após cada teste.
public class DataImportServiceIT {

    @Autowired
    private DataImportService dataImportService;

    @Autowired
    private SkinRepository skinRepository;

    @Test
    void deveImportarSkinsDoJsonCorretamente() throws IOException {
        // --- Cenário (Arrange) ---
        // O banco de dados de teste está limpo (garantido pelo @Transactional)
        // e o data.sql já inseriu o Jogo e o Usuário admin.
        long contagemInicial = skinRepository.count();
        assertThat(contagemInicial).isEqualTo(0); // Garante que a tabela de skins está vazia

        // --- Ação (Act) ---
        // Chamamos o método que permite especificar nosso arquivo de teste
        dataImportService.importarSkinsDeArquivo("test-championFull.json");

        // --- Verificação (Assert) ---
        // 1. Verificar a quantidade total de skins importadas
        List<Skin> skinsImportadas = skinRepository.findAll();
        // (2 skins do Aatrox + 3 da Ahri = 5 no nosso JSON de teste)
        assertThat(skinsImportadas).hasSize(35);

        // 2. Verificar os detalhes de uma skin específica para garantir o mapeamento
        Optional<Skin> ahriNoturnaOpt = skinsImportadas.stream()
                .filter(skin -> skin.getNome().equals("Ahri | Ahri Noturna"))
                .findFirst();

        assertThat(ahriNoturnaOpt).isPresent(); // Garante que a skin foi encontrada

        Skin ahriNoturna = ahriNoturnaOpt.get();
        assertThat(ahriNoturna.getIcon()).isEqualTo("http://ddragon.leagueoflegends.com/cdn/img/champion/loading/Ahri_2.jpg");
        assertThat(ahriNoturna.getDescricao()).isEqualTo("A ligação de Ahri com a magia do mundo espiritual é inata. Ela é uma vastaya com traços de raposa, capaz de manipular as emoções de sua presa e consumir sua essência, devorando também as memórias e as percepções de cada alma absorvida. Outrora uma predadora poderosa, porém rebelde, Ahri agora viaja pelo mundo em busca de vestígios dos seus antepassados enquanto tenta substituir as memórias roubadas por novas de sua própria autoria.");
        assertThat(ahriNoturna.getStatusModeracao()).isEqualTo(StatusModeracao.APROVADO);
        assertThat(ahriNoturna.getJogo().getNome()).isEqualTo("League of Legends");
        assertThat(ahriNoturna.getUsuario().getNome()).isEqualTo("cuvisa");
    }
}
