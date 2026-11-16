package com.newtrading.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.auth.model.User;
import com.newtrading.portfolio.dto.PlaceOrderRequest;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.service.PortfolioService;
import com.newtrading.portfolio.service.TradingEngineService;
import com.newtrading.shared.exception.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false) // Désactive la barrière JWT brute pour tester directement la couche Web
@DisplayName("Tests d'Intégration REST - OrderController")
class OrderControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TradingEngineService tradingEngineService;

    @MockBean
    private PortfolioService portfolioService;

    private void authenticateMockUser(User user) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    @DisplayName("POST /api/v1/trades - Retourne 201 CREATED avec un TransactionResponse")
    void shouldReturn201WhenOrderIsValid() throws Exception {
        UUID userId = UUID.randomUUID();
        User mockUser = User.builder().id(userId).email("trader@test.com").build();
        authenticateMockUser(mockUser);

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("AAPL")
                .orderDirection("BUY")
                .quantity(new BigDecimal("2.50000000"))
                .build();

        SimulatedTransaction tx = SimulatedTransaction.builder()
                .id(UUID.randomUUID())
                .portfolio(VirtualPortfolio.builder().id(UUID.randomUUID()).build())
                .assetCode("AAPL")
                .orderDirection("BUY")
                .quantity(new BigDecimal("2.50000000"))
                .executionPrice(new BigDecimal("180.00000000"))
                .executedAt(OffsetDateTime.now())
                .build();

        when(tradingEngineService.executeOrder(eq(userId), any(PlaceOrderRequest.class))).thenReturn(tx);

        mockMvc.perform(post("/api/v1/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetCode").value("AAPL"))
                .andExpect(jsonPath("$.orderDirection").value("BUY"))
                .andExpect(jsonPath("$.executionPrice").value(180.0))
                .andExpect(jsonPath("$.totalAmount").value(450.0)) // 180 * 2.5
                .andExpect(jsonPath("$.executedAt").exists());
    }

    @Test
    @DisplayName("POST /api/v1/trades - Retourne 400 avec ProblemDetail RFC 7807 si direction invalide")
    void shouldReturn400WhenValidationFails() throws Exception {
        UUID userId = UUID.randomUUID();
        authenticateMockUser(User.builder().id(userId).email("trader@test.com").build());

        // Direction 'HOLD' interdite par le regex Pattern
        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("AAPL")
                .orderDirection("HOLD")
                .quantity(new BigDecimal("1.00000000"))
                .build();

        mockMvc.perform(post("/api/v1/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem-type:validation-error"))
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors.orderDirection").exists());
    }

    @Test
    @DisplayName("POST /api/v1/trades - Retourne 400 avec code métier si solde insuffisant")
    void shouldReturn400WhenBusinessExceptionThrown() throws Exception {
        UUID userId = UUID.randomUUID();
        authenticateMockUser(User.builder().id(userId).email("trader@test.com").build());

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("AAPL")
                .orderDirection("BUY")
                .quantity(new BigDecimal("100.00000000"))
                .build();

        when(tradingEngineService.executeOrder(eq(userId), any(PlaceOrderRequest.class)))
                .thenThrow(new BusinessException("Solde insuffisant", HttpStatus.BAD_REQUEST, "INSUFFICIENT_FUNDS"));

        mockMvc.perform(post("/api/v1/trades")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.type").value("urn:problem-type:business-error"))
                .andExpect(jsonPath("$.code").value("INSUFFICIENT_FUNDS"))
                .andExpect(jsonPath("$.detail").value("Solde insuffisant"));
    }
}
