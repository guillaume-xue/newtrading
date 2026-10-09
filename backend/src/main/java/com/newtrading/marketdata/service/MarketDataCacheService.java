package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataCacheService {

    private final StockApiClient stockApiClient;

    @Cacheable(value = "stockHistory", key = "#symbol.toUpperCase()", sync = true)
        public List<CandleDto> getDailyHistory(String symbol) {
        try {
            // Tentative d'appel externe normal via le cache
            return stockApiClient.fetchDailyHistory(symbol);
        } catch (Exception e) {
            log.warn("API de marché indisponible ou quota dépassé (429). Utilisation du jeu de données synthétique pour {}", symbol);
            return generateMockHistory(symbol);
        }
    }

    @Cacheable(value = "stockQuote", key = "#symbol.toUpperCase()", sync = true)
    public QuoteDto getQuote(String symbol) {
        return stockApiClient.fetchQuote(symbol.toUpperCase());
    }

    private List<CandleDto> generateMockHistory(String symbol) {
        List<CandleDto> candles = new ArrayList<>();
        Instant now = Instant.now();
        BigDecimal basePrice = new BigDecimal("180.00");

        for (int i = 30; i >= 0; i--) {
            Instant timestamp = now.minus(i, ChronoUnit.DAYS);
            BigDecimal variation = BigDecimal.valueOf((Math.random() - 0.48) * 4);
            BigDecimal open = basePrice;
            BigDecimal close = basePrice.add(variation);
            BigDecimal high = open.max(close).add(BigDecimal.valueOf(Math.random() * 2));
            BigDecimal low = open.min(close).subtract(BigDecimal.valueOf(Math.random() * 2));

            candles.add(CandleDto.builder()
                    .timestamp(timestamp)
                    .open(open)
                    .high(high)
                    .low(low)
                    .close(close)
                    .volume(new BigDecimal("1500000"))
                    .build());

            basePrice = close;
        }
        return candles;
    }

}
