package com.newtrading.alerts;

import com.newtrading.alerts.model.Alert;
import com.newtrading.alerts.repository.AlertRepository;
import com.newtrading.alerts.service.AlertService;
import com.newtrading.auth.model.User;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.notifications.email.SendGridEmailService;
import com.newtrading.notifications.push.FcmPushService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AlertEvaluationIT {

    @Autowired
    private AlertService alertService;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private UserRepository userRepository;

    @MockBean
    private SendGridEmailService emailService;

    @MockBean
    private FcmPushService pushService;

    private User testUser;

    @BeforeEach
    void setUp() {
        alertRepository.deleteAll();
        testUser = userRepository.save(User.builder()
                .email("trader@test.com")
                .authProvider("LOCAL")
                .build());
    }

    @Test
    @DisplayName("Doit déclencher l'alerte ABOVE et notifier quand le prix cible est atteint")
    void shouldTriggerAboveAlertAndSendNotifications() {
        // Given: Alerte active sur AAPL à 150.00 en canal BOTH
        Alert alert = alertRepository.save(Alert.builder()
                .user(testUser)
                .assetCode("AAPL")
                .targetPrice(new BigDecimal("150.00"))
                .triggerCondition("ABOVE")
                .notificationChannel("BOTH")
                .isTriggered(false)
                .build());

        QuoteDto quote = QuoteDto.builder()
                .symbol("AAPL")
                .price(new BigDecimal("150.50"))
                .timestamp(Instant.now())
                .build();

        // When: Le tick de marché arrive et est évalué
        alertService.evaluateQuote(quote);

        // Then: L'alerte passe en is_triggered = true
        Alert updatedAlert = alertRepository.findById(alert.getId()).orElseThrow();
        assertThat(updatedAlert.getIsTriggered()).isTrue();

        // Vérification des envois de notifications
        verify(emailService, times(1)).sendPriceAlertEmail(
                eq("trader@test.com"), eq("AAPL"), eq(new BigDecimal("150.00")), eq(new BigDecimal("150.50")), eq("ABOVE")
        );
        verify(pushService, times(1)).sendPriceAlertPush(
                eq(testUser.getId()), eq("AAPL"), eq(new BigDecimal("150.00")), eq(new BigDecimal("150.50"))
        );
    }

    @Test
    @DisplayName("Ne doit pas déclencher d'alerte si le cours n'atteint pas le seuil")
    void shouldNotTriggerWhenConditionNotMet() {
        // Given: Alerte active sur NVDA à 100.00 ABOVE
        Alert alert = alertRepository.save(Alert.builder()
                .user(testUser)
                .assetCode("NVDA")
                .targetPrice(new BigDecimal("100.00"))
                .triggerCondition("ABOVE")
                .notificationChannel("EMAIL")
                .isTriggered(false)
                .build());

        QuoteDto quote = QuoteDto.builder()
                .symbol("NVDA")
                .price(new BigDecimal("99.50"))
                .timestamp(Instant.now())
                .build();

        // When: Évaluation du cours
        alertService.evaluateQuote(quote);

        // Then: L'alerte reste inactive et aucun email n'est expédié
        Alert updatedAlert = alertRepository.findById(alert.getId()).orElseThrow();
        assertThat(updatedAlert.getIsTriggered()).isFalse();
        verifyNoInteractions(emailService);
        verifyNoInteractions(pushService);
    }
}
