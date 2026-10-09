package com.newtrading.marketdata.service;

import com.newtrading.marketdata.client.StockApiClient;
import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketDataCacheService {

    private final StockApiClient stockApiClient;

    @Cacheable(value = "stockHistory", key = "#symbol.toUpperCase()", sync = true)
    public List<CandleDto> getDailyHistory(String symbol) {
        return stockApiClient.fetchDailyHistory(symbol.toUpperCase());
    }

    @Cacheable(value = "stockQuote", key = "#symbol.toUpperCase()", sync = true)
    public QuoteDto getQuote(String symbol) {
        return stockApiClient.fetchQuote(symbol.toUpperCase());
    }
}
