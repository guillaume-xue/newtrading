package com.newtrading.marketdata.controller;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.repository.MarketCandleRepository;
import com.newtrading.shared.config.CacheConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketDataControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CacheManager cacheManager;

    @MockitoBean
    private StockApiClient stockApiClient;

    @MockitoBean
    private MarketCandleRepository candleRepository;

    @BeforeEach
    void clearCaches() {
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.CACHE_STOCK_HISTORY)).clear();
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.CACHE_STOCK_QUOTE)).clear();
    }

    @Test
    @DisplayName("GET /market/history/{symbol} : Deux appels successifs ne doivent interroger le provider qu'une seule fois (Cache Hit)")
    void getHistory_subsequentCalls_servedFromCache() throws Exception {
        CandleDto candle = CandleDto.builder()
                .timestamp(Instant.now())
                .open(new BigDecimal("150.00"))
                .high(new BigDecimal("155.00"))
                .low(new BigDecimal("149.00"))
                .close(new BigDecimal("153.50"))
                .volume(new BigDecimal("1000000"))
                .build();

        when(candleRepository.findByAssetCodeAndTimeframeOrderByOpenTimeAsc("AAPL", "1D"))
                .thenReturn(Collections.emptyList());
        when(stockApiClient.fetchDailyHistory("AAPL"))
                .thenReturn(List.of(candle));

        // 1er appel : Cache Miss -> interroge le repository puis le client externe
        mockMvc.perform(get("/market/history/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].close", is(153.50)));

        verify(stockApiClient, times(1)).fetchDailyHistory("AAPL");

        // 2e appel immédiat : Cache Hit Caffeine -> aucun appel externe ni DB
        mockMvc.perform(get("/market/history/AAPL"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].close", is(153.50)));

        verify(stockApiClient, times(1)).fetchDailyHistory("AAPL");
    }

    @Test
    @DisplayName("GET /market/quote/{symbol} : La cotation instantanée doit également être mise en cache")
    void getQuote_subsequentCalls_servedFromCache() throws Exception {
        QuoteDto quote = QuoteDto.builder()
                .symbol("NVDA")
                .price(new BigDecimal("125.50"))
                .change(new BigDecimal("2.50"))
                .changePercent(new BigDecimal("2.03"))
                .volume(new BigDecimal("500000"))
                .timestamp(Instant.now())
                .build();

        when(stockApiClient.fetchQuote("NVDA")).thenReturn(quote);

        // Premier appel : Miss
        mockMvc.perform(get("/market/quote/NVDA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol", is("NVDA")))
                .andExpect(jsonPath("$.price", is(125.50)));

        verify(stockApiClient, times(1)).fetchQuote("NVDA");

        // Deuxième appel : Hit
        mockMvc.perform(get("/market/quote/NVDA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol", is("NVDA")))
                .andExpect(jsonPath("$.price", is(125.50)));

        verify(stockApiClient, times(1)).fetchQuote("NVDA");
    }
}
