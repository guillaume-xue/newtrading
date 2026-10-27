package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.model.MarketCandle;
import com.newtrading.marketdata.repository.MarketCandleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataCacheService {

    private final StockApiClient stockApiClient;
    private final MarketCandleRepository candleRepository;

    /**
     * Pattern Read-Through :
     * 1. Cache Caffeine (stockHistory)
     * 2. PostgreSQL (market_candles)
     * 3. Fournisseur API externe (Polygon)
     */
    @Cacheable(value = "stockHistory", key = "#symbol.toUpperCase()", sync = true)
    @Transactional
    public List<CandleDto> getDailyHistory(String symbol) {
        String cleanSymbol = symbol.toUpperCase();
        log.info("Recherche de l'historique pour {}", cleanSymbol);

        // 1. Vérification en base PostgreSQL
        List<MarketCandle> existingCandles = candleRepository
                .findByAssetCodeAndTimeframeOrderByOpenTimeAsc(cleanSymbol, "1D");

        // Si des bougies existent et que la plus récente a moins de 24 heures, on sert depuis PostgreSQL
        if (!existingCandles.isEmpty()) {
            MarketCandle latestCandle = existingCandles.get(existingCandles.size() - 1);
            boolean isDataFresh = latestCandle.getOpenTime().isAfter(Instant.now().minus(24, ChronoUnit.HOURS));

            if (isDataFresh) {
                log.info("DB Hit pour {} : {} bougies chargées depuis PostgreSQL", cleanSymbol, existingCandles.size());
                return existingCandles.stream()
                        .map(this::toCandleDto)
                        .toList();
            }
        }

        // 2. Cache Miss & DB Miss (ou données obsolètes) : appel fournisseur externe
        log.info("Full Miss pour {} : interrogation du fournisseur externe", cleanSymbol);
        List<CandleDto> externalCandles = stockApiClient.fetchDailyHistory(cleanSymbol);

        if (externalCandles != null && !externalCandles.isEmpty()) {
            persistCandles(cleanSymbol, "1D", externalCandles);
        }

        return externalCandles;
    }

    @Cacheable(value = "stockQuote", key = "#symbol.toUpperCase()", sync = true)
    public QuoteDto getQuote(String symbol) {
        String cleanSymbol = symbol.toUpperCase();
        log.info("Récupération de la cotation instantanée pour {}", cleanSymbol);
        return stockApiClient.fetchQuote(cleanSymbol);
    }

    private void persistCandles(String assetCode, String timeframe, List<CandleDto> dtos) {
        List<MarketCandle> entities = dtos.stream()
                .map(dto -> MarketCandle.builder()
                        .assetCode(assetCode)
                        .timeframe(timeframe)
                        .openTime(dto.getTimestamp())
                        .openPrice(dto.getOpen())
                        .highPrice(dto.getHigh())
                        .lowPrice(dto.getLow())
                        .closePrice(dto.getClose())
                        .volume(dto.getVolume())
                        .build())
                .toList();

        try {
            candleRepository.saveAll(entities);
            log.info("{} bougies persistées dans PostgreSQL pour {}", entities.size(), assetCode);
        } catch (Exception e) {
            log.error("Erreur lors de la persistance des bougies pour {} : {}", assetCode, e.getMessage());
        }
    }

    private CandleDto toCandleDto(MarketCandle candle) {
        return CandleDto.builder()
                .timestamp(candle.getOpenTime())
                .open(candle.getOpenPrice())
                .high(candle.getHighPrice())
                .low(candle.getLowPrice())
                .close(candle.getClosePrice())
                .volume(candle.getVolume())
                .build();
    }
}
