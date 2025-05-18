package com.SkinLoot.SkinLoot.controler;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/anuncios")
public class AnuncioController {
}

/*
package com.SkinLoot.SkinLoot.controller;

import org.springframework.web.bind.annotation.*;

/**
 * Controlador responsável por lidar com as operações relacionadas aos anúncios.
 * Este endpoint atende a rota base: /anuncios
 */
//@RestController
/*@RequestMapping("/anuncios")
public class AnuncioController {

    /**
     * Endpoint de teste para garantir que o controlador está funcionando.
     *
     * @return mensagem simples indicando sucesso
     */
    /*@GetMapping("/ping")
    public String ping() {
        return "AnuncioController ativo!";
    }

    // Método de listagem (GET)
    // @GetMapping
    // public List<AnuncioDTO> listarTodos() {
    //     return anuncioService.listarTodos();
    // }

    // Método para cadastrar novo anúncio (POST)
    // @PostMapping
    // public ResponseEntity<AnuncioDTO> criar(@RequestBody AnuncioDTO dto) {
    //     return ResponseEntity.status(HttpStatus.CREATED).body(anuncioService.criar(dto));
    // }

    // Busca por ID (GET /anuncios/{id})
    // @GetMapping("/{id}")
    // public ResponseEntity<AnuncioDTO> buscarPorId(@PathVariable Long id) {
    //     return ResponseEntity.ok(anuncioService.buscarPorId(id));
    // }

    // Atualização (PUT /anuncios/{id})
    // @PutMapping("/{id}")
    // public ResponseEntity<AnuncioDTO> atualizar(@PathVariable Long id, @RequestBody AnuncioDTO dto) {
    //     return ResponseEntity.ok(anuncioService.atualizar(id, dto));
    // }

    // Delete (DELETE /anuncios/{id})
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deletar(@PathVariable Long id) {
    //     anuncioService.deletar(id);
    //     return ResponseEntity.noContent().build();
    // }
}*/
