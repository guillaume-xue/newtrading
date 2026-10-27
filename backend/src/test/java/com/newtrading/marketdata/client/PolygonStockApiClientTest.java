package com.newtrading.marketdata.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo;
import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.shared.exception.BusinessException;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Duration;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@WireMockTest
class PolygonStockApiClientTest {

    private PolygonStockApiClient polygonClient;
    private RateLimiter rateLimiter;

    @BeforeEach
    void setUp(WireMockRuntimeInfo wmRuntimeInfo) {
        // Configuration du RateLimiter : 5 requêtes par période de 60s, timeout 0ms
        RateLimiterConfig config = RateLimiterConfig.custom()
                .limitForPeriod(5)
                .limitRefreshPeriod(Duration.ofSeconds(60))
                .timeoutDuration(Duration.ZERO)
                .build();

        RateLimiterRegistry registry = RateLimiterRegistry.of(config);
        rateLimiter = registry.rateLimiter("polygonApi");

        polygonClient = new PolygonStockApiClient(
                wmRuntimeInfo.getHttpBaseUrl(),
                "test-api-key",
                2000,
                2000,
                new ObjectMapper()
        );
    }

    @Test
    @DisplayName("Doit mapper correctement la cotation Polygon (prev close)")
    void fetchQuote_nominal_success() {
        String mockResponse = """
        {
            "status": "OK",
            "resultsCount": 1,
            "results": [
                {
                    "T": "AAPL",
                    "c": 182.50,
                    "h": 184.00,
                    "l": 181.20,
                    "o": 180.00,
                    "t": 1709251200000,
                    "v": 54200000
                }
            ]
        }
        """;

        stubFor(get(urlPathEqualTo("/v2/aggs/ticker/AAPL/prev"))
                .willReturn(okJson(mockResponse)));

        QuoteDto quote = polygonClient.fetchQuote("AAPL");

        assertThat(quote.getSymbol()).isEqualTo("AAPL");
        assertThat(quote.getPrice()).isEqualByComparingTo("182.50");
        assertThat(quote.getChange()).isEqualByComparingTo("2.50");
        assertThat(quote.getChangePercent()).isEqualByComparingTo("1.39");
    }

    @Test
    @DisplayName("Doit bloquer proactivement la 6ème requête sans appeler l'API distante")
    void fetchQuote_rateLimiter_blocksSixthRequest() {
        String mockResponse = """
        {
            "status": "OK",
            "resultsCount": 1,
            "results": [{ "T": "AAPL", "c": 180.0, "o": 180.0, "t": 1709251200000, "v": 1000 }]
        }
        """;

        stubFor(get(urlPathEqualTo("/v2/aggs/ticker/AAPL/prev"))
                .willReturn(okJson(mockResponse)));

        // Exécution des 5 requêtes autorisées protégées par le RateLimiter
        for (int i = 0; i < 5; i++) {
            RateLimiter.decorateSupplier(rateLimiter, () -> polygonClient.fetchQuote("AAPL")).get();
        }

        // Vérification que WireMock a bien reçu exactement 5 requêtes
        verify(5, getRequestedFor(urlPathEqualTo("/v2/aggs/ticker/AAPL/prev")));

        // La 6ème tentative doit être immédiatement interceptée par le RateLimiter
        assertThatThrownBy(() ->
                RateLimiter.decorateSupplier(rateLimiter, () -> polygonClient.fetchQuote("AAPL")).get()
        ).isInstanceOf(io.github.resilience4j.ratelimiter.RequestNotPermitted.class);

        // Garantie essentielle : WireMock n'a toujours reçu QUE 5 requêtes (aucun appel supplémentaire émis)
        verify(5, getRequestedFor(urlPathEqualTo("/v2/aggs/ticker/AAPL/prev")));
    }

    @Test
    @DisplayName("Doit lever une BusinessException 429 si Polygon renvoie malgré tout un HTTP 429")
    void fetchQuote_http429FromProvider_throwsBusinessException() {
        stubFor(get(urlPathEqualTo("/v2/aggs/ticker/AAPL/prev"))
                .willReturn(aResponse().withStatus(429)));

        assertThatThrownBy(() -> polygonClient.fetchQuote("AAPL"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }
}
