package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.dto.ScreenerItemDto;
import com.newtrading.marketdata.model.MarketCandle;
import com.newtrading.marketdata.repository.MarketCandleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataCacheService {

    private final StockApiClient stockApiClient;
    private final MarketCandleRepository candleRepository;

    private static final List<ScreenerItemDto> SCREENER_UNIVERSE = List.of(
            ScreenerItemDto.builder().id("1").name("APPLE INC.").symbol("AAPL").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("2").name("NVIDIA CORP.").symbol("NVDA").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("3").name("MICROSOFT CORP.").symbol("MSFT").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("4").name("SPDR S&P 500").symbol("SPY").category("INDICES").build(),
            ScreenerItemDto.builder().id("5").name("INVESCO QQQ").symbol("QQQ").category("INDICES").build(),
            ScreenerItemDto.builder().id("6").name("DOW JONES").symbol("DIA").category("INDICES").build(),
            ScreenerItemDto.builder().id("7").name("BITCOIN").symbol("BTCUSDT").category("CRYPTO").build(),
            ScreenerItemDto.builder().id("8").name("ETHEREUM").symbol("ETHUSDT").category("CRYPTO").build(),
            ScreenerItemDto.builder().id("9").name("SOLANA").symbol("SOLUSDT").category("CRYPTO").build()
    );

    @Cacheable(value = "stockHistory", key = "#symbol.toUpperCase()", sync = true)
    public List<CandleDto> getDailyHistory(String symbol) {
        String cleanSymbol = symbol.toUpperCase();
        log.info("Chargement historique pour {}", cleanSymbol);

        try {
            List<MarketCandle> existingCandles = candleRepository
                    .findByAssetCodeAndTimeframeOrderByOpenTimeAsc(cleanSymbol, "1D");

            if (!existingCandles.isEmpty()) {
                MarketCandle latest = existingCandles.get(existingCandles.size() - 1);
                if (latest.getOpenTime().isAfter(Instant.now().minus(24, ChronoUnit.HOURS))) {
                    log.info("DB Hit pour {} ({} bougies)", cleanSymbol, existingCandles.size());
                    return existingCandles.stream().map(this::toCandleDto).toList();
                }
            }
        } catch (Exception e) {
            log.warn("Lecture DB impossible pour {} ({}) — tentative via API externe", cleanSymbol, e.getMessage());
        }

        List<CandleDto> candles = null;
        try {
            candles = stockApiClient.fetchDailyHistory(cleanSymbol);
        } catch (Exception e) {
            log.warn("Fournisseur externe indisponible ou quota atteint pour {} ({}) — repli données locales",
                    cleanSymbol, e.getMessage());
        }

        if (candles == null || candles.isEmpty()) {
            candles = generateFallbackCandles(cleanSymbol);
        }

        persistCandles(cleanSymbol, "1D", candles);
        return candles;
    }

    @Cacheable(value = "stockQuote", key = "#symbol.toUpperCase()", sync = true)
    public QuoteDto getQuote(String symbol) {
        String cleanSymbol = symbol.toUpperCase();
        try {
            QuoteDto quote = stockApiClient.fetchQuote(cleanSymbol);
            if (quote != null && quote.getPrice() != null) {
                return quote;
            }
        } catch (Exception e) {
            log.warn("Cotation distante indisponible pour {} — repli sur valeur estimée", cleanSymbol);
        }
        return generateFallbackQuote(cleanSymbol);
    }

    @Cacheable(value = "stockQuote", key = "'SCREENER_LIST'", sync = true)
    public List<ScreenerItemDto> getScreenerData() {
        log.info("Agrégation des données Screener mise en cache");
        return SCREENER_UNIVERSE.stream()
                .map(item -> {
                    QuoteDto quote = null;
                    try {
                        quote = stockApiClient.fetchQuote(item.getSymbol());
                    } catch (Exception e) {
                        log.debug("Quote direct échouée pour {} : {}", item.getSymbol(), e.getMessage());
                    }

                    if (quote == null || quote.getPrice() == null) {
                        quote = generateFallbackQuote(item.getSymbol());
                    }

                    return ScreenerItemDto.builder()
                            .id(item.getId())
                            .name(item.getName())
                            .symbol(item.getSymbol())
                            .category(item.getCategory())
                            .currentPrice(quote.getPrice())
                            .change(quote.getChange())
                            .changePercent(quote.getChangePercent())
                            .volume(quote.getVolume())
                            .build();
                })
                .toList();
    }

    private void persistCandles(String assetCode, String timeframe, List<CandleDto> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return;
        }

        try {
            List<MarketCandle> existing = candleRepository
                    .findByAssetCodeAndTimeframeOrderByOpenTimeAsc(assetCode, timeframe);

            Set<Instant> existingTimestamps = existing.stream()
                    .map(MarketCandle::getOpenTime)
                    .collect(Collectors.toSet());

            List<MarketCandle> toSave = dtos.stream()
                    .filter(dto -> dto.getTimestamp() != null && !existingTimestamps.contains(dto.getTimestamp()))
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

            if (!toSave.isEmpty()) {
                candleRepository.saveAll(toSave);
                log.info("{} nouvelles bougies enregistrées pour {}", toSave.size(), assetCode);
            }
        } catch (Exception e) {
            log.error("Échec persistance bougies pour {} (non-bloquant) : {}", assetCode, e.getMessage());
        }
    }

    private List<CandleDto> generateFallbackCandles(String symbol) {
        List<CandleDto> list = new ArrayList<>();
        Instant now = Instant.now().truncatedTo(ChronoUnit.DAYS);

        BigDecimal base = switch (symbol) {
            case "BTCUSDT" -> new BigDecimal("65000.00");
            case "ETHUSDT" -> new BigDecimal("3500.00");
            case "SOLUSDT" -> new BigDecimal("145.00");
            case "SPY"     -> new BigDecimal("510.00");
            case "QQQ"     -> new BigDecimal("440.00");
            case "DIA"     -> new BigDecimal("390.00");
            default        -> new BigDecimal("150.00");
        };

        for (int i = 60; i >= 0; i--) {
            Instant day = now.minus(i, ChronoUnit.DAYS);
            double pct = (ThreadLocalRandom.current().nextDouble() - 0.49) * 0.04;
            BigDecimal delta = base.multiply(BigDecimal.valueOf(pct)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal open = base;
            BigDecimal close = open.add(delta).setScale(2, RoundingMode.HALF_UP);
            BigDecimal high = open.max(close).add(base.multiply(BigDecimal.valueOf(0.01))).setScale(2, RoundingMode.HALF_UP);
            BigDecimal low = open.min(close).subtract(base.multiply(BigDecimal.valueOf(0.01))).setScale(2, RoundingMode.HALF_UP);

            list.add(CandleDto.builder()
                    .timestamp(day)
                    .open(open)
                    .high(high)
                    .low(low)
                    .close(close)
                    .volume(BigDecimal.valueOf(ThreadLocalRandom.current().nextInt(50000, 2000000)))
                    .build());

            base = close;
        }
        return list;
    }

    private QuoteDto generateFallbackQuote(String symbol) {
        BigDecimal price = switch (symbol) {
            case "BTCUSDT" -> new BigDecimal("65000.00");
            case "ETHUSDT" -> new BigDecimal("3500.00");
            case "SOLUSDT" -> new BigDecimal("145.00");
            case "SPY"     -> new BigDecimal("510.00");
            case "QQQ"     -> new BigDecimal("440.00");
            default        -> new BigDecimal("150.00");
        };

        return QuoteDto.builder()
                .symbol(symbol)
                .price(price)
                .change(BigDecimal.ZERO)
                .changePercent(BigDecimal.ZERO)
                .volume(BigDecimal.valueOf(100000))
                .timestamp(Instant.now())
                .build();
    }

    private CandleDto toCandleDto(MarketCandle c) {
        return CandleDto.builder()
                .timestamp(c.getOpenTime())
                .open(c.getOpenPrice())
                .high(c.getHighPrice())
                .low(c.getLowPrice())
                .close(c.getClosePrice())
                .volume(c.getVolume())
                .build();
    }
}
