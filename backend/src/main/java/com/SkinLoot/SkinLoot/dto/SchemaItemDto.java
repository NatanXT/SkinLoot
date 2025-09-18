package com.SkinLoot.SkinLoot.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SchemaItemDto {

        @JsonProperty("defindex")
        private int defindex;

        @JsonProperty("item_name")
        private String name;

        @JsonProperty("item_quality_name")
        private String qualityName;

        @JsonProperty("image_url")
        private String imageUrl;

        // Getters e Setters
        public int getDefindex() { return defindex; }
        public void setDefindex(int defindex) { this.defindex = defindex; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getQualityName() { return qualityName; }
        public void setQualityName(String qualityName) { this.qualityName = qualityName; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }
