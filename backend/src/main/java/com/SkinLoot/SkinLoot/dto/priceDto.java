package com.SkinLoot.SkinLoot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class priceDto {
    @JsonProperty("USD")
    private String usd;

    // Getters e Setters
    public String getUsd() {
        return usd;
    }

    public void setUsd(String usd) {
        this.usd = usd;
    }
}
