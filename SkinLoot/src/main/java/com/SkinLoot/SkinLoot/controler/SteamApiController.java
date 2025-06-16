package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.MochilaPlayerDto;
import com.SkinLoot.SkinLoot.model.CachedSteamItem;
import com.SkinLoot.SkinLoot.repository.CachedSteamItemRepository;
import com.SkinLoot.SkinLoot.service.SteamApiService;
import com.SkinLoot.SkinLoot.service.SteamInventoryService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/steam")
public class SteamApiController{

    private final SteamApiService steamApiService;

    private final SteamInventoryService steamInventoryService;

    private final CachedSteamItemRepository cachedSteamItemRepository; // Injeta o repositório do cache
    private final ObjectMapper objectMapper;

    @Value("${steam.api.key}")
    private String steamApiKey;

    @Value("${steam.id.user}")
    private String steamId;

    public SteamApiController(SteamApiService steamApiService, SteamInventoryService steamInventoryService,  CachedSteamItemRepository cachedSteamItemRepository, ObjectMapper objectMapper) {
        this.steamApiService = steamApiService;
        this.steamInventoryService = steamInventoryService;
        this.cachedSteamItemRepository = cachedSteamItemRepository;
        this.objectMapper = objectMapper;
    }


/*    @GetMapping("/inventory/{steamId}")
//    public ResponseEntity<String> getInventory(@PathVariable String steamId) {
//        // ID do Team Fortress 2, como estávamos testando
//        final int TF2_APP_ID = 440;
//
//        try {
//            // Chama o serviço que criamos, passando a chave, o steamId e o id do jogo
//            String inventoryJson = steamApiService.getPlayerItems(steamApiKey, steamId, TF2_APP_ID);
//
//            // Se a chamada for bem-sucedida, retorna o JSON com status 200 OK
//            return ResponseEntity.ok(inventoryJson);
//
//        } catch (HttpClientErrorException e) {
//            // Se a API da Steam retornar um erro (ex: perfil privado), repassa o erro
//            return ResponseEntity
//                    .status(e.getStatusCode())
//                    .body("Erro ao buscar inventário na Steam: " + e.getResponseBodyAsString());
//        } catch (Exception e) {
//            // Para outros erros inesperados
//            return ResponseEntity
//                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Ocorreu um erro interno no servidor: " + e.getMessage());
//        }
    }*/

    // O ENDPOINT AGORA RETORNA A LISTA DE ITENS ENRIQUECIDOS

