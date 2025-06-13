package com.SkinLoot.SkinLoot.dto;

public class MarketItemDto {
    private String itemId;
    private String title;
    private String image;
    private String gameType;
    private priceDto price;
    private extraDto extra;

    // Getters e Setters para todos os campos
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getGameType() { return gameType; }
    public void setGameType(String gameType) { this.gameType = gameType; }

    public priceDto getPrice() {
        return price;
    }

    public void setPrice(priceDto price) {
        this.price = price;
    }

    public extraDto getExtra() {
        return extra;
    }

    public void setExtra(extraDto extra) {
        this.extra = extra;
    }
}
