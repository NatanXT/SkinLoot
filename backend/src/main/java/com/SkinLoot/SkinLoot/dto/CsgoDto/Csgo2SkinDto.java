package com.SkinLoot.SkinLoot.dto.CsgoDto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

public class Csgo2SkinDto{
    private String id;
    private String name;
    private String description;
    private CsgoRarityDto rarity;
    @JsonProperty("min_float")
    private double minFloat;
    @JsonProperty("max_float")
    private int skinId;
    private double maxFloat;
    private String image;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CsgoRarityDto getRarity() {
        return rarity;
    }

    public void setRarity(CsgoRarityDto rarity) {
        this.rarity = rarity;
    }

    public int getSkinId() {
        return skinId;
    }
    public void setSkinId(int skinId) {
        this.skinId = skinId;
    }

    public double getMinFloat() {
        return minFloat;
    }

    public void setMinFloat(double minFloat) {
        this.minFloat = minFloat;
    }

    public double getMaxFloat() {
        return maxFloat;
    }

    public void setMaxFloat(double maxFloat) {
        this.maxFloat = maxFloat;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public class CsgoRarityDto {
        public String name;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
