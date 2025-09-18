package com.SkinLoot.SkinLoot.dto;

import java.util.List;

public class SchemaResultDto {

    private int status;
    private List<SchemaItemDto> items;

    // Getters e Setters
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public List<SchemaItemDto> getItems() { return items; }
    public void setItems(List<SchemaItemDto> items) { this.items = items; }
}
