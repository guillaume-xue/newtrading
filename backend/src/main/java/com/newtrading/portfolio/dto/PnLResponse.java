package com.newtrading.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
}
