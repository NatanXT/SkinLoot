package com.SkinLoot.SkinLoot.dto.riotDto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LolRequest {
    private String chroma;
    private String tipoSkin;

    public String getChroma() {
        return chroma;
    }

    public void setChroma(String chroma) {
        this.chroma = chroma;
    }

    public String getTipoSkin() {
        return tipoSkin;
    }

    public void setTipoSkin(String tipoSkin) {
        this.tipoSkin = tipoSkin;
    }
}
