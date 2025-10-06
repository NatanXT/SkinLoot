package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Raridade;
import com.SkinLoot.SkinLoot.model.enums.StatusModeracao;
import com.SkinLoot.SkinLoot.repository.JogoRepository;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class DataImportService {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkinRepository skinRepository;

    @Autowired
    private JogoRepository jogoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * ✅ MÉTODO PRINCIPAL (SEM ARGUMENTOS)
     * Este método será usado em produção. Ele chama a lógica principal
     * com o caminho do arquivo JSON de produção.
     */
    public void importarSkinsLoL() throws IOException {
        importarSkinsDeArquivo("data/championFull.json");
    }

    /**
     * ✅ NOVO MÉTODO (COM ARGUMENTO) - TORNANDO O SERVIÇO TESTÁVEL
     * Toda a lógica foi movida para cá. Agora podemos passar qualquer
     * caminho de arquivo, o que nos permite usar um JSON de teste.
     */
    public void importarSkinsDeArquivo(String caminhoArquivo) throws IOException {
        InputStream jsonStream = new ClassPathResource(caminhoArquivo).getInputStream();

        JsonNode rootNode = objectMapper.readTree(jsonStream);
        JsonNode dataNode = rootNode.get("data");

        Jogo lol = jogoRepository.findByNome("League of Legends").orElseThrow(() -> new RuntimeException("Jogo 'League of Legends' não encontrado no banco de dados."));
        // Usando o e-mail que você especificou
        Usuario cuvisa = usuarioRepository.findByEmail("felipereis4k@gmail.com").orElseThrow(() -> new RuntimeException("Usuário 'felipereis4k@gmail.com' não encontrado."));

        List<Skin> novasSkins = new ArrayList<>();

        dataNode.fields().forEachRemaining(entry -> {
            String championId = entry.getKey();
            JsonNode championNode = entry.getValue();

            String championName = championNode.get("name").asText();
            String championLore = championNode.get("lore").asText();

            championNode.get("skins").forEach(skinNode -> {
                String skinId = skinNode.get("id").asText();
                String skinName = skinNode.get("name").asText();
                int skinNum = skinNode.get("num").asInt();

                if ("default".equals(skinName)) {
                    skinName = "Padrão";
                }

                Skin novaSkin = new Skin();

                novaSkin.setNome(championName + " | " + skinName);
                novaSkin.setDescricao(championLore);
                String iconUrl = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + championId + "_" + skinNum + ".jpg";
                novaSkin.setIcon(iconUrl);

                novaSkin.setJogo(lol);
                novaSkin.setUsuario(cuvisa);
                novaSkin.setStatusModeracao(StatusModeracao.APROVADO);
                novaSkin.setRaridade(Raridade.COMUM);

                novasSkins.add(novaSkin);
            });
        });

        skinRepository.saveAll(novasSkins);
    }
}
