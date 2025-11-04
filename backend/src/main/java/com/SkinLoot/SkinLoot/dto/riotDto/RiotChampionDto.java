package com.SkinLoot.SkinLoot.dto.riotDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RiotChampionDto {
    private String id; // Ex: "Ahri"
    private String name; // Ex: "Ahri"
    private String lore; // Descrição do campeão
    private List<RiotSkinDto> skins;

    // Getters e Setters
}
