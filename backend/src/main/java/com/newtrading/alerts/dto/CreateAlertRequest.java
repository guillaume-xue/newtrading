package com.newtrading.alerts.dto;

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
public class CreateAlertRequest {

    @NotBlank(message = "Le symbole de l'actif est requis")
    @Size(max = 12, message = "Le symbole ne peut dépasser 12 caractères")
    private String assetCode;

    @NotNull(message = "Le prix cible est requis")
    @DecimalMin(value = "0.00000001", message = "Le prix cible doit être strictement supérieur à zéro")
    private BigDecimal targetPrice;

    @NotBlank(message = "La condition de déclenchement est requise")
    @Pattern(regexp = "^(ABOVE|BELOW)$", message = "La condition doit être 'ABOVE' ou 'BELOW'")
    private String triggerCondition;

    @NotBlank(message = "Le canal de notification est requis")
    @Pattern(regexp = "^(EMAIL|PUSH|BOTH)$", message = "Le canal doit être 'EMAIL', 'PUSH' ou 'BOTH'")
    private String notificationChannel;
}
