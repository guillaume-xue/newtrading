package com.newtrading.portfolio.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.auth.model.User;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.PlaceOrderRequest;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VirtualPortfolioRepository portfolioRepository;

    @Autowired
    private SimulatedTransactionRepository transactionRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private MarketDataCacheService marketDataCacheService;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        transactionRepository.deleteAll();
        portfolioRepository.deleteAll();
        userRepository.deleteAll();

        testUser = userRepository.save(User.builder()
                .email("trader@test.com")
                .passwordHash("hashedPassword")
                .authProvider("LOCAL")
                .build());

        portfolioRepository.save(VirtualPortfolio.builder()
                .user(testUser)
                .initialBalance(new BigDecimal("10000.00000000"))
                .currentBalance(new BigDecimal("10000.00000000"))
                .build());

        jwtToken = "Bearer " + jwtTokenProvider.generateToken(testUser.getId(), testUser.getEmail());
    }

    @Test
    @DisplayName("Achat nominal : Doit exécuter l'ordre, déduire le solde et persister la transaction")
    void shouldExecuteBuyOrderSuccessfully() throws Exception {
        when(marketDataCacheService.getQuote("AAPL"))
                .thenReturn(QuoteDto.builder()
                        .symbol("AAPL")
                        .price(new BigDecimal("150.00000000"))
                        .build());

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("AAPL")
                .orderDirection("BUY")
                .quantity(new BigDecimal("10.00000000"))
                .build();

        mockMvc.perform(post("/api/v1/trades")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.assetCode").value("AAPL"))
                .andExpect(jsonPath("$.orderDirection").value("BUY"))
                .andExpect(jsonPath("$.quantity").value(10.0))
                .andExpect(jsonPath("$.executionPrice").value(150.0));

        VirtualPortfolio updatedPortfolio = portfolioRepository.findByUserId(testUser.getId()).orElseThrow();
        // 10 000 - (10 * 150) = 8 500
        assertThat(updatedPortfolio.getCurrentBalance()).isEqualByComparingTo(new BigDecimal("8500.00000000"));
        assertThat(transactionRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("Anti-triche : Rejette un achat si les fonds virtuels sont insuffisants")
    void shouldRejectBuyOrderWhenInsufficientFunds() throws Exception {
        when(marketDataCacheService.getQuote("NVDA"))
                .thenReturn(QuoteDto.builder()
                        .symbol("NVDA")
                        .price(new BigDecimal("1000.00000000"))
                        .build());

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("NVDA")
                .orderDirection("BUY")
                .quantity(new BigDecimal("15.00000000")) // Coût total : 15 000 > Solde (10 000)
                .build();

        mockMvc.perform(post("/api/v1/trades")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        VirtualPortfolio unchangedPortfolio = portfolioRepository.findByUserId(testUser.getId()).orElseThrow();
        assertThat(unchangedPortfolio.getCurrentBalance()).isEqualByComparingTo(new BigDecimal("10000.00000000"));
        assertThat(transactionRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Anti-triche : Rejette une vente si les actions ne sont pas détenues")
    void shouldRejectSellOrderWhenAssetNotOwned() throws Exception {
        when(marketDataCacheService.getQuote("TSLA"))
                .thenReturn(QuoteDto.builder()
                        .symbol("TSLA")
                        .price(new BigDecimal("200.00000000"))
                        .build());

        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("TSLA")
                .orderDirection("SELL")
                .quantity(new BigDecimal("5.00000000"))
                .build();

        mockMvc.perform(post("/api/v1/trades")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(transactionRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("Validation : Rejette un volume négatif ou nul")
    void shouldRejectOrderWithInvalidQuantity() throws Exception {
        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .assetCode("AAPL")
                .orderDirection("BUY")
                .quantity(new BigDecimal("-2.00000000"))
                .build();

        mockMvc.perform(post("/api/v1/trades")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PnL : Calcule fidèlement la valorisation et la plus-value latente")
    void shouldCalculateAccuratePnL() throws Exception {
        when(marketDataCacheService.getQuote("AAPL"))
                .thenReturn(QuoteDto.builder()
                        .symbol("AAPL")
                        .price(new BigDecimal("100.00000000"))
                        .build());

        // 1. Achat de 10 AAPL à 100$ (Coût = 1 000$, Solde restant = 9 000$)
        PlaceOrderRequest buyRequest = PlaceOrderRequest.builder()
                .assetCode("AAPL")
                .orderDirection("BUY")
                .quantity(new BigDecimal("10.00000000"))
                .build();

        mockMvc.perform(post("/api/v1/trades")
                        .header("Authorization", jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buyRequest)))
                .andExpect(status().isCreated());

        // 2. Le cours monte à 150$ (+500$ de plus-value latente)
        when(marketDataCacheService.getQuote("AAPL"))
                .thenReturn(QuoteDto.builder()
                        .symbol("AAPL")
                        .price(new BigDecimal("150.00000000"))
                        .build());

        // 3. Appel de l'endpoint PnL
        mockMvc.perform(get("/api/v1/trades/pnl")
                        .header("Authorization", jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentBalance").value(9000.0))
                .andExpect(jsonPath("$.totalPortfolioValue").value(10500.0))
                .andExpect(jsonPath("$.totalUnrealizedPnL").value(500.0))
                .andExpect(jsonPath("$.totalPnLPercentage").value(5.0));
    }
}
