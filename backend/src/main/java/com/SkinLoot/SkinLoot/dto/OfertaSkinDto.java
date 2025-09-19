package com.SkinLoot.SkinLoot.dto;

public class OfertaSkinDto {
    private String name;
    private Double priceMin;
    private Double priceMax;
    private Double priceAvg;
    private String skinId;
    private Integer quantity;

    public OfertaSkinDto() {}

    public OfertaSkinDto(String name, Double priceMin, Double priceMax, Double priceAvg, String skinId, Integer quantity) {
        this.name = name;
        this.priceMin = priceMin;
        this.priceMax = priceMax;
        this.priceAvg = priceAvg;
        this.skinId = skinId;
        this.quantity = quantity;
    }

    // Getters e Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPriceMin() {
        return priceMin;
    }

    public void setPriceMin(Double priceMin) {
        this.priceMin = priceMin;
    }

    public Double getPriceMax() {
        return priceMax;
    }

    public void setPriceMax(Double priceMax) {
        this.priceMax = priceMax;
    }

    public Double getPriceAvg() {
        return priceAvg;
    }

    public void setPriceAvg(Double priceAvg) {
        this.priceAvg = priceAvg;
    }

    public String getSkinId() {
        return skinId;
    }

    public void setSkinId(String skinId) {
        this.skinId = skinId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
