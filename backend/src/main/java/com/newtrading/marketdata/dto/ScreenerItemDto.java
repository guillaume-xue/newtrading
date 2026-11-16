package com.newtrading.marketdata.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenerItemDto {
    private String id;
    private String name;
    private String symbol;
    private String category;
    private BigDecimal currentPrice;
    private BigDecimal change;
    private BigDecimal changePercent;
    private BigDecimal volume;
}
