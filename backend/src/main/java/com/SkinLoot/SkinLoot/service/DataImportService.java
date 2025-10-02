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
    private ObjectMapper objectMapper; // Bean do Jackson para parsear JSON

    @Autowired
    private SkinRepository skinRepository;

    @Autowired
    private JogoRepository jogoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository; // Para associar ao admin

    public void importarSkinsLoL() throws IOException {
        // Supondo que o JSON esteja em /resources/data/championFull.json
        InputStream jsonStream = new ClassPathResource("data/championFull.json").getInputStream();

        // Lê a estrutura principal do JSON
        JsonNode rootNode = objectMapper.readTree(jsonStream);
        JsonNode dataNode = rootNode.get("data");

        Jogo lol = jogoRepository.findByNome("League of Legends").orElseThrow();
        Usuario admin = usuarioRepository.findByEmail("admin@skinloot.com").orElseThrow();

        List<Skin> novasSkins = new ArrayList<>();

        // Itera sobre cada campeão (ex: "Aatrox", "Ahri", ...)
        dataNode.fields().forEachRemaining(entry -> {
            String championId = entry.getKey();
            JsonNode championNode = entry.getValue();

            String championName = championNode.get("name").asText();
            String championLore = championNode.get("lore").asText();

            // Itera sobre a lista de skins de cada campeão
            championNode.get("skins").forEach(skinNode -> {
                String skinId = skinNode.get("id").asText();
                String skinName = skinNode.get("name").asText();
                int skinNum = skinNode.get("num").asInt();

                // Pula a skin "default" ou a renomeia
                if ("default".equals(skinName)) {
                    skinName = "Padrão";
                }

                Skin novaSkin = new Skin();

                // --- AQUI ACONTECE O MAPEAMENTO ---
                novaSkin.setNome(championName + " | " + skinName);
                novaSkin.setDescricao(championLore); // Usando a lore do campeão como descrição
                novaSkin.setAssetId(skinId);

                // Construindo a URL do ícone
                // Ex: http://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_1.jpg
                String iconUrl = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + championId + "_" + skinNum + ".jpg";
                novaSkin.setIcon(iconUrl);

                // Campos que não vêm do JSON
                novaSkin.setJogo(lol);
                novaSkin.setUsuario(admin); // Submetido pelo admin
                novaSkin.setStatusModeracao(StatusModeracao.APROVADO);

                // Campo "Raridade": Não existe no JSON!
                // Você terá que definir um padrão ou pesquisar externamente.
                novaSkin.setRaridade(Raridade.COMUM); // Definindo um padrão

                novasSkins.add(novaSkin);
            });
        });

        skinRepository.saveAll(novasSkins); // Salva todas as skins no banco de uma vez
    }
}
