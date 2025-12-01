package com.SkinLoot.SkinLoot.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class AvaliacaoRequest{

    @NotNull(message = "O ID do anúncio é obrigatório")
    private UUID anuncioId;
    @Min(value = 1, message = "A nota não pode ser menor que 1")
    @Max(value = 5, message = "A nota não pode ser maior que 5")
    private int nota;
    private String comentario;
}
