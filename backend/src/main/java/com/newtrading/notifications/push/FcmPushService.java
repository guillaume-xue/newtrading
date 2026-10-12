package com.newtrading.notifications.push;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
public class FcmPushService {

    @Async
    public void sendPriceAlertPush(UUID userId, String assetCode, BigDecimal targetPrice, BigDecimal currentPrice) {
        log.info("Envoi notification push FCM à l'utilisateur {} : {} a atteint {}", userId, assetCode, currentPrice);
        // Appel API Firebase Cloud Messaging effectif
    }
}
