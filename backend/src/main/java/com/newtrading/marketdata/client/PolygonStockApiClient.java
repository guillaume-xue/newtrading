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
            @Value("${application.marketdata.polygon.read-timeout-ms:10000}") int readTimeout,
            ObjectMapper objectMapper) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeout));
        factory.setReadTimeout(Duration.ofMillis(readTimeout));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultStatusHandler(HttpStatusCode::is4xxClientError, (request, response) -> {
                    if (response.getStatusCode().value() == 429) {
                        throw new BusinessException("Quota externe Polygon dépassé", HttpStatus.TOO_MANY_REQUESTS);
                    }
                    if (response.getStatusCode().value() == 401 || response.getStatusCode().value() == 403) {
                        throw new BusinessException("Clé API Polygon invalide ou expirée", HttpStatus.UNAUTHORIZED);
                    }
                    throw new BusinessException("Erreur client Polygon : " + response.getStatusCode(),
                            HttpStatus.valueOf(response.getStatusCode().value()));
                })
                .defaultStatusHandler(HttpStatusCode::is5xxServerError, (request, response) -> {
                    throw new BusinessException("Serveur Polygon distant indisponible", HttpStatus.BAD_GATEWAY);
                })
                .build();
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
    }

    @Override
    @RateLimiter(name = "polygonApi", fallbackMethod = "fetchDailyHistoryFallback")
    @CircuitBreaker(name = "polygonApi", fallbackMethod = "fetchDailyHistoryFallback")
    public List<CandleDto> fetchDailyHistory(String symbol) {
        String cleanSymbol = symbol.toUpperCase();
        LocalDate toDate = LocalDate.now(ZoneOffset.UTC).minusDays(1);
        LocalDate fromDate = toDate.minusYears(2);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String fromStr = fromDate.format(formatter);
        String toStr = toDate.format(formatter);

        log.debug("Appel sortant Polygon History pour {}", cleanSymbol);

        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/aggs/ticker/{ticker}/range/1/day/{from}/{to}")
                        .queryParam("adjusted", "true")
                        .queryParam("sort", "asc")
                        .queryParam("limit", 5000)
                        .queryParam("apiKey", apiKey)
                        .build(cleanSymbol, fromStr, toStr))
                .retrieve()
                .body(String.class);

        return parseCandles(response, cleanSymbol);
    }

    @Override
    @RateLimiter(name = "polygonApi", fallbackMethod = "fetchQuoteFallback")
    @CircuitBreaker(name = "polygonApi", fallbackMethod = "fetchQuoteFallback")
    public QuoteDto fetchQuote(String symbol) {
        String cleanSymbol = symbol.toUpperCase();

        log.debug("Appel sortant Polygon Quote pour {}", cleanSymbol);

        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v2/aggs/ticker/{ticker}/prev")
                        .queryParam("adjusted", "true")
                        .queryParam("apiKey", apiKey)
                        .build(cleanSymbol))
                .retrieve()
                .body(String.class);

        return parsePreviousCloseQuote(response, cleanSymbol);
    }

    // --- Fallbacks Resilience4j ---

    public List<CandleDto> fetchDailyHistoryFallback(String symbol, RequestNotPermitted ex) {
        log.warn("RateLimiter actif sur Polygon (History) pour {} : requête rejetée en amont", symbol);
        throw new BusinessException("Serveur surchargé : quota d'appels externes atteint. Veuillez réessayer dans quelques instants.", HttpStatus.TOO_MANY_REQUESTS);
    }

    public List<CandleDto> fetchDailyHistoryFallback(String symbol, Throwable ex) {
        log.error("CircuitBreaker ou panne réseau sur Polygon (History) pour {} : {}", symbol, ex.getMessage());
        throw new BusinessException("Service de cotation momentanément indisponible.", HttpStatus.SERVICE_UNAVAILABLE);
    }

    public QuoteDto fetchQuoteFallback(String symbol, RequestNotPermitted ex) {
        log.warn("RateLimiter actif sur Polygon (Quote) pour {} : requête rejetée en amont", symbol);
        throw new BusinessException("Quota d'appels externes atteint pour la cotation en direct.", HttpStatus.TOO_MANY_REQUESTS);
    }

    public QuoteDto fetchQuoteFallback(String symbol, Throwable ex) {
        log.error("CircuitBreaker ou panne réseau sur Polygon (Quote) pour {} : {}", symbol, ex.getMessage());
        throw new BusinessException("Service de cotation momentanément indisponible.", HttpStatus.SERVICE_UNAVAILABLE);
    }

    // --- Parsing existant conservé ---

    private List<CandleDto> parseCandles(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.has("status") && "ERROR".equalsIgnoreCase(root.get("status").asText())) {
                throw new BusinessException(root.path("error").asText("Erreur Polygon"), HttpStatus.BAD_REQUEST);
            }

            JsonNode results = root.get("results");
            if (results == null || !results.isArray() || results.isEmpty()) {
                throw new BusinessException("Aucune donnée disponible pour : " + symbol, HttpStatus.NOT_FOUND);
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
            return candles;
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur parsing bougies Polygon : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private QuoteDto parsePreviousCloseQuote(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode results = root.get("results");

            if (results == null || !results.isArray() || results.isEmpty()) {
                throw new BusinessException("Cotation introuvable : " + symbol, HttpStatus.NOT_FOUND);
            }

            JsonNode node = results.get(0);
            BigDecimal closePrice = new BigDecimal(node.get("c").asText());
            BigDecimal openPrice = new BigDecimal(node.get("o").asText());
            BigDecimal change = closePrice.subtract(openPrice);
            BigDecimal changePercent = BigDecimal.ZERO;
            if (openPrice.compareTo(BigDecimal.ZERO) != 0) {
                changePercent = change.divide(openPrice, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }

            return QuoteDto.builder()
                    .symbol(symbol)
                    .price(closePrice)
                    .change(change)
                    .changePercent(changePercent)
                    .volume(new BigDecimal(node.get("v").asText()))
                    .timestamp(Instant.ofEpochMilli(node.get("t").asLong()))
                    .build();
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur parsing Quote Polygon : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }
}
