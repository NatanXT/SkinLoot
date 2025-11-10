package com.SkinLoot.SkinLoot.dto.riotDto;

import com.SkinLoot.SkinLoot.model.AnuncioLol;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LolResponse {

    private String chroma;
    private String tipoSkin;
    private String championName;

    // Construtor de mapeamento
    public LolResponse(AnuncioLol entidade) {
        this.chroma = entidade.getChroma();
        this.tipoSkin = entidade.getTipoSkin();
    }

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

    public String getChampionName() {
        return championName;
    }

    public void setChampionName(String championName) {
        this.championName = championName;
    }
}
