package com.SkinLoot.SkinLoot.controler;

import com.SkinLoot.SkinLoot.dto.OfertaSkinDto;
import com.SkinLoot.SkinLoot.service.BitSkinsClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/ofertas")
public class OfertaController {

    private final BitSkinsClient bitSkinsClient;

    @Autowired
    public OfertaController(BitSkinsClient bitSkinsClient) {
        this.bitSkinsClient = bitSkinsClient;
    }

    @GetMapping
    public ResponseEntity<List<OfertaSkinDto>> listarOfertas() {
        List<OfertaSkinDto> ofertas = bitSkinsClient.buscarSkinsPopulares();
        return ResponseEntity.ok(ofertas);
    }
}