    @GetMapping("/inventory/{steamId}")
    public ResponseEntity<List<MochilaPlayerDto>> getInventory(@PathVariable String steamId) {
        final int TF2_APP_ID = 440; // Team Fortress 2

        try {
            List<MochilaPlayerDto> mochilaItens = steamInventoryService.getMochilaPlayerDto(steamId, TF2_APP_ID);
            return ResponseEntity.ok(mochilaItens);
        } catch (Exception e) {
            // Tratamento de erro simplificado
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/schema/{appId}")
    public ResponseEntity<String> getSchema(@PathVariable int appId) {
        try {
            // Chama o serviço que busca o Schema de itens
            String schemaJson = steamApiService.getSchemaItems(steamApiKey, appId);
            return ResponseEntity.ok(schemaJson);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ocorreu um erro interno no servidor: " + e.getMessage());
        }
    }

    // Em SteamApiController.java
//    @PostMapping("/inventory/seed")
//    public ResponseEntity<String> seedInventory() {
//        try {
//            // 2. Cole o conteúdo COMPLETO do seu arquivo responseenriched.txt aqui dentro das aspas triplas
//            String jsonResponse = """
//[{"itemId":5856944740,"name":"A Dentadura","imageUrl":"http://media.steampowered.com/apps/440/icons/c_jag.383184f964b7793b6d08f542ba665c2a8a3bab50.png","qualityName":null,"tradable":true},{"itemId":5871093214,"name":"A Überserra","imageUrl":"http://media.steampowered.com/apps/440/icons/c_ubersaw.18124fa3ac864e30c5bef5b1ffb13c4ab29e70ca.png","qualityName":null,"tradable":true},{"itemId":5873063766,"name":"Jarratê","imageUrl":"http://media.steampowered.com/apps/440/icons/urinejar.d200bce37621662a0cf4b979dbfc8bfd9b9fb061.png","qualityName":null,"tradable":true},{"itemId":5873710086,"name":"A Hospitalidade do Sul","imageUrl":"http://media.steampowered.com/apps/440/icons/c_spikewrench.4946454f7814fe7cbcaebbd26361d50f224dc766.png","qualityName":null,"tradable":true},{"itemId":5877089881,"name":"Mercenário","imageUrl":"http://media.steampowered.com/apps/440/icons/id_badge_bronze.729e1d1511317ac8af310bdfc3f53183ad98a8d8.png","qualityName":null,"tradable":false},{"itemId":5891091580,"name":"O Aniquilador Neônico","imageUrl":"http://media.steampowered.com/apps/440/icons/c_sd_neonsign.dda1158a80419da433862e963d798df95391e952.png","qualityName":null,"tradable":true},{"itemId":5926529447,"name":"A Besta do Cruzado","imageUrl":"http://media.steampowered.com/apps/440/icons/c_crusaders_crossbow.594f9b5bc758ce75289904d62f052bfd760f21d4.png","qualityName":null,"tradable":true},{"itemId":6295631989,"name":"O Corta-Crânios Escocês","imageUrl":"http://media.steampowered.com/apps/440/icons/c_battleaxe.d6fc2f636ae2889c174e2aed116f56fce368854f.png","qualityName":null,"tradable":true},{"itemId":6468271748,"name":"Brinquedo Barulhento - Festas de Fim de Ano","imageUrl":"http://media.steampowered.com/apps/440/icons/noisemaker_xmas.5ebdbed05668764035c3c087e771f88703903878.png","qualityName":null,"tradable":true},{"itemId":6468271749,"name":"O Espírito Generoso","imageUrl":"http://media.steampowered.com/apps/440/icons/xms_allclass_giftbadge.29e23a7676d9e5776db6fb38a6cc49d452b50d52.png","qualityName":null,"tradable":false},{"itemId":6469063757,"name":"O Clássico","imageUrl":"http://media.steampowered.com/apps/440/icons/c_tfc_sniperrifle.62b5bff6a6df45db6cbacf32b37cf4e6d7315845.png","qualityName":null,"tradable":true},{"itemId":6469674171,"name":"A Quebra-Galho","imageUrl":"http://media.steampowered.com/apps/440/icons/c_proto_medigun.821bc2c35d7deb7b3b33c19f844699a52d931d89.png","qualityName":null,"tradable":true},{"itemId":6470150365,"name":"A Vacinadora","imageUrl":"http://media.steampowered.com/apps/440/icons/c_medigun_defense.7d9c16bbc1b1e7121ba5d850edd8635daa7819e0.png","qualityName":null,"tradable":true},{"itemId":6470264859,"name":"O Anestesiador de Sydney","imageUrl":"http://media.steampowered.com/apps/440/icons/c_sydney_sleeper.8f50307bf65848ff5bbb4cf6657e268fcf753486.png","qualityName":null,"tradable":true},{"itemId":6470264860,"name":"Saxton Secreto","imageUrl":"http://media.steampowered.com/apps/440/icons/gift_single.efd5979a6b289dbab280920a9a123d1db3f4780b.png","qualityName":null,"tradable":true},{"itemId":6474000296,"name":"O Rebobinador","imageUrl":"http://media.steampowered.com/apps/440/icons/c_sd_sapper.ac358c2203a40bcebf0b6a5f9c13c6aec2e29fa6.png","qualityName":null,"tradable":true},{"itemId":6475054907,"name":"A Derretedora de Homens","imageUrl":"http://media.steampowered.com/apps/440/icons/c_drg_manmelter.639f17875217e2f990be13fd77685bb15c8f64d6.png","qualityName":null,"tradable":true},{"itemId":6646184308,"name":"A Resistência Escocesa","imageUrl":"http://media.steampowered.com/apps/440/icons/w_stickybomb_defender.1ed3dbd354148f470f5fd72e48e1ee672f37609f.png","qualityName":null,"tradable":true},{"itemId":6663558129,"name":"A Hospitalidade do Sul","imageUrl":"http://media.steampowered.com/apps/440/icons/c_spikewrench.4946454f7814fe7cbcaebbd26361d50f224dc766.png","qualityName":null,"tradable":true},{"itemId":6768287704,"name":"Pavio Curto","imageUrl":"http://media.steampowered.com/apps/440/icons/c_demo_cannon.6144ab9bc895fec47ebc83fc380edab34ff40483.png","qualityName":null,"tradable":true},{"itemId":6772150786,"name":"A Fuziladora de Costas","imageUrl":"http://media.steampowered.com/apps/440/icons/c_scatterdrum.0bb192ed9234ba57142670870e0e1a66e88d9fdd.png","qualityName":null,"tradable":true},{"itemId":6791299020,"name":"O Persuasor Persa","imageUrl":"http://media.steampowered.com/apps/440/icons/c_demo_sultan_sword.e14eafeb8583215a20d48e52d46d1bf1ff885ff2.png","qualityName":null,"tradable":true},{"itemId":6793300837,"name":"A Arma Sinalizadora","imageUrl":"http://media.steampowered.com/apps/440/icons/c_flaregun_pyro.873aa41664ef4dad38eb15eb2f753350876516df.png","qualityName":null,"tradable":true},{"itemId":6793303608,"name":"A Justiça Vingadora","imageUrl":"http://media.steampowered.com/apps/440/icons/c_frontierjustice.541b4e2c10983011c6669bba953730dbd5fb970c.png","qualityName":null,"tradable":false},{"itemId":6794712149,"name":"O Ataque Aéreo","imageUrl":"http://media.steampowered.com/apps/440/icons/c_atom_launcher.a73ffe082514aa2910d68aac19a68edc022d3a41.png","qualityName":null,"tradable":true},{"itemId":6842631041,"name":"O Clássico","imageUrl":"http://media.steampowered.com/apps/440/icons/c_tfc_sniperrifle.62b5bff6a6df45db6cbacf32b37cf4e6d7315845.png","qualityName":null,"tradable":true},{"itemId":6892774122,"name":"O Pyrolito","imageUrl":"http://media.steampowered.com/apps/440/icons/c_lollichop.ddd832ebe55a67c1c696a7b26caab67665f16c04.png","qualityName":null,"tradable":true},{"itemId":6926581128,"name":"O Bisão Justiceiro","imageUrl":"http://media.steampowered.com/apps/440/icons/c_drg_righteousbison.93880a8209d0bed100176949685d47dfeb9751f4.png","qualityName":null,"tradable":true},{"itemId":6929380577,"name":"O Atomizador","imageUrl":"http://media.steampowered.com/apps/440/icons/c_bonk_bat.22694d39bda6ac3b46cdc1569b07993be9e2f50f.png","qualityName":null,"tradable":true},{"itemId":7844289713,"name":"L'Etranger","imageUrl":"http://media.steampowered.com/apps/440/icons/c_letranger.a694739399535b2039d7387a4a8e3fd381d2f5e9.png","qualityName":null,"tradable":true},{"itemId":7948572048,"name":"O Avacalhador 5000","imageUrl":"http://media.steampowered.com/apps/440/icons/c_drg_cowmangler.9f7cb6b838cc1ad5cd92053006a93d5eb9a2b6d6.png","qualityName":null,"tradable":true},{"itemId":7949740148,"name":"A Spy-lactite","imageUrl":"http://media.steampowered.com/apps/440/icons/c_xms_cold_shoulder.f6ee66be21ba4dc8fc21ca67599b7dc7ec9430f2.png","qualityName":null,"tradable":true},{"itemId":7960693072,"name":"A Barganha do Bazar","imageUrl":"http://media.steampowered.com/apps/440/icons/c_bazaar_sniper.9a36f5240f92bfa32ae87e474d4310442b7cb52d.png","qualityName":null,"tradable":true},{"itemId":8025484996,"name":"A Cópia Mortal","imageUrl":"http://media.steampowered.com/apps/440/icons/c_pocket_watch.4bb1428288c15c31b18e7ed73676049befb33770.png","qualityName":null,"tradable":true},{"itemId":8070633104,"name":"O Descobridor dos Sete Mares","imageUrl":"http://media.steampowered.com/apps/440/icons/c_wheel_shield.467c4fb55b8ea4bb22249faac376ecf3d2dfdbd5.png","qualityName":null,"tradable":true},{"itemId":8076837652,"name":"A Dentadura","imageUrl":"http://media.steampowered.com/apps/440/icons/c_jag.383184f964b7793b6d08f542ba665c2a8a3bab50.png","qualityName":null,"tradable":true},{"itemId":8128848279,"name":"A Machina","imageUrl":"http://media.steampowered.com/apps/440/icons/c_dex_sniperrifle.81e976fb35c261054d3537c3d74d7559a4dac397.png","qualityName":null,"tradable":true},{"itemId":8128852651,"name":"O Capanga","imageUrl":"http://media.steampowered.com/apps/440/icons/c_snub_nose.f5cd852b6263caee6ba687e34cf07d9f4a1b3244.png","qualityName":null,"tradable":false},{"itemId":8128852652,"name":"O Curto-Circuito","imageUrl":"http://media.steampowered.com/apps/440/icons/c_dex_arm.e35f4aa351fd9f154ff53dbdfe6afe04eace9c19.png","qualityName":null,"tradable":false},{"itemId":8129569016,"name":"Leite Louco","imageUrl":"http://media.steampowered.com/apps/440/icons/c_madmilk.85925f9a128b68d42cde2d404bb814208de6a12d.png","qualityName":null,"tradable":true},{"itemId":8130714452,"name":"A Barra de Dalokohs","imageUrl":"http://media.steampowered.com/apps/440/icons/c_chocolate.ff6075c4e4a8052a6c57ffd75b4ee7b27fc74590.png","qualityName":null,"tradable":true},{"itemId":8139537301,"name":"O Compensador","imageUrl":"http://media.steampowered.com/apps/440/icons/c_pickaxe_s2.89cc864a8f8b6d4b0fafb0cf054696cdd51824fc.png","qualityName":null,"tradable":true},{"itemId":8139606802,"name":"A Refrispingarda","imageUrl":"http://media.steampowered.com/apps/440/icons/c_soda_popper.fe0f0ee9e1386cfd38012e7057df051edabcff2b.png","qualityName":null,"tradable":true},{"itemId":8139606804,"name":"Boné da Mann Co.","imageUrl":"http://media.steampowered.com/apps/440/icons/all_manncap.605c7e9ce710e53b1f76378c43b3a3a1bbd1c867.png","qualityName":null,"tradable":false},{"itemId":8139606805,"name":"O Peão","imageUrl":"http://media.steampowered.com/apps/440/icons/c_wrangler.fb1e54c81f06acfb4dabe1b909d5ed6a093bc48f.png","qualityName":null,"tradable":true},{"itemId":8140369939,"name":"O Corta-Crânios Escocês","imageUrl":"http://media.steampowered.com/apps/440/icons/c_battleaxe.d6fc2f636ae2889c174e2aed116f56fce368854f.png","qualityName":null,"tradable":true},{"itemId":8143227445,"name":"A Refrispingarda","imageUrl":"http://media.steampowered.com/apps/440/icons/c_soda_popper.fe0f0ee9e1386cfd38012e7057df051edabcff2b.png","qualityName":null,"tradable":true},{"itemId":8148248237,"name":"A Besta do Cruzado","imageUrl":"http://media.steampowered.com/apps/440/icons/c_crusaders_crossbow.594f9b5bc758ce75289904d62f052bfd760f21d4.png","qualityName":null,"tradable":true},{"itemId":8157831432,"name":"O Capanga","imageUrl":"http://media.steampowered.com/apps/440/icons/c_snub_nose.f5cd852b6263caee6ba687e34cf07d9f4a1b3244.png","qualityName":null,"tradable":true},{"itemId":8174786406,"name":"O Corta-Crânios Escocês","imageUrl":"http://media.steampowered.com/apps/440/icons/c_battleaxe.d6fc2f636ae2889c174e2aed116f56fce368854f.png","qualityName":null,"tradable":true},{"itemId":8180605685,"name":"As Geradoras de Rapidez Urgente","imageUrl":"http://media.steampowered.com/apps/440/icons/c_boxing_gloves_urgency.50e3f044185eae99c283e45d20e03ae563223810.png","qualityName":null,"tradable":true},{"itemId":8208737326,"name":"O Plano de Fuga","imageUrl":"http://media.steampowered.com/apps/440/icons/c_pickaxe.eda38e0c44a0a13cfbc8089d699e369dde3b65f6.png","qualityName":null,"tradable":true},{"itemId":8256664177,"name":"A Claidheamh Mòr","imageUrl":"http://media.steampowered.com/apps/440/icons/c_claidheamohmor.5c916732d63ec77d2b6d9556673d4bef89dc8f0c.png","qualityName":null,"tradable":true},{"itemId":8341216845,"name":"Saxton Secreto","imageUrl":"http://media.steampowered.com/apps/440/icons/gift_single.efd5979a6b289dbab280920a9a123d1db3f4780b.png","qualityName":null,"tradable":true},{"itemId":9930662559,"name":"O Diamante Bruto","imageUrl":"http://media.steampowered.com/apps/440/icons/c_dex_revolver.51b64a63217049ee6bffe13a01430ccd0ead86a3.png","qualityName":null,"tradable":true},{"itemId":10019734877,"name":"Ferro Nove do Nessie","imageUrl":"http://media.steampowered.com/apps/440/icons/c_golfclub.c72bb374b623ae194f6139cb70964d0b98092105.png","qualityName":null,"tradable":true},{"itemId":10020012898,"name":"O Voto Solene","imageUrl":"http://media.steampowered.com/apps/440/icons/c_hippocrates_bust.86e585dc41d853f7c8d9fe2c3622a8fb2fc294be.png","qualityName":null,"tradable":true},{"itemId":10025941596,"name":"Tomislav","imageUrl":"http://media.steampowered.com/apps/440/icons/c_tomislav.63b27a0a5c67654fd012428ea06236be9ace35e9.png","qualityName":null,"tradable":true},{"itemId":10637687007,"name":"Ókulos do Professor","imageUrl":"http://media.steampowered.com/apps/440/icons/professor_speks.65cd9e3d7d91dc4956a322d2292c4e1d7519d529.png","qualityName":null,"tradable":false}]                    """; // Nota: Cole seu JSON completo aqui. Eu coloquei apenas 2 itens como exemplo.
//
//            // 3. Usa o ObjectMapper para converter o JSON em uma lista de objetos DTO
//            List<MochilaPlayerDto> itemsToCache = objectMapper.readValue(jsonResponse, new TypeReference<>() {});
//
//            // 4. Limpa o cache antigo antes de adicionar os novos itens
//            cachedSteamItemRepository.deleteAll();
//
//            // 5. Itera sobre a lista e salva cada item no banco de dados
//            for (MochilaPlayerDto dto : itemsToCache) {
//                CachedSteamItem cachedItem = new CachedSteamItem();
//                cachedItem.setItemId(dto.getItemId());
//                cachedItem.setName(dto.getName());
//                cachedItem.setImageUrl(dto.getImageUrl());
//                cachedItem.setQualityName(dto.getQualityName());
//                cachedItem.setTradable(dto.isTradable());
//                cachedItem.setOwnerSteamId(steamId); // Associa o item ao dono
//                cachedSteamItemRepository.save(cachedItem);
//            }
//
//            return ResponseEntity.ok("Banco de dados populado com " + itemsToCache.size() + " itens de teste.");
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.internalServerError().body("Erro ao popular o banco: " + e.getMessage());
//        }
//    }
}
