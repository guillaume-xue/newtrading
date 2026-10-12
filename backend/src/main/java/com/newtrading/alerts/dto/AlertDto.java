package com.newtrading.alerts.dto;

import com.newtrading.alerts.model.Alert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDto {
    private UUID id;
    private String assetCode;
    private BigDecimal targetPrice;
    private String triggerCondition;
    private String notificationChannel;
    private Boolean isTriggered;
    private OffsetDateTime createdAt;

    public static AlertDto fromEntity(Alert alert) {
        return AlertDto.builder()
                .id(alert.getId())
                .assetCode(alert.getAssetCode())
                .targetPrice(alert.getTargetPrice())
                .triggerCondition(alert.getTriggerCondition())
                .notificationChannel(alert.getNotificationChannel())
                .isTriggered(alert.getIsTriggered())
                .createdAt(alert.getCreatedAt())
                .build();
    }
}
