package com.newtrading.marketdata.service;

import com.newtrading.marketdata.dto.QuoteDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceBroadcasterService {

    private final SimpMessagingTemplate messagingTemplate;

    public void broadcastQuote(QuoteDto quote) {
        if (quote == null || quote.getSymbol() == null) {
            log.warn("Tentative d'envoi d'un QuoteDto null ou sans symbole");
            return;
        }
        String destination = "/topic/market/" + quote.getSymbol().toUpperCase();
        log.info("Envoi cotation sur {} : {}", destination, quote.getPrice());
        messagingTemplate.convertAndSend(destination, quote);
    }
}
