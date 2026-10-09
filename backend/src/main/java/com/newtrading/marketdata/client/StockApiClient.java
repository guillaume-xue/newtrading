package com.newtrading.marketdata.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Component
public class StockApiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public StockApiClient(
            @Value("${application.marketdata.alpha-vantage.base-url}") String baseUrl,
            @Value("${application.marketdata.alpha-vantage.api-key}") String apiKey,
            @Value("${application.marketdata.alpha-vantage.connect-timeout-ms}") int connectTimeout,
            @Value("${application.marketdata.alpha-vantage.read-timeout-ms}") int readTimeout,
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

    public List<CandleDto> fetchDailyHistory(String symbol) {
        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "TIME_SERIES_DAILY")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .body(String.class);

        return parseDailyTimeSeries(response, symbol);
    }

    public QuoteDto fetchQuote(String symbol) {
        String response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/query")
                        .queryParam("function", "GLOBAL_QUOTE")
                        .queryParam("symbol", symbol)
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .body(String.class);

        return parseGlobalQuote(response, symbol);
    }

    private List<CandleDto> parseDailyTimeSeries(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            checkApiErrors(root);

            JsonNode timeSeries = root.get("Time Series (Daily)");
            if (timeSeries == null || !timeSeries.isObject()) {
                throw new BusinessException("Données de marché introuvables pour le symbole : " + symbol, HttpStatus.NOT_FOUND);
            }

            List<CandleDto> candles = new ArrayList<>();
            Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();

            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                LocalDate date = LocalDate.parse(entry.getKey());
                JsonNode candleNode = entry.getValue();

                candles.add(CandleDto.builder()
                        .timestamp(date.atStartOfDay().toInstant(ZoneOffset.UTC))
                        .open(new BigDecimal(candleNode.get("1. open").asText()))
                        .high(new BigDecimal(candleNode.get("2. high").asText()))
                        .low(new BigDecimal(candleNode.get("3. low").asText()))
                        .close(new BigDecimal(candleNode.get("4. close").asText()))
                        .volume(new BigDecimal(candleNode.get("5. volume").asText()))
                        .build());
            }

            Collections.reverse(candles);
            return candles;
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur lors de la récupération des données de marché : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private QuoteDto parseGlobalQuote(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            checkApiErrors(root);

            JsonNode quoteNode = root.get("Global Quote");
            if (quoteNode == null || quoteNode.isEmpty()) {
                throw new BusinessException("Cotation introuvable pour le symbole : " + symbol, HttpStatus.NOT_FOUND);
            }

            String rawPercent = quoteNode.get("10. change percent").asText().replace("%", "");

            return QuoteDto.builder()
                    .symbol(symbol.toUpperCase())
                    .price(new BigDecimal(quoteNode.get("05. price").asText()))
                    .change(new BigDecimal(quoteNode.get("09. change").asText()))
                    .changePercent(new BigDecimal(rawPercent))
                    .volume(new BigDecimal(quoteNode.get("06. volume").asText()))
                    .timestamp(LocalDate.parse(quoteNode.get("07. latest trading day").asText()).atStartOfDay().toInstant(ZoneOffset.UTC))
                    .build();
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur lors du traitement de la cotation : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private void checkApiErrors(JsonNode root) {
        if (root.has("Note") || root.has("Information")) {
            throw new BusinessException("Quota d'appels API Alpha Vantage atteint", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (root.has("Error Message")) {
            throw new BusinessException("Symbole boursier invalide ou inconnu", HttpStatus.BAD_REQUEST);
        }
    }
}
