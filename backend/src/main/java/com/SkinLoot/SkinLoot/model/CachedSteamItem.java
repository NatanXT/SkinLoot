package com.SkinLoot.SkinLoot.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class CachedSteamItem{

    @Id
    private Long itemId; // O ID do item da Steam será nossa chave primária

    private String name;
    private String imageUrl;
    private String qualityName;
    private boolean isTradable;
    private String ownerSteamId; // Para saber a qual usuário o item pertence

    // Construtores, Getters e Setters
    public CachedSteamItem() {}

    // Getters e Setters para todos os campos...
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getQualityName() { return qualityName; }
    public void setQualityName(String qualityName) { this.qualityName = qualityName; }
    public boolean isTradable() { return isTradable; }
    public void setTradable(boolean tradable) { isTradable = tradable; }
    public String getOwnerSteamId() { return ownerSteamId; }
    public void setOwnerSteamId(String ownerSteamId) { this.ownerSteamId = ownerSteamId; }
}
