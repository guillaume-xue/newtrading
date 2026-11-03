package com.newtrading.portfolio.dto;

import com.newtrading.portfolio.model.SimulatedTransaction;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Value
@Builder
public class TransactionResponse {

    UUID id;
    UUID portfolioId;
    String assetCode;
    String orderDirection;
    BigDecimal quantity;
    BigDecimal executionPrice;
    BigDecimal totalAmount;
    OffsetDateTime executedAt;

    public static TransactionResponse fromEntity(SimulatedTransaction entity) {
        return TransactionResponse.builder()
                .id(entity.getId())
                .portfolioId(entity.getPortfolio() != null ? entity.getPortfolio().getId() : null)
                .assetCode(entity.getAssetCode())
                .orderDirection(entity.getOrderDirection())
                .quantity(entity.getQuantity())
                .executionPrice(entity.getExecutionPrice())
                .totalAmount(entity.getExecutionPrice().multiply(entity.getQuantity()))
                .executedAt(entity.getExecutedAt())
                .build();
    }
}
