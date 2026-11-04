package com.newtrading.shared.exception;

import org.springframework.http.HttpStatus;

public class MarketDataUnavailableException extends BusinessException {

    public MarketDataUnavailableException(String symbol) {
        super("Cours certifié indisponible pour l'actif : " + symbol, HttpStatus.SERVICE_UNAVAILABLE, "MARKET_DATA_UNAVAILABLE");
    }
}
