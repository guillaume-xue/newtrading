package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.QuoteDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.math.BigDecimal;
import java.time.Instant;

import static org.mockito.Mockito.*;

@SpringJUnitConfig(classes = {
        MarketDataCacheService.class,
        MarketDataCacheServiceTest.TestCacheConfig.class
})
class MarketDataCacheServiceTest {

    @Configuration
    @EnableCaching
    static class TestCacheConfig {
        @Bean
        public CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("stockHistory", "stockQuote");
        }
    }

    @MockitoBean
    private StockApiClient stockApiClient;

    @Autowired
    private MarketDataCacheService cacheService;

    @Test
    void getQuote_shouldHitCacheOnSecondCall() {
        QuoteDto mockQuote = QuoteDto.builder()
                .symbol("NVDA")
                .price(BigDecimal.valueOf(900))
                .timestamp(Instant.now())
                .build();

        when(stockApiClient.fetchQuote("NVDA")).thenReturn(mockQuote);

        // Premier appel : doit interroger le client
        cacheService.getQuote("NVDA");

        // Deuxième appel : doit être servi directement par le cache
        cacheService.getQuote("NVDA");

        // Vérification : 1 seul appel au client externe
        verify(stockApiClient, times(1)).fetchQuote("NVDA");
    }
}
