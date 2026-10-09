package com.newtrading.marketdata.controller;

import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/market")
@RequiredArgsConstructor
public class MarketDataController {

    private final MarketDataCacheService marketDataCacheService;

    @GetMapping("/history/{symbol}")
    public ResponseEntity<List<CandleDto>> getHistory(@PathVariable String symbol) {
        return ResponseEntity.ok(marketDataCacheService.getDailyHistory(symbol));
    }

    @GetMapping("/quote/{symbol}")
    public ResponseEntity<QuoteDto> getQuote(@PathVariable String symbol) {
        return ResponseEntity.ok(marketDataCacheService.getQuote(symbol));
    }
}
