package com.newtrading.marketdata.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.shared.exception.BusinessException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@ConditionalOnProperty(name = "application.marketdata.provider", havingValue = "polygon")
public class PolygonStockApiClient implements StockApiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public PolygonStockApiClient(
            @Value("${application.marketdata.polygon.base-url:https://api.polygon.io}") String baseUrl,
            @Value("${application.marketdata.polygon.api-key}") String apiKey,
            @Value("${application.marketdata.polygon.connect-timeout-ms:5000}") int connectTimeout,
            @Value("${application.marketdata.polygon.read-timeout-ms:8000}") int readTimeout,
            ObjectMapper objectMapper) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeout));
        factory.setReadTimeout(Duration.ofMillis(readTimeout));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultStatusHandler(HttpStatusCode::is4xxClientError, (request, response) -> {
                    log.error("Erreur client HTTP {} sur {}", response.getStatusCode(), request.getURI());
                    if (response.getStatusCode().value() == 429) {
                        throw new BusinessException("Quota externe Polygon dépassé", HttpStatus.TOO_MANY_REQUESTS);
                    }
                    if (response.getStatusCode().value() == 401 || response.getStatusCode().value() == 403) {
                        throw new BusinessException("Clé API Polygon invalide ou non autorisée", HttpStatus.UNAUTHORIZED);
                    }
                    throw new BusinessException("Erreur client Polygon : " + response.getStatusCode(),
                            HttpStatus.valueOf(response.getStatusCode().value()));
                })
                .defaultStatusHandler(HttpStatusCode::is5xxServerError, (request, response) -> {
                    log.error("Erreur serveur distant Polygon 5xx sur {}", request.getURI());
                    throw new BusinessException("Serveur Polygon indisponible", HttpStatus.BAD_GATEWAY);
                })
                .build();
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
    }

    private String normalizeTicker(String raw) {
        String clean = raw.trim().toUpperCase();
        // Gestion des paires Crypto pour Polygon (ex: BTCUSDT -> X:BTCUSD)
        if (clean.equals("BTCUSDT") || clean.equals("BTC/USD")) return "X:BTCUSD";
        if (clean.equals("ETHUSDT") || clean.equals("ETH/USD")) return "X:ETHUSD";
        if (clean.equals("SOLUSDT") || clean.equals("SOL/USD")) return "X:SOLUSD";
        if (clean.endsWith("USDT")) {
            return "X:" + clean.replace("USDT", "USD");
        }
        return clean;
    }

    @Override
    @RateLimiter(name = "polygonApi", fallbackMethod = "fetchDailyHistoryFallback")
    @CircuitBreaker(name = "polygonApi", fallbackMethod = "fetchDailyHistoryFallback")
    public List<CandleDto> fetchDailyHistory(String symbol) {
        String ticker = normalizeTicker(symbol);
        LocalDate toDate = LocalDate.now(ZoneOffset.UTC).minusDays(1);
        LocalDate fromDate = toDate.minusYears(1);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String fromStr = fromDate.format(fmt);
        String toStr = toDate.format(fmt);

        log.info("Interrogation Polygon History : ticker={}, from={}, to={}", ticker, fromStr, toStr);

        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}")
                        .queryParam("adjusted", "true")
                        .queryParam("sort", "asc")
                        .queryParam("limit", 500)
                        .queryParam("apiKey", apiKey)
                        .build(ticker, fromStr, toStr))
                .retrieve()
                .body(String.class);

        return parseCandles(response, symbol);
    }

    @Override
    @RateLimiter(name = "polygonApi", fallbackMethod = "fetchQuoteFallback")
    @CircuitBreaker(name = "polygonApi", fallbackMethod = "fetchQuoteFallback")
    public QuoteDto fetchQuote(String symbol) {
        String ticker = normalizeTicker(symbol);

        log.info("Interrogation Polygon Quote : ticker={}", ticker);

        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/aggs/ticker/{ticker}/prev")
                        .queryParam("adjusted", "true")
                        .queryParam("apiKey", apiKey)
                        .build(ticker))
                .retrieve()
                .body(String.class);

        return parsePreviousCloseQuote(response, symbol);
    }

    // --- Fallbacks Resilience4j ---

    public List<CandleDto> fetchDailyHistoryFallback(String symbol, RequestNotPermitted ex) {
        log.warn("RateLimiter Polygon déclenché pour {} (History) : quota dépassé", symbol);
        return null;
    }

    public List<CandleDto> fetchDailyHistoryFallback(String symbol, Throwable ex) {
        log.warn("Échec appel Polygon pour {} (History) : {}", symbol, ex.getMessage());
        return null;
    }

    public QuoteDto fetchQuoteFallback(String symbol, RequestNotPermitted ex) {
        log.warn("RateLimiter Polygon déclenché pour {} (Quote) : quota dépassé", symbol);
        return null;
    }

    public QuoteDto fetchQuoteFallback(String symbol, Throwable ex) {
        log.warn("Échec appel Polygon pour {} (Quote) : {}", symbol, ex.getMessage());
        return null;
    }

    private List<CandleDto> parseCandles(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode results = root.get("results");
            if (results == null || !results.isArray() || results.isEmpty()) {
                log.warn("Polygon : aucune bougie trouvée dans le JSON pour {}", symbol);
                return null;
            }

            List<CandleDto> candles = new ArrayList<>(results.size());
            for (JsonNode node : results) {
                candles.add(CandleDto.builder()
                        .timestamp(Instant.ofEpochMilli(node.get("t").asLong()))
                        .open(new BigDecimal(node.get("o").asText()))
                        .high(new BigDecimal(node.get("h").asText()))
                        .low(new BigDecimal(node.get("l").asText()))
                        .close(new BigDecimal(node.get("c").asText()))
                        .volume(new BigDecimal(node.get("v").asText()))
                        .build());
            }
            log.info("Polygon : {} bougies réelles chargées avec succès pour {}", candles.size(), symbol);
            return candles;
        } catch (Exception e) {
            log.error("Erreur parsing bougies Polygon pour {} : {}", symbol, e.getMessage());
            return null;
        }
    }

    private QuoteDto parsePreviousCloseQuote(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode results = root.get("results");
            if (results == null || !results.isArray() || results.isEmpty()) {
                log.warn("Polygon : aucun résultat pour le quote de {}", symbol);
                return null;
            }

            JsonNode node = results.get(0);
            BigDecimal closePrice = new BigDecimal(node.get("c").asText());
            BigDecimal openPrice = new BigDecimal(node.get("o").asText());
            BigDecimal change = closePrice.subtract(openPrice);
            BigDecimal changePercent = BigDecimal.ZERO;
            if (openPrice.compareTo(BigDecimal.ZERO) != 0) {
                changePercent = change.divide(openPrice, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            log.info("Polygon : cotation réelle reçue pour {} -> prix={}", symbol, closePrice);

            return QuoteDto.builder()
                    .symbol(symbol)
                    .price(closePrice)
                    .change(change)
                    .changePercent(changePercent)
                    .volume(new BigDecimal(node.get("v").asText()))
                    .timestamp(Instant.ofEpochMilli(node.get("t").asLong()))
                    .build();
        } catch (Exception e) {
            log.error("Erreur parsing Quote Polygon pour {} : {}", symbol, e.getMessage());
            return null;
        }
    }
}
