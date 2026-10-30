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
            // --- TOP 10 ACTIONS ---
            ScreenerItemDto.builder().id("1").name("APPLE INC.").symbol("AAPL").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("2").name("NVIDIA CORP.").symbol("NVDA").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("3").name("MICROSOFT CORP.").symbol("MSFT").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("4").name("AMAZON.COM INC.").symbol("AMZN").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("5").name("ALPHABET INC.").symbol("GOOGL").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("6").name("META PLATFORMS").symbol("META").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("7").name("TESLA INC.").symbol("TSLA").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("8").name("BERKSHIRE HATHAWAY").symbol("BRK.B").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("9").name("BROADCOM INC.").symbol("AVGO").category("ACTIONS").build(),
            ScreenerItemDto.builder().id("10").name("JPMORGAN CHASE").symbol("JPM").category("ACTIONS").build(),

            // --- TOP 10 INDICES & ETFS DE MARCHÉ ---
            ScreenerItemDto.builder().id("11").name("SPDR S&P 500").symbol("SPY").category("INDICES").build(),
            ScreenerItemDto.builder().id("12").name("INVESCO QQQ (NASDAQ)").symbol("QQQ").category("INDICES").build(),
            ScreenerItemDto.builder().id("13").name("SPDR DOW JONES").symbol("DIA").category("INDICES").build(),
            ScreenerItemDto.builder().id("14").name("ISHARES RUSSELL 2000").symbol("IWM").category("INDICES").build(),
            ScreenerItemDto.builder().id("15").name("ISHARES MSCI EMERGING").symbol("EEM").category("INDICES").build(),
            ScreenerItemDto.builder().id("16").name("VANGUARD FTSE EUROPE").symbol("VGK").category("INDICES").build(),
            ScreenerItemDto.builder().id("17").name("ISHARES MSCI JAPAN").symbol("EWJ").category("INDICES").build(),
            ScreenerItemDto.builder().id("18").name("PROSHARES VIX SHORT-TERM").symbol("VIXY").category("INDICES").build(),
            ScreenerItemDto.builder().id("19").name("SPDR GOLD SHARES").symbol("GLD").category("INDICES").build(),
            ScreenerItemDto.builder().id("20").name("ISHARES 20+ YEAR TREASURY").symbol("TLT").category("INDICES").build(),

            // --- TOP 4 CRYPTOS MAJEURES ---
            ScreenerItemDto.builder().id("21").name("BITCOIN").symbol("BTCUSDT").category("CRYPTO").build(),
            ScreenerItemDto.builder().id("22").name("ETHEREUM").symbol("ETHUSDT").category("CRYPTO").build(),
            ScreenerItemDto.builder().id("23").name("SOLANA").symbol("SOLUSDT").category("CRYPTO").build(),
            ScreenerItemDto.builder().id("24").name("BNB").symbol("BNBUSDT").category("CRYPTO").build()
    );

    @Cacheable(value = "stockHistory", key = "#symbol.toUpperCase()", sync = true)
    public List<CandleDto> getDailyHistory(String symbol) {
        String cleanSymbol = symbol.toUpperCase();
        log.info("Chargement historique pour {}", cleanSymbol);

        // 1. Consultation des vraies bougies déjà archivées en base
        try {
            List<MarketCandle> existingCandles = candleRepository
                    .findByAssetCodeAndTimeframeOrderByOpenTimeAsc(cleanSymbol, "1D");

            if (!existingCandles.isEmpty()) {
                MarketCandle latest = existingCandles.get(existingCandles.size() - 1);
                // Si la dernière bougie a moins de 24h, on sert le cache DB
                if (latest.getOpenTime().isAfter(Instant.now().minus(24, ChronoUnit.HOURS))) {
                    log.info("DB Hit pour {} ({} vraies bougies en base)", cleanSymbol, existingCandles.size());
                    return existingCandles.stream().map(this::toCandleDto).toList();
                }
            }
        } catch (Exception e) {
            log.warn("Lecture DB impossible pour {} ({}) — tentative via API externe", cleanSymbol, e.getMessage());
        }

        // 2. Appel API externe (Polygon)
        List<CandleDto> realCandles = null;
        try {
            realCandles = stockApiClient.fetchDailyHistory(cleanSymbol);
        } catch (Exception e) {
            log.warn("Fournisseur externe indisponible ou quota atteint pour {} ({})", cleanSymbol, e.getMessage());
        }

        // 3. Persistance STRICTE : uniquement si l'API a retourné des données réelles
        if (realCandles != null && !realCandles.isEmpty()) {
            persistCandles(cleanSymbol, "1D", realCandles);
            return realCandles;
        }

        // 4. Repli mémoire temporaire : données simulées envoyées au front, MAIS JAMAIS SAUVEGARDÉES EN BASE
        log.info("Génération de données de secours en mémoire pour {} (non persistées)", cleanSymbol);
        return generateFallbackCandles(cleanSymbol);
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
                log.info("{} vraies bougies de l'API enregistrées pour {}", toSave.size(), assetCode);
            }
        } catch (Exception e) {
            log.error("Échec persistance bougies pour {} (non-bloquant) : {}", assetCode, e.getMessage());
        }
    }

    private List<CandleDto> generateFallbackCandles(String symbol) {
        List<CandleDto> list = new ArrayList<>();
        Instant now = Instant.now().truncatedTo(ChronoUnit.DAYS);

        BigDecimal base = switch (symbol) {
            // Cryptos
            case "BTCUSDT" -> new BigDecimal("65000.00");
            case "ETHUSDT" -> new BigDecimal("3500.00");
            case "SOLUSDT" -> new BigDecimal("145.00");
            case "BNBUSDT" -> new BigDecimal("580.00");

            // Indices & ETFs
            case "SPY"     -> new BigDecimal("580.00");
            case "QQQ"     -> new BigDecimal("495.00");
            case "DIA"     -> new BigDecimal("425.00");
            case "IWM"     -> new BigDecimal("220.00");
            case "EEM"     -> new BigDecimal("44.50");
            case "VGK"     -> new BigDecimal("70.00");
            case "EWJ"     -> new BigDecimal("72.00");
            case "VIXY"    -> new BigDecimal("13.50");
            case "GLD"     -> new BigDecimal("250.00");
            case "TLT"     -> new BigDecimal("93.00");

            // Actions
            case "AAPL"    -> new BigDecimal("230.00");
            case "NVDA"    -> new BigDecimal("140.00");
            case "MSFT"    -> new BigDecimal("430.00");
            case "AMZN"    -> new BigDecimal("190.00");
            case "GOOGL"   -> new BigDecimal("170.00");
            case "META"    -> new BigDecimal("585.00");
            case "TSLA"    -> new BigDecimal("220.00");
            case "BRK.B"   -> new BigDecimal("450.00");
            case "AVGO"    -> new BigDecimal("180.00");
            case "JPM"     -> new BigDecimal("225.00");

            default        -> new BigDecimal("100.00");
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
            // Cryptos
            case "BTCUSDT" -> new BigDecimal("65000.00");
            case "ETHUSDT" -> new BigDecimal("3500.00");
            case "SOLUSDT" -> new BigDecimal("145.00");
            case "BNBUSDT" -> new BigDecimal("580.00");

            // Indices & ETFs
            case "SPY"     -> new BigDecimal("580.00");
            case "QQQ"     -> new BigDecimal("495.00");
            case "DIA"     -> new BigDecimal("425.00");
            case "IWM"     -> new BigDecimal("220.00");
            case "EEM"     -> new BigDecimal("44.50");
            case "VGK"     -> new BigDecimal("70.00");
            case "EWJ"     -> new BigDecimal("72.00");
            case "VIXY"    -> new BigDecimal("13.50");
            case "GLD"     -> new BigDecimal("250.00");
            case "TLT"     -> new BigDecimal("93.00");

            // Actions
            case "AAPL"    -> new BigDecimal("230.00");
            case "NVDA"    -> new BigDecimal("140.00");
            case "MSFT"    -> new BigDecimal("430.00");
            case "AMZN"    -> new BigDecimal("190.00");
            case "GOOGL"   -> new BigDecimal("170.00");
            case "META"    -> new BigDecimal("585.00");
            case "TSLA"    -> new BigDecimal("220.00");
            case "BRK.B"   -> new BigDecimal("450.00");
            case "AVGO"    -> new BigDecimal("180.00");
            case "JPM"     -> new BigDecimal("225.00");

            default        -> new BigDecimal("100.00");
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
