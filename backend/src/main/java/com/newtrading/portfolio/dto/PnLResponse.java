package com.newtrading.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PnLResponse {

    private UUID portfolioId;
    private BigDecimal currentBalance;
    private BigDecimal totalPortfolioValue;
    private BigDecimal totalUnrealizedPnL;
    private BigDecimal totalPnLPercentage;
    private List<PositionDto> positions;
    private List<AllocationDto> allocations;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionDto {
        private String assetCode;
        private String category;
        private BigDecimal quantity;
        private BigDecimal averagePrice;
        private BigDecimal currentPrice;
        private BigDecimal valuation;
        private BigDecimal unrealizedPnL;
        private BigDecimal unrealizedPnLPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AllocationDto {
        private String category;
        private BigDecimal amount;
        private BigDecimal percentage;
    }
}
