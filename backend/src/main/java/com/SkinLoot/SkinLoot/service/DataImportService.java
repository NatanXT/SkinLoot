package com.SkinLoot.SkinLoot.service;

import com.SkinLoot.SkinLoot.dto.CsgoDto.Csgo2SkinDto;
import com.SkinLoot.SkinLoot.model.Jogo;
import com.SkinLoot.SkinLoot.model.Skin;
import com.SkinLoot.SkinLoot.model.Usuario;
import com.SkinLoot.SkinLoot.model.enums.Raridade;
import com.SkinLoot.SkinLoot.model.enums.StatusModeracao;
import com.SkinLoot.SkinLoot.repository.JogoRepository;
import com.SkinLoot.SkinLoot.repository.SkinRepository;
import com.SkinLoot.SkinLoot.repository.UsuarioRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Autowired
    public RestTemplate restTemplate;

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

    private static final String CSGO_API_URL = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json";

    public void importarSkinsCsgo() throws IOException {
        // Busca o JSON da URL
        String jsonString = restTemplate.getForObject(CSGO_API_URL, String.class);

        // Converte o array de JSON para uma lista de DTOs
        List<Csgo2SkinDto> csgoSkins = objectMapper.readValue(jsonString, new TypeReference<List<Csgo2SkinDto>>() {});

        Jogo csgo = jogoRepository.findByNome("CS:GO").orElseThrow();
        Usuario admin = usuarioRepository.findByEmail("felipereis4k@gmail.com").orElseThrow();

        List<Skin> novasSkins = new ArrayList<>();

        for (Csgo2SkinDto dto : csgoSkins) {
            Skin novaSkin = new Skin();

            // --- Mapeamento Básico ---
            novaSkin.setNome(dto.getName());
            novaSkin.setDescricao(dto.getDescription());
            novaSkin.setIcon(dto.getImage());

            // --- Mapeamento com Lógica ---

            // Mapeia a string de raridade para seu Enum
            novaSkin.setRaridade(mapearRaridadeCsgo(dto.getRarity().getName()));

            // --- Populando os Detalhes Específicos do CATÁLOGO ---
            Map<String, Object> detalhes = new HashMap<>();
            detalhes.put("min_float", dto.getMinFloat());
            detalhes.put("max_float", dto.getMaxFloat());
            detalhes.put("riot_skin_id", dto.getSkinId());
            // Adicione outros detalhes do catálogo aqui, se necessário
            novaSkin.setDetalhesEspecificos(detalhes);

            // --- Dados da Plataforma ---
            novaSkin.setJogo(csgo);
            novaSkin.setUsuario(admin);
            novaSkin.setStatusModeracao(StatusModeracao.APROVADO);

            novasSkins.add(novaSkin);
        }

        skinRepository.saveAll(novasSkins);
    }

    // --- Método Auxiliar para converter a raridade ---
    private Raridade mapearRaridadeCsgo(String nomeRaridade) {
        if (nomeRaridade == null) return Raridade.COMUM;

        // Converte a string para um formato comparável com o enum
        String raridadeFormatada = nomeRaridade.toUpperCase().replace(" ", "_");

        try {
            return Raridade.valueOf(raridadeFormatada);
        } catch (IllegalArgumentException e) {
            // Se não encontrar um mapeamento direto, retorna um padrão
            System.err.println("Raridade não mapeada: " + nomeRaridade);
            return Raridade.COMUM;
        }
    }
}
