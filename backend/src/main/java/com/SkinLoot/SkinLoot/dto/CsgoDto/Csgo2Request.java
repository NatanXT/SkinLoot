package com.SkinLoot.SkinLoot.dto.CsgoDto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class Csgo2Request {

    @DecimalMin(value = "0.0", message = "Desgaste (Float) não pode ser menor que 0.0")
    @DecimalMax(value = "1.0", message = "Desgaste (Float) não pode ser maior que 1.0")
    private Double desgasteFloat;
    @Min(value = 0, message = "Pattern Index não pode ser menor que 0")
    @Max(value = 999, message = "Pattern Index não pode ser maior que 999")
    private Integer patternIndex;
    private Boolean statTrak;
    private String exterior;
}
