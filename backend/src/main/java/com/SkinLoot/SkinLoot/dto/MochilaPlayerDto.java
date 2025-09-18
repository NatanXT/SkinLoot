package com.SkinLoot.SkinLoot.dto;

public class MochilaPlayerDto {
    private long itemId;
    private String name;
    private String imageUrl;
    private String qualityName;
    private boolean isTradable;

    // Construtor, Getters e Setters
    public MochilaPlayerDto(long itemId, String name, String imageUrl, String qualityName, boolean isTradable) {
        this.itemId = itemId;
        this.name = name;
        this.imageUrl = imageUrl;
        this.qualityName = qualityName;
        this.isTradable = isTradable;
    }

    public long getItemId() { return itemId; }
    public String getName() { return name; }
    public String getImageUrl() { return imageUrl; }
    public String getQualityName() { return qualityName; }
    public boolean isTradable() { return isTradable; }
}
