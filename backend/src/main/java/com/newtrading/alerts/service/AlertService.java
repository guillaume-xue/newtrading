package com.newtrading.alerts.service;

import com.newtrading.alerts.dto.AlertDto;
import com.newtrading.alerts.dto.CreateAlertRequest;
import com.newtrading.alerts.model.Alert;
import com.newtrading.alerts.repository.AlertRepository;
import com.newtrading.auth.model.User;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.notifications.email.SendGridEmailService;
import com.newtrading.notifications.push.FcmPushService;
import com.newtrading.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final SendGridEmailService emailService;
    private final FcmPushService pushService;

    @Transactional
    public AlertDto createAlert(UUID userId, CreateAlertRequest request) {
        User user = userRepository.findById(userId)
        .orElseThrow(() -> new BusinessException("Utilisateur non trouvé", HttpStatus.NOT_FOUND));


        Alert alert = Alert.builder()
                .user(user)
                .assetCode(request.getAssetCode().toUpperCase())
                .targetPrice(request.getTargetPrice())
                .triggerCondition(request.getTriggerCondition().toUpperCase())
                .notificationChannel(request.getNotificationChannel().toUpperCase())
                .isTriggered(false)
                .build();

        return AlertDto.fromEntity(alertRepository.save(alert));
    }

    @Transactional(readOnly = true)
    public List<AlertDto> getUserAlerts(UUID userId) {
        return alertRepository.findByUserId(userId).stream()
                .map(AlertDto::fromEntity)
                .toList();
    }

    @Transactional
    public void deleteAlert(UUID userId, UUID alertId) {
        Alert alert = alertRepository.findById(alertId)
        .orElseThrow(() -> new BusinessException("Alerte introuvable", HttpStatus.NOT_FOUND));


        if (!alert.getUser().getId().equals(userId)) {
            throw new BusinessException("Action non autorisée sur cette alerte", HttpStatus.FORBIDDEN);
        }

        alertRepository.delete(alert);
    }

    @Transactional
    public void evaluateQuote(QuoteDto quote) {
        if (quote == null || quote.getSymbol() == null || quote.getPrice() == null) {
            return;
        }

        List<Alert> pendingAlerts = alertRepository.findByAssetCodeAndIsTriggeredFalse(quote.getSymbol().toUpperCase());
        if (pendingAlerts.isEmpty()) {
            return;
        }

        BigDecimal currentPrice = quote.getPrice();

        for (Alert alert : pendingAlerts) {
            boolean shouldTrigger = false;

            if ("ABOVE".equalsIgnoreCase(alert.getTriggerCondition()) && currentPrice.compareTo(alert.getTargetPrice()) >= 0) {
                shouldTrigger = true;
            } else if ("BELOW".equalsIgnoreCase(alert.getTriggerCondition()) && currentPrice.compareTo(alert.getTargetPrice()) <= 0) {
                shouldTrigger = true;
            }

            if (shouldTrigger) {
                alert.setIsTriggered(true);
                alertRepository.save(alert);
                dispatchNotification(alert, currentPrice);
            }
        }
    }

    private void dispatchNotification(Alert alert, BigDecimal currentPrice) {
        String channel = alert.getNotificationChannel();
        User user = alert.getUser();

        if ("EMAIL".equalsIgnoreCase(channel) || "BOTH".equalsIgnoreCase(channel)) {
            emailService.sendPriceAlertEmail(
                    user.getEmail(),
                    alert.getAssetCode(),
                    alert.getTargetPrice(),
                    currentPrice,
                    alert.getTriggerCondition()
            );
        }

        if ("PUSH".equalsIgnoreCase(channel) || "BOTH".equalsIgnoreCase(channel)) {
            pushService.sendPriceAlertPush(
                    user.getId(),
                    alert.getAssetCode(),
                    alert.getTargetPrice(),
                    currentPrice
            );
        }
    }
}
