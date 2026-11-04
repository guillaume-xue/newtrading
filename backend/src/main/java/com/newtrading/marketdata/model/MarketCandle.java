package com.newtrading.marketdata.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "market_candles",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_market_candles_record", columnNames = {"asset_code", "timeframe", "open_time"})
    },
    indexes = {
        @Index(name = "idx_candles_lookup", columnList = "asset_code, timeframe, open_time DESC")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketCandle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "asset_code", nullable = false, length = 12)
    private String assetCode;

    @Column(name = "timeframe", nullable = false, length = 5)
    @Builder.Default
    private String timeframe = "1D";

    @Column(name = "open_time", nullable = false)
    private Instant openTime;

    @Column(name = "open_price", nullable = false, precision = 18, scale = 8)
    private BigDecimal openPrice;

    @Column(name = "high_price", nullable = false, precision = 18, scale = 8)
    private BigDecimal highPrice;

    @Column(name = "low_price", nullable = false, precision = 18, scale = 8)
    private BigDecimal lowPrice;

    @Column(name = "close_price", nullable = false, precision = 18, scale = 8)
    private BigDecimal closePrice;

    @Column(name = "volume", nullable = false, precision = 18, scale = 8)
    private BigDecimal volume;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
