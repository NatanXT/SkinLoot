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
}
