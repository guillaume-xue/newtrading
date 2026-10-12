package com.newtrading.notifications.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
public class SendGridEmailService {

    @Async
    public void sendPriceAlertEmail(String recipientEmail, String assetCode, BigDecimal targetPrice, BigDecimal currentPrice, String condition) {
        log.info("Envoi e-mail SendGrid à {} : Alerte sur {} franchie (Cible : {}, Cours actuel : {}, Condition : {})",
                recipientEmail, assetCode, targetPrice, currentPrice, condition);
        // Appel API SendGrid effectif
    }
}
