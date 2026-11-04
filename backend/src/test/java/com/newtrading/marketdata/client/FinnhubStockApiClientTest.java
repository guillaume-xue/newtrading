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

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@WireMockTest
class FinnhubStockApiClientTest {

    private FinnhubStockApiClient finnhubClient;

    @BeforeEach
    void setUp(WireMockRuntimeInfo wmRuntimeInfo) {
        finnhubClient = new FinnhubStockApiClient(
                wmRuntimeInfo.getHttpBaseUrl(),
                "test-api-key",
                2000,
                2000,
                new ObjectMapper()
        );
    }

    @Test
    void fetchQuote_nominal_success() {
        String mockResponse = """
        {
            "c": 182.52,
            "d": 1.25,
            "dp": 0.69,
            "h": 183.00,
            "l": 180.10,
            "o": 181.00,
            "pc": 181.27,
            "t": 1709251200
        }
        """;

        stubFor(get(urlPathEqualTo("/quote"))
                .withQueryParam("symbol", equalTo("AAPL"))
                .withQueryParam("token", equalTo("test-api-key"))
                .willReturn(okJson(mockResponse)));

        QuoteDto quote = finnhubClient.fetchQuote("AAPL");

        assertThat(quote.getSymbol()).isEqualTo("AAPL");
        assertThat(quote.getPrice()).isEqualByComparingTo("182.52");
        assertThat(quote.getChange()).isEqualByComparingTo("1.25");
        assertThat(quote.getChangePercent()).isEqualByComparingTo("0.69");
    }

    @Test
    void fetchQuote_symbolNotFound_throwsNotFound() {
        String mockResponse = """
        {
            "c": 0,
            "d": null,
            "dp": null,
            "h": 0,
            "l": 0,
            "o": 0,
            "pc": 0,
            "t": 0
        }
        """;

        stubFor(get(urlPathEqualTo("/quote"))
                .withQueryParam("symbol", equalTo("INVALID"))
                .willReturn(okJson(mockResponse)));

        assertThatThrownBy(() -> finnhubClient.fetchQuote("INVALID"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
    }

    @Test
    void fetchDailyHistory_nominal_success() {
        String mockResponse = """
        {
            "s": "ok",
            "t": [1709251200],
            "o": [181.00],
            "h": [183.00],
            "l": [180.10],
            "c": [182.52],
            "v": [45000000]
        }
        """;

        stubFor(get(urlPathEqualTo("/stock/candle"))
                .withQueryParam("symbol", equalTo("AAPL"))
                .withQueryParam("resolution", equalTo("D"))
                .willReturn(okJson(mockResponse)));

        List<CandleDto> candles = finnhubClient.fetchDailyHistory("AAPL");

        assertThat(candles).hasSize(1);
        assertThat(candles.get(0).getClose()).isEqualByComparingTo("182.52");
        assertThat(candles.get(0).getVolume()).isEqualByComparingTo("45000000");
    }

    @Test
    void fetchQuote_rateLimitReached_throwsTooManyRequests() {
        stubFor(get(urlPathEqualTo("/quote"))
                .willReturn(aResponse().withStatus(429)));

        assertThatThrownBy(() -> finnhubClient.fetchQuote("AAPL"))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
    }
}
