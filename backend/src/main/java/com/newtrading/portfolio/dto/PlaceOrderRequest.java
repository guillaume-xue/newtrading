package com.newtrading.portfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {

    @NotBlank(message = "Le code de l'actif est obligatoire")
    @Size(min = 1, max = 12, message = "Le symbole ne doit pas dépasser 12 caractères")
    private String assetCode;

    @NotBlank(message = "La direction de l'ordre est obligatoire")
    @Pattern(regexp = "^(BUY|SELL)$", message = "La direction de l'ordre doit être BUY ou SELL")
    private String orderDirection;

    @NotNull(message = "La quantité est obligatoire")
    @DecimalMin(value = "0.00000001", inclusive = true, message = "La quantité doit être strictement positive")
    private BigDecimal quantity;
}
