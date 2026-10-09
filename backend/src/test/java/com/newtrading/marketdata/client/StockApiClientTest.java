package com.newtrading.marketdata.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.junit5.WireMockRuntimeInfo;
import com.github.tomakehurst.wiremock.junit5.WireMockTest;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@WireMockTest
class StockApiClientTest {

    private StockApiClient stockApiClient;

    @BeforeEach
    void setUp(WireMockRuntimeInfo wmRuntimeInfo) {
        stockApiClient = new StockApiClient(
                wmRuntimeInfo.getHttpBaseUrl(),
                "test-api-key",
                2000,
                2000,
                new ObjectMapper()
        );
    }

    @Test
    void fetchDailyHistory_nominal_success() {
        String mockResponse = """
        {
            "Meta Data": { "2. Symbol": "AAPL" },
            "Time Series (Daily)": {
                "2026-03-01": {
                    "1. open": "150.00",
                    "2. high": "155.00",
                    "3. low": "149.00",
                    "4. close": "153.50",
                    "5. volume": "1200000"
                }
            }
        }
        """;

        stubFor(get(urlPathEqualTo("/query"))
                .withQueryParam("function", equalTo("TIME_SERIES_DAILY"))
                .withQueryParam("symbol", equalTo("AAPL"))
                .willReturn(okJson(mockResponse)));

        List<CandleDto> result = stockApiClient.fetchDailyHistory("AAPL");

        assertThat(result).hasSize(1);
        CandleDto candle = result.get(0);
        assertThat(candle.getClose()).isEqualByComparingTo("153.50");
        assertThat(candle.getOpen()).isEqualByComparingTo("150.00");
    }

    @Test
    void fetchDailyHistory_rateLimitReached_throwsBusinessException() {
        String rateLimitResponse = """
        { "Note": "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute." }
        """;

        stubFor(get(urlPathEqualTo("/query"))
                .willReturn(okJson(rateLimitResponse)));

        assertThatThrownBy(() -> stockApiClient.fetchDailyHistory("AAPL"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }

    @Test
    void fetchQuote_nominal_success() {
        String mockResponse = """
        {
            "Global Quote": {
                "01. symbol": "AAPL",
                "05. price": "180.25",
                "06. volume": "500000",
                "07. latest trading day": "2026-03-01",
                "09. change": "2.50",
                "10. change percent": "1.40%"
            }
        }
        """;

        stubFor(get(urlPathEqualTo("/query"))
                .withQueryParam("function", equalTo("GLOBAL_QUOTE"))
                .withQueryParam("symbol", equalTo("AAPL"))
                .willReturn(okJson(mockResponse)));

        QuoteDto quote = stockApiClient.fetchQuote("AAPL");

        assertThat(quote.getSymbol()).isEqualTo("AAPL");
        assertThat(quote.getPrice()).isEqualByComparingTo("180.25");
        assertThat(quote.getChangePercent()).isEqualByComparingTo("1.40");
    }
}
