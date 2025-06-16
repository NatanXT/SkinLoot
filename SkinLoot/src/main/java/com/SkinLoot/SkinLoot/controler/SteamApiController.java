package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.MochilaPlayerDto;
import com.SkinLoot.SkinLoot.service.SteamApiService;
import com.SkinLoot.SkinLoot.service.SteamInventoryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/steam")
public class SteamApiController{

    private final SteamApiService steamApiService;

    private final SteamInventoryService steamInventoryService;

    @Value("${steam.api.key}")
    private String steamApiKey;

    public SteamApiController(SteamApiService steamApiService, SteamInventoryService steamInventoryService) {
        this.steamApiService = steamApiService;
        this.steamInventoryService = steamInventoryService;
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
}
