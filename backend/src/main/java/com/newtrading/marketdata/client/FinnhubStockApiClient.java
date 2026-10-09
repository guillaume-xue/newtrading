package com.newtrading.marketdata.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
@ConditionalOnProperty(name = "application.marketdata.provider", havingValue = "finnhub")
public class FinnhubStockApiClient implements StockApiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public FinnhubStockApiClient(
            @Value("${application.marketdata.finnhub.base-url}") String baseUrl,
            @Value("${application.marketdata.finnhub.api-key}") String apiKey,
            @Value("${application.marketdata.finnhub.connect-timeout-ms:5000}") int connectTimeout,
            @Value("${application.marketdata.finnhub.read-timeout-ms:5000}") int readTimeout,
            ObjectMapper objectMapper) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(connectTimeout));
        factory.setReadTimeout(Duration.ofMillis(readTimeout));

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<CandleDto> fetchDailyHistory(String symbol) {
        long to = Instant.now().getEpochSecond();
        long from = Instant.now().minus(365, ChronoUnit.DAYS).getEpochSecond();

        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/stock/candle")
                        .queryParam("symbol", symbol.toUpperCase())
                        .queryParam("resolution", "D")
                        .queryParam("from", from)
                        .queryParam("to", to)
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .body(String.class);

        return parseCandles(response, symbol);
    }

    @Override
    public QuoteDto fetchQuote(String symbol) {
        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/quote")
                        .queryParam("symbol", symbol.toUpperCase())
                        .queryParam("token", apiKey)
                        .build())
                .retrieve()
                .body(String.class);

        return parseQuote(response, symbol);
    }

    private List<CandleDto> parseCandles(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.has("s") && "no_data".equals(root.get("s").asText())) {
                throw new BusinessException("Aucune donnée disponible pour : " + symbol, HttpStatus.NOT_FOUND);
            }

            JsonNode timestamps = root.get("t");
            JsonNode opens = root.get("o");
            JsonNode highs = root.get("h");
            JsonNode lows = root.get("l");
            JsonNode closes = root.get("c");
            JsonNode volumes = root.get("v");

            if (timestamps == null || !timestamps.isArray()) {
                throw new BusinessException("Réponse Finnhub invalide", HttpStatus.BAD_GATEWAY);
            }

            List<CandleDto> candles = new ArrayList<>();
            for (int i = 0; i < timestamps.size(); i++) {
                candles.add(CandleDto.builder()
                        .timestamp(Instant.ofEpochSecond(timestamps.get(i).asLong()))
                        .open(new BigDecimal(opens.get(i).asText()))
                        .high(new BigDecimal(highs.get(i).asText()))
                        .low(new BigDecimal(lows.get(i).asText()))
                        .close(new BigDecimal(closes.get(i).asText()))
                        .volume(new BigDecimal(volumes.get(i).asText()))
                        .build());
            }
            return candles;
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur parsing bougies : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private QuoteDto parseQuote(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            BigDecimal currentPrice = new BigDecimal(root.get("c").asText());
            if (currentPrice.compareTo(BigDecimal.ZERO) == 0 && root.get("t").asLong() == 0) {
                throw new BusinessException("Symbole boursier introuvable : " + symbol, HttpStatus.NOT_FOUND);
            }

            return QuoteDto.builder()
                    .symbol(symbol.toUpperCase())
                    .price(currentPrice)
                    .change(new BigDecimal(root.get("d").asText()))
                    .changePercent(new BigDecimal(root.get("dp").asText()))
                    .volume(BigDecimal.ZERO)
                    .timestamp(Instant.ofEpochSecond(root.get("t").asLong()))
                    .build();
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur parsing quote : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }
}
