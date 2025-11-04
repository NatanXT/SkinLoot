package com.SkinLoot.SkinLoot.dto.CsgoDto;

import com.SkinLoot.SkinLoot.model.AnuncioCsgo2;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Csgo2Response {
    private Double desgasteFloat;
    private Integer patternIndex;
    private Boolean statTrak;
    private String exterior;

    // Construtor de mapeamento (opcional, mas útil)
    public Csgo2Response(AnuncioCsgo2 entidade) {
        this.desgasteFloat = entidade.getDesgasteFloat();
        this.patternIndex = entidade.getPatternIndex();
        this.statTrak = entidade.getStatTrak();
        this.exterior = entidade.getExterior();
    }
}
