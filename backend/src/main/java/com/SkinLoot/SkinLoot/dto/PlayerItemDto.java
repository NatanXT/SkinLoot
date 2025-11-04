package com.SkinLoot.SkinLoot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PlayerItemDto {

    @JsonProperty("id")
    private long id;

    @JsonProperty("defindex")
    private int defindex;

    @JsonProperty("flag_cannot_trade")
    private boolean cannotTrade;

    // Getters e Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public int getDefindex() { return defindex; }
    public void setDefindex(int defindex) { this.defindex = defindex; }
    public boolean isCannotTrade() { return cannotTrade; }
    public void setCannotTrade(boolean cannotTrade) { this.cannotTrade = cannotTrade; }
}
