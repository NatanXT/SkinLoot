package com.SkinLoot.SkinLoot.dto;

import java.util.List;

public class PlayerItemResultDto {

    private int status;
    private List<PlayerItemDto> items;

    // Getters e Setters
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public List<PlayerItemDto> getItems() { return items; }
    public void setItems(List<PlayerItemDto> items) { this.items = items; }
}
