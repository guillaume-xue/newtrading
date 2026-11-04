package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.dto.ScreenerItemDto;
import com.newtrading.marketdata.model.MarketCandle;
import com.newtrading.marketdata.repository.MarketCandleRepository;
import com.newtrading.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    /**
     * Récupère l'historique complet pour le graphique :
     * 1. Vérifie si la base PostgreSQL est à jour (bougie de la dernière séance présente).
     * 2. Si OUI : sert UNIQUEMENT la base de données (zéro appel API externe).
     * 3. Si NON ou VIDE : interroge Polygon, synchronise PostgreSQL et renvoie les données.
     * 4. Si Polygon échoue (quota 429), renvoie les anciennes données en base ou génère un repli UI.
     */
    public List<CandleDto> getDailyHistory(String symbol) {
        String cleanSymbol = symbol.toUpperCase().trim();
        log.info("Consultation historique pour {}", cleanSymbol);

        Optional<MarketCandle> latestCandleOpt = candleRepository
                .findTopByAssetCodeAndTimeframeOrderByOpenTimeDesc(cleanSymbol, "1D");

        // 1. Contrôle de fraîcheur en base de données
        if (latestCandleOpt.isPresent()) {
            Instant latestTime = latestCandleOpt.get().getOpenTime();
            Instant expectedMarketClose = getExpectedPreviousTradingDayClose();

            if (!latestTime.isBefore(expectedMarketClose)) {
                log.info("Données PostgreSQL à jour pour {} ({}) — aucun appel API externe", cleanSymbol, latestTime);
                List<MarketCandle> existing = candleRepository
                        .findByAssetCodeAndTimeframeOrderByOpenTimeAsc(cleanSymbol, "1D");
                return existing.stream().map(this::toCandleDto).toList();
            }
            log.info("Données en base obsolètes pour {} (Dernière: {}, Requise: {}) — synchronisation API", cleanSymbol, latestTime, expectedMarketClose);
        } else {
            log.info("Base vide pour {} — synchronisation API initiale", cleanSymbol);
        }

        // 2. Appel API Polygon UNIQUEMENT si la base était vide ou obsolète
        List<CandleDto> realCandles = null;
        try {
            realCandles = stockApiClient.fetchDailyHistory(cleanSymbol);
        } catch (Exception e) {
            log.warn("Appel API Polygon impossible pour {} : {}", cleanSymbol, e.getMessage());
        }

        // 3. Sauvegarde immédiate en base de données
        if (realCandles != null && !realCandles.isEmpty()) {
            persistCandles(cleanSymbol, "1D", realCandles);
            return realCandles;
        }

        // 4. Si l'API échoue mais qu'on a déjà des bougies en base, on sert l'existant sans bloquer
        if (latestCandleOpt.isPresent()) {
            log.warn("Polygon indisponible : utilisation de l'historique existant en base pour {}", cleanSymbol);
            List<MarketCandle> existing = candleRepository
                    .findByAssetCodeAndTimeframeOrderByOpenTimeAsc(cleanSymbol, "1D");
            return existing.stream().map(this::toCandleDto).toList();
        }

        // 5. Cas extrême : base vide ET API inaccessible
        log.warn("Aucune donnée réelle (DB vide et API indisponible) pour {} -> repli mémoire temporaire", cleanSymbol);
        return generateFallbackCandles(cleanSymbol);
    }

    /**
     * Cotation pour l'affichage unitaire UI :
     * Priorise la base locale si elle est à jour avant d'envisager un appel réseau.
     */
    @Cacheable(value = "stockQuote", key = "#symbol.toUpperCase()", sync = true)
    public QuoteDto getQuote(String symbol) {
        String cleanSymbol = symbol.toUpperCase().trim();

        // 1. Vérifie si la base de données possède déjà une cotation à jour
        Optional<MarketCandle> latestOpt = candleRepository
                .findTopByAssetCodeAndTimeframeOrderByOpenTimeDesc(cleanSymbol, "1D");

        if (latestOpt.isPresent()) {
            MarketCandle latest = latestOpt.get();
            if (!latest.getOpenTime().isBefore(getExpectedPreviousTradingDayClose())) {
                BigDecimal change = BigDecimal.ZERO;
                BigDecimal changePercent = BigDecimal.ZERO;

                if (latest.getOpenPrice() != null && latest.getOpenPrice().compareTo(BigDecimal.ZERO) > 0) {
                    change = latest.getClosePrice().subtract(latest.getOpenPrice());
                    changePercent = change.divide(latest.getOpenPrice(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP);
                }

                return QuoteDto.builder()
                        .symbol(cleanSymbol)
                        .price(latest.getClosePrice())
                        .change(change)
                        .changePercent(changePercent)
                        .volume(latest.getVolume())
                        .timestamp(latest.getOpenTime())
                        .build();
            }
        }

        // 2. Si la base est obsolète ou vide, interroge l'API distante
        try {
            QuoteDto quote = stockApiClient.fetchQuote(cleanSymbol);
            if (quote != null && quote.getPrice() != null && quote.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                return quote;
            }
        } catch (Exception e) {
            log.warn("Cotation distante indisponible pour {} : {}", cleanSymbol, e.getMessage());
        }

        // 3. Repli sur l'ancienne valeur en base
        if (latestOpt.isPresent()) {
            MarketCandle latest = latestOpt.get();
            BigDecimal change = BigDecimal.ZERO;
            BigDecimal changePercent = BigDecimal.ZERO;

            if (latest.getOpenPrice() != null && latest.getOpenPrice().compareTo(BigDecimal.ZERO) > 0) {
                change = latest.getClosePrice().subtract(latest.getOpenPrice());
                changePercent = change.divide(latest.getOpenPrice(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
            }

            return QuoteDto.builder()
                    .symbol(cleanSymbol)
                    .price(latest.getClosePrice())
                    .change(change)
                    .changePercent(changePercent)
                    .volume(latest.getVolume())
                    .timestamp(latest.getOpenTime())
                    .build();
        }

        return generateFallbackQuote(cleanSymbol);
    }

    /**
     * Alimentation du Screener et de la Heatmap :
     * Lit directement la base de données PostgreSQL sans faire 24 requêtes HTTP externes en boucle.
     * Calcule la vraie variation du jour de cotation.
     */
    @Cacheable(value = "stockQuote", key = "'SCREENER_LIST'", sync = true)
    public List<ScreenerItemDto> getScreenerData() {
        log.info("Agrégation des données Screener / Heatmap depuis PostgreSQL");

        return SCREENER_UNIVERSE.stream()
                .map(item -> {
                    String symbol = item.getSymbol().toUpperCase();

                    Optional<MarketCandle> latestCandleOpt = candleRepository
                            .findTopByAssetCodeAndTimeframeOrderByOpenTimeDesc(symbol, "1D");

                    BigDecimal price = BigDecimal.ZERO;
                    BigDecimal change = BigDecimal.ZERO;
                    BigDecimal changePercent = BigDecimal.ZERO;
                    BigDecimal volume = BigDecimal.ZERO;

                    if (latestCandleOpt.isPresent()) {
                        MarketCandle c = latestCandleOpt.get();
                        price = c.getClosePrice();
                        volume = c.getVolume();

                        if (c.getOpenPrice() != null && c.getOpenPrice().compareTo(BigDecimal.ZERO) > 0) {
                            change = c.getClosePrice().subtract(c.getOpenPrice());
                            changePercent = change.divide(c.getOpenPrice(), 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .setScale(2, RoundingMode.HALF_UP);
                        }
                    } else {
                        // Repli uniquement si la base ne contient encore aucune bougie pour cet actif
                        QuoteDto fallback = generateFallbackQuote(symbol);
                        price = fallback.getPrice();
                        change = fallback.getChange();
                        changePercent = fallback.getChangePercent();
                        volume = fallback.getVolume();
                    }

                    return ScreenerItemDto.builder()
                            .id(item.getId())
                            .name(item.getName())
                            .symbol(symbol)
                            .category(item.getCategory())
                            .currentPrice(price)
                            .change(change)
                            .changePercent(changePercent)
                            .volume(volume)
                            .build();
                })
                .toList();
    }

    /**
     * RÈGLE STRICTE PAPER TRADING (ANTI-TRICHE) :
     * 1. Si la base PostgreSQL est à jour, utilise le prix de clôture certifié en base (ZÉRO appel API).
     * 2. Si la base est obsolète ou vide, tente Polygon en direct.
     * 3. Si Polygon échoue, utilise la dernière bougie en base si elle existe.
     * 4. Interdit formellement toute donnée simulée / mockée.
     */
    public QuoteDto getCertifiedQuoteForExecution(String symbol) {
        String cleanSymbol = symbol.toUpperCase().trim();

        Optional<MarketCandle> latestOpt = candleRepository
                .findTopByAssetCodeAndTimeframeOrderByOpenTimeDesc(cleanSymbol, "1D");

        // 1. Si la base de données est déjà à jour, validation directe sans appel API
        if (latestOpt.isPresent()) {
            MarketCandle latest = latestOpt.get();
            if (!latest.getOpenTime().isBefore(getExpectedPreviousTradingDayClose())
                    && latest.getClosePrice() != null && latest.getClosePrice().compareTo(BigDecimal.ZERO) > 0) {
                log.info("Ordre validé directement sur le cours PostgreSQL à jour pour {} : {} $", cleanSymbol, latest.getClosePrice());
                return QuoteDto.builder()
                        .symbol(cleanSymbol)
                        .price(latest.getClosePrice())
                        .change(BigDecimal.ZERO)
                        .changePercent(BigDecimal.ZERO)
                        .volume(latest.getVolume())
                        .timestamp(latest.getOpenTime())
                        .build();
            }
        }

        // 2. Si la base est vide ou obsolète, tentative d'appel API Polygon
        try {
            QuoteDto quote = stockApiClient.fetchQuote(cleanSymbol);
            if (quote != null && quote.getPrice() != null && quote.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                log.info("Ordre validé sur cotation Polygon pour {} : {} $", cleanSymbol, quote.getPrice());
                return quote;
            }
        } catch (Exception e) {
            log.warn("API distante inaccessible pour valider l'ordre de {} : {}", cleanSymbol, e.getMessage());
        }

        // 3. Repli certifié sur la dernière bougie en base
        if (latestOpt.isPresent()) {
            MarketCandle latest = latestOpt.get();
            if (latest.getClosePrice() != null && latest.getClosePrice().compareTo(BigDecimal.ZERO) > 0) {
                log.info("Ordre validé sur la dernière clôture en base pour {} : {} $ (date: {})",
                        cleanSymbol, latest.getClosePrice(), latest.getOpenTime());
                return QuoteDto.builder()
                        .symbol(cleanSymbol)
                        .price(latest.getClosePrice())
                        .change(BigDecimal.ZERO)
                        .changePercent(BigDecimal.ZERO)
                        .volume(latest.getVolume())
                        .timestamp(latest.getOpenTime())
                        .build();
            }
        }

        // 4. Rejet strict si aucune vraie donnée n'existe nulle part
        throw new BusinessException(
                "Impossible d'exécuter l'ordre : cours certifié indisponible pour " + cleanSymbol,
                HttpStatus.SERVICE_UNAVAILABLE,
                "MARKET_DATA_UNAVAILABLE"
        );
    }

    /**
     * Détermine la date de la dernière séance boursière clôturée.
     * Gère les week-ends (le week-end ou le lundi, la dernière séance correspond au vendredi).
     */
    private Instant getExpectedPreviousTradingDayClose() {
        LocalDate date = LocalDate.now(ZoneOffset.UTC).minusDays(1);

        if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            date = date.minusDays(2);
        } else if (date.getDayOfWeek() == DayOfWeek.SATURDAY) {
            date = date.minusDays(1);
        }

        return date.atStartOfDay(ZoneOffset.UTC).toInstant();
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
            case "BNBUSDT" -> new BigDecimal("580.00");
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
            case "BTCUSDT" -> new BigDecimal("65000.00");
            case "ETHUSDT" -> new BigDecimal("3500.00");
            case "SOLUSDT" -> new BigDecimal("145.00");
            case "BNBUSDT" -> new BigDecimal("580.00");
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
