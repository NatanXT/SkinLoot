package com.SkinLoot.SkinLoot.dto;

import java.util.List;

public class DMarketResponseDto {
    private List<MarketItemDto> objects;

    // Getters e Setters
    public List<MarketItemDto> getObjects() {
        return objects;
    }

    public void setObjects(List<MarketItemDto> objects) {
        this.objects = objects;
    }
}
