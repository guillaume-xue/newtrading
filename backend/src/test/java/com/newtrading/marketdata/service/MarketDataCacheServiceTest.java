package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.model.MarketCandle;
import com.newtrading.marketdata.repository.MarketCandleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarketDataCacheServiceTest {

    @Mock
    private StockApiClient stockApiClient;

    @Mock
    private MarketCandleRepository candleRepository;

    @InjectMocks
    private MarketDataCacheService marketDataCacheService;

    @Test
    @DisplayName("Scénario DB Hit : retourne les données de PostgreSQL sans appeler l'API externe")
    void getDailyHistory_whenDatabaseHasFreshData_returnsDatabaseData() {
        MarketCandle candle = MarketCandle.builder()
                .assetCode("AAPL")
                .timeframe("1D")
                .openTime(Instant.now().minus(2, ChronoUnit.HOURS)) // Donnée fraîche (< 24h)
                .openPrice(new BigDecimal("180.00"))
                .highPrice(new BigDecimal("185.00"))
                .lowPrice(new BigDecimal("179.00"))
                .closePrice(new BigDecimal("184.00"))
                .volume(new BigDecimal("1000000"))
                .build();

        when(candleRepository.findByAssetCodeAndTimeframeOrderByOpenTimeAsc("AAPL", "1D"))
                .thenReturn(List.of(candle));

        List<CandleDto> result = marketDataCacheService.getDailyHistory("AAPL");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getClose()).isEqualByComparingTo("184.00");
        verify(stockApiClient, never()).fetchDailyHistory(anyString());
        verify(candleRepository, never()).saveAll(anyList());
    }

    @Test
    @DisplayName("Scénario Full Miss : DB vide -> appelle l'API externe et persiste en base")
    void getDailyHistory_whenDatabaseIsEmpty_callsExternalApiAndPersists() {
        CandleDto dto = CandleDto.builder()
                .timestamp(Instant.now().minus(1, ChronoUnit.DAYS))
                .open(new BigDecimal("150.00"))
                .high(new BigDecimal("155.00"))
                .low(new BigDecimal("149.00"))
                .close(new BigDecimal("153.00"))
                .volume(new BigDecimal("2000000"))
                .build();

        when(candleRepository.findByAssetCodeAndTimeframeOrderByOpenTimeAsc("NVDA", "1D"))
                .thenReturn(Collections.emptyList());
        when(stockApiClient.fetchDailyHistory("NVDA"))
                .thenReturn(List.of(dto));

        List<CandleDto> result = marketDataCacheService.getDailyHistory("NVDA");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getClose()).isEqualByComparingTo("153.00");
        verify(stockApiClient, times(1)).fetchDailyHistory("NVDA");
        verify(candleRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("Scénario DB Obsolète : dernière bougie > 24h -> rafraîchit via l'API externe")
    void getDailyHistory_whenDatabaseDataIsStale_callsExternalApi() {
        MarketCandle staleCandle = MarketCandle.builder()
                .assetCode("MSFT")
                .timeframe("1D")
                .openTime(Instant.now().minus(48, ChronoUnit.HOURS)) // Donnée périmée
                .openPrice(new BigDecimal("400.00"))
                .highPrice(new BigDecimal("405.00"))
                .lowPrice(new BigDecimal("399.00"))
                .closePrice(new BigDecimal("402.00"))
                .volume(new BigDecimal("500000"))
                .build();

        CandleDto freshDto = CandleDto.builder()
                .timestamp(Instant.now().minus(1, ChronoUnit.HOURS))
                .open(new BigDecimal("410.00"))
                .high(new BigDecimal("415.00"))
                .low(new BigDecimal("409.00"))
                .close(new BigDecimal("412.00"))
                .volume(new BigDecimal("600000"))
                .build();

        when(candleRepository.findByAssetCodeAndTimeframeOrderByOpenTimeAsc("MSFT", "1D"))
                .thenReturn(List.of(staleCandle));
        when(stockApiClient.fetchDailyHistory("MSFT"))
                .thenReturn(List.of(freshDto));

        List<CandleDto> result = marketDataCacheService.getDailyHistory("MSFT");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getClose()).isEqualByComparingTo("412.00");
        verify(stockApiClient, times(1)).fetchDailyHistory("MSFT");
        verify(candleRepository, times(1)).saveAll(anyList());
    }
}
