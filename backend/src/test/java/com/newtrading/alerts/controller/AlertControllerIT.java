package com.newtrading.alerts.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.alerts.dto.AlertDto;
import com.newtrading.alerts.dto.CreateAlertRequest;
import com.newtrading.alerts.service.AlertService;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.shared.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AlertController.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AlertControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AlertService alertService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserRepository userRepository; // Injection du mock requis par JwtAuthenticationFilter

    private static final String TEST_USER_UUID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

    @Test
    @WithMockUser(username = TEST_USER_UUID)
    @DisplayName("POST /alerts - 201 Created quand la requête est valide")
    void createAlert_Returns201() throws Exception {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .assetCode("NVDA")
                .targetPrice(new BigDecimal("120.00"))
                .triggerCondition("ABOVE")
                .notificationChannel("PUSH")
                .build();

        AlertDto responseDto = AlertDto.builder()
                .id(UUID.randomUUID())
                .assetCode("NVDA")
                .targetPrice(new BigDecimal("120.00"))
                .triggerCondition("ABOVE")
                .notificationChannel("PUSH")
                .isTriggered(false)
                .createdAt(OffsetDateTime.now())
                .build();

        doReturn(responseDto).when(alertService).createAlert(eq(UUID.fromString(TEST_USER_UUID)), any(CreateAlertRequest.class));

        mockMvc.perform(post("/alerts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetCode").value("NVDA"))
                .andExpect(jsonPath("$.isTriggered").value(false));
    }

    @Test
    @WithMockUser(username = TEST_USER_UUID)
    @DisplayName("POST /alerts - 400 Bad Request si validation échouée (prix négatif)")
    void createAlert_InvalidPayload_Returns400() throws Exception {
        CreateAlertRequest invalidRequest = CreateAlertRequest.builder()
                .assetCode("NVDA")
                .targetPrice(new BigDecimal("-5.00"))
                .triggerCondition("INVALID_COND")
                .notificationChannel("PUSH")
                .build();

        mockMvc.perform(post("/alerts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /alerts - 401 Unauthorized sans authentification")
    void createAlert_Unauthorized_Returns401() throws Exception {
        CreateAlertRequest request = CreateAlertRequest.builder()
                .assetCode("NVDA")
                .targetPrice(new BigDecimal("120.00"))
                .triggerCondition("ABOVE")
                .notificationChannel("PUSH")
                .build();

        mockMvc.perform(post("/alerts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
