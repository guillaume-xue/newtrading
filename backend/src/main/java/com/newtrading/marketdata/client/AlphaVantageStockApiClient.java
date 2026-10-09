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
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Component
@ConditionalOnProperty(name = "application.marketdata.provider", havingValue = "alpha-vantage", matchIfMissing = true)
public class AlphaVantageStockApiClient implements StockApiClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public AlphaVantageStockApiClient(
            @Value("${application.marketdata.alpha-vantage.base-url}") String baseUrl,
            @Value("${application.marketdata.alpha-vantage.api-key}") String apiKey,
            @Value("${application.marketdata.alpha-vantage.connect-timeout-ms:5000}") int connectTimeout,
            @Value("${application.marketdata.alpha-vantage.read-timeout-ms:5000}") int readTimeout,
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

    @Override
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
                throw new BusinessException("Données de marché introuvables : " + symbol, HttpStatus.NOT_FOUND);
            }

            List<CandleDto> candles = new ArrayList<>();
            Iterator<Map.Entry<String, JsonNode>> fields = timeSeries.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                LocalDate date = LocalDate.parse(entry.getKey());
                JsonNode node = entry.getValue();

                candles.add(CandleDto.builder()
                        .timestamp(date.atStartOfDay().toInstant(ZoneOffset.UTC))
                        .open(new BigDecimal(node.get("1. open").asText()))
                        .high(new BigDecimal(node.get("2. high").asText()))
                        .low(new BigDecimal(node.get("3. low").asText()))
                        .close(new BigDecimal(node.get("4. close").asText()))
                        .volume(new BigDecimal(node.get("5. volume").asText()))
                        .build());
            }
            Collections.reverse(candles);
            return candles;
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur parsing Alpha Vantage : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private QuoteDto parseGlobalQuote(String json, String symbol) {
        try {
            JsonNode root = objectMapper.readTree(json);
            checkApiErrors(root);

            JsonNode quote = root.get("Global Quote");
            if (quote == null || quote.isEmpty()) {
                throw new BusinessException("Cotation introuvable : " + symbol, HttpStatus.NOT_FOUND);
            }

            return QuoteDto.builder()
                    .symbol(symbol.toUpperCase())
                    .price(new BigDecimal(quote.get("05. price").asText()))
                    .change(new BigDecimal(quote.get("09. change").asText()))
                    .changePercent(new BigDecimal(quote.get("10. change percent").asText().replace("%", "")))
                    .volume(new BigDecimal(quote.get("06. volume").asText()))
                    .timestamp(LocalDate.parse(quote.get("07. latest trading day").asText()).atStartOfDay().toInstant(ZoneOffset.UTC))
                    .build();
        } catch (BusinessException be) {
            throw be;
        } catch (Exception e) {
            throw new BusinessException("Erreur parsing Quote : " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    private void checkApiErrors(JsonNode root) {
        if (root.has("Note") || root.has("Information")) {
            throw new BusinessException("Quota d'appels Alpha Vantage atteint", HttpStatus.TOO_MANY_REQUESTS);
        }
        if (root.has("Error Message")) {
            throw new BusinessException("Symbole boursier invalide", HttpStatus.BAD_REQUEST);
        }
    }
}
