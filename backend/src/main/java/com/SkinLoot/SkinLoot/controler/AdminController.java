package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.service.DataImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private DataImportService dataImportService;

    @PostMapping("/import/lol-skins")
    //@PreAuthorize("hasRole('ADMIN')") // Garante que só quem tem a role ADMIN pode chamar
    public ResponseEntity<String> importarSkinsDoLoL() {
        try {
            dataImportService.importarSkinsLoL();
            return ResponseEntity.ok("Importação de skins do League of Legends concluída com sucesso!");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Falha ao importar skins: " + e.getMessage());
        }
    }
    @PostMapping("/import/csgo-skins")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> importarSkinsDoCsgo() {
        try {
            dataImportService.importarSkinsCsgo();
            return ResponseEntity.ok("Importação de skins do CS:GO concluída com sucesso!");
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Falha ao importar skins do CS:GO: " + e.getMessage());
        }
    }
}
