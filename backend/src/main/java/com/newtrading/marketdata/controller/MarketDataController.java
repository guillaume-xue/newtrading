package com.newtrading.marketdata.controller;

import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
@RestController
@RequestMapping("/market") // Aligné avec fetchMarketHistory /market/history/{symbol}
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
