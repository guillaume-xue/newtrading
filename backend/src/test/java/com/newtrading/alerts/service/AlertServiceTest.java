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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepository alertRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SendGridEmailService emailService;

    @Mock
    private FcmPushService pushService;

    @InjectMocks
    private AlertService alertService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("guillaume@example.com")
                .authProvider("LOCAL")
                .build();
    }

    @Test
    @DisplayName("Création d'une alerte avec succès")
    void createAlert_Success() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .assetCode("AAPL")
                .targetPrice(new BigDecimal("180.50"))
                .triggerCondition("ABOVE")
                .notificationChannel("EMAIL")
                .build();

        Alert savedAlert = Alert.builder()
                .id(UUID.randomUUID())
                .user(user)
                .assetCode("AAPL")
                .targetPrice(new BigDecimal("180.50"))
                .triggerCondition("ABOVE")
                .notificationChannel("EMAIL")
                .isTriggered(false)
                .createdAt(OffsetDateTime.now())
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(alertRepository.save(any(Alert.class))).thenReturn(savedAlert);

        AlertDto result = alertService.createAlert(userId, request);

        assertThat(result).isNotNull();
        assertThat(result.getAssetCode()).isEqualTo("AAPL");
        assertThat(result.getTargetPrice()).isEqualByComparingTo("180.50");
        assertThat(result.getIsTriggered()).isFalse();
        verify(alertRepository, times(1)).save(any(Alert.class));
    }

    @Test
    @DisplayName("Création d'une alerte avec utilisateur inexistant -> BusinessException NOT_FOUND")
    void createAlert_UserNotFound() {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .assetCode("AAPL")
                .targetPrice(new BigDecimal("180.50"))
                .triggerCondition("ABOVE")
                .notificationChannel("EMAIL")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertService.createAlert(userId, request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> {
                    BusinessException be = (BusinessException) ex;
                    assertThat(be.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
                });
    }

    @Test
    @DisplayName("Évaluation d'une cotation déclenchant une alerte BELOW")
    void evaluateQuote_TriggersBelowAlert() {
        Alert alert = Alert.builder()
                .id(UUID.randomUUID())
                .user(user)
                .assetCode("TSLA")
                .targetPrice(new BigDecimal("200.00"))
                .triggerCondition("BELOW")
                .notificationChannel("EMAIL")
                .isTriggered(false)
                .build();

        QuoteDto quote = QuoteDto.builder()
                .symbol("TSLA")
                .price(new BigDecimal("199.50"))
                .build();

        when(alertRepository.findByAssetCodeAndIsTriggeredFalse("TSLA")).thenReturn(List.of(alert));

        alertService.evaluateQuote(quote);

        assertThat(alert.getIsTriggered()).isTrue();
        verify(alertRepository).save(alert);
        verify(emailService).sendPriceAlertEmail(
                eq(user.getEmail()), eq("TSLA"), eq(new BigDecimal("200.00")), eq(new BigDecimal("199.50")), eq("BELOW")
        );
        verifyNoInteractions(pushService);
    }
}
