package com.newtrading.marketdata.client;

import com.newtrading.marketdata.dto.CandleDto;
import com.newtrading.marketdata.dto.QuoteDto;

import java.util.List;

public interface StockApiClient {
    List<CandleDto> fetchDailyHistory(String symbol);
    QuoteDto fetchQuote(String symbol);
}
