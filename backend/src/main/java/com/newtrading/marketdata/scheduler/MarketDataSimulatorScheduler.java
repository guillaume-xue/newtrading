package com.newtrading.marketdata.scheduler;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.PriceBroadcasterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
@ConditionalOnProperty(name = "application.marketdata.simulator.enabled", havingValue = "true", matchIfMissing = true)
public class MarketDataSimulatorScheduler {

    private final PriceBroadcasterService priceBroadcasterService;

    private final Map<String, BigDecimal> currentPrices = new ConcurrentHashMap<>(Map.of(
            "AAPL", new BigDecimal("185.50"),
            "NVDA", new BigDecimal("128.20"),
            "MSFT", new BigDecimal("445.10")
    ));

    @Scheduled(fixedRate = 2000)
    public void simulatePriceTicks() {
        currentPrices.forEach((symbol, price) -> {
            // Variation aléatoire de -0.5% à +0.5%
            double deltaPercent = (ThreadLocalRandom.current().nextDouble() - 0.5) / 100.0;
            BigDecimal delta = price.multiply(BigDecimal.valueOf(deltaPercent)).setScale(4, RoundingMode.HALF_UP);
            BigDecimal newPrice = price.add(delta).setScale(2, RoundingMode.HALF_UP);

            currentPrices.put(symbol, newPrice);

            QuoteDto quote = QuoteDto.builder()
                    .symbol(symbol)
                    .price(newPrice)
                    .change(delta)
                    .changePercent(BigDecimal.valueOf(deltaPercent * 100).setScale(2, RoundingMode.HALF_UP))
                    .volume(BigDecimal.valueOf(ThreadLocalRandom.current().nextInt(100, 2500)))
                    .timestamp(Instant.now())
                    .build();

            priceBroadcasterService.broadcastQuote(quote);
        });
    }
}
