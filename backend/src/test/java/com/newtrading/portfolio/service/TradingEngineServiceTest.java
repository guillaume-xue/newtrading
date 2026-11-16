package com.newtrading.portfolio.service;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.PlaceOrderRequest;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Métier - TradingEngineService")
class TradingEngineServiceTest {

    @Mock
    private VirtualPortfolioRepository portfolioRepository;

    @Mock
    private SimulatedTransactionRepository transactionRepository;

    @Mock
    private MarketDataCacheService marketDataCacheService;

    @InjectMocks
    private TradingEngineService tradingEngineService;

    private UUID userId;
    private UUID portfolioId;
    private VirtualPortfolio testPortfolio;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        portfolioId = UUID.randomUUID();

        testPortfolio = VirtualPortfolio.builder()
                .id(portfolioId)
                .initialBalance(new BigDecimal("100000.00000000"))
                .currentBalance(new BigDecimal("10000.00000000"))
                .build();
    }

    @Nested
    @DisplayName("Ordres d'achat (BUY)")
    class BuyOrders {

        @Test
        @DisplayName("Exécute l'achat avec succès et déduit le coût exact du solde")
        void shouldExecuteBuyOrderSuccessfully() {
            PlaceOrderRequest request = PlaceOrderRequest.builder()
                    .assetCode("AAPL")
                    .orderDirection("BUY")
                    .quantity(new BigDecimal("10.00000000"))
                    .build();

            QuoteDto certifiedQuote = QuoteDto.builder()
                    .symbol("AAPL")
                    .price(new BigDecimal("150.00000000"))
                    .timestamp(Instant.now())
                    .build();

            when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.of(testPortfolio));
            when(marketDataCacheService.getCertifiedQuoteForExecution("AAPL")).thenReturn(certifiedQuote);
            when(transactionRepository.save(any(SimulatedTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

            SimulatedTransaction result = tradingEngineService.executeOrder(userId, request);

            assertThat(result).isNotNull();
            assertThat(result.getAssetCode()).isEqualTo("AAPL");
            assertThat(result.getOrderDirection()).isEqualTo("BUY");
            assertThat(result.getExecutionPrice()).isEqualByComparingTo("150.00000000");
            assertThat(result.getQuantity()).isEqualByComparingTo("10.00000000");

            // Coût = 150 * 10 = 1500 -> Nouveau solde = 10000 - 1500 = 8500
            assertThat(testPortfolio.getCurrentBalance()).isEqualByComparingTo("8500.00000000");
            verify(portfolioRepository).save(testPortfolio);
            verify(transactionRepository).save(any(SimulatedTransaction.class));
        }

        @Test
        @DisplayName("Rejette l'achat si le solde virtuel est insuffisant")
        void shouldRejectBuyOrderWhenInsufficientFunds() {
            PlaceOrderRequest request = PlaceOrderRequest.builder()
                    .assetCode("BTCUSDT")
                    .orderDirection("BUY")
                    .quantity(new BigDecimal("1.00000000"))
                    .build();

            QuoteDto certifiedQuote = QuoteDto.builder()
                    .symbol("BTCUSDT")
                    .price(new BigDecimal("65000.00000000"))
                    .timestamp(Instant.now())
                    .build();

            when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.of(testPortfolio));
            when(marketDataCacheService.getCertifiedQuoteForExecution("BTCUSDT")).thenReturn(certifiedQuote);

            assertThatThrownBy(() -> tradingEngineService.executeOrder(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Solde insuffisant")
                    .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode()).isEqualTo("INSUFFICIENT_FUNDS"));

            verify(portfolioRepository, never()).save(any());
            verify(transactionRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Ordres de vente (SELL)")
    class SellOrders {

        @Test
        @DisplayName("Exécute la vente avec succès et crédite le solde")
        void shouldExecuteSellOrderSuccessfully() {
            PlaceOrderRequest request = PlaceOrderRequest.builder()
                    .assetCode("NVDA")
                    .orderDirection("SELL")
                    .quantity(new BigDecimal("5.00000000"))
                    .build();

            QuoteDto certifiedQuote = QuoteDto.builder()
                    .symbol("NVDA")
                    .price(new BigDecimal("120.00000000"))
                    .timestamp(Instant.now())
                    .build();

            when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.of(testPortfolio));
            when(marketDataCacheService.getCertifiedQuoteForExecution("NVDA")).thenReturn(certifiedQuote);
            when(transactionRepository.calculatePositionNetQuantity(portfolioId, "NVDA"))
                    .thenReturn(new BigDecimal("10.00000000")); // Possède 10 actions
            when(transactionRepository.save(any(SimulatedTransaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

            SimulatedTransaction result = tradingEngineService.executeOrder(userId, request);

            assertThat(result).isNotNull();
            assertThat(result.getOrderDirection()).isEqualTo("SELL");
            // Crédit = 120 * 5 = 600 -> Nouveau solde = 10000 + 600 = 10600
            assertThat(testPortfolio.getCurrentBalance()).isEqualByComparingTo("10600.00000000");
            verify(portfolioRepository).save(testPortfolio);
        }

        @Test
        @DisplayName("Rejette la vente si la position détenue est insuffisante")
        void shouldRejectSellOrderWhenPositionTooLow() {
            PlaceOrderRequest request = PlaceOrderRequest.builder()
                    .assetCode("NVDA")
                    .orderDirection("SELL")
                    .quantity(new BigDecimal("5.00000000"))
                    .build();

            QuoteDto certifiedQuote = QuoteDto.builder()
                    .symbol("NVDA")
                    .price(new BigDecimal("120.00000000"))
                    .timestamp(Instant.now())
                    .build();

            when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.of(testPortfolio));
            when(marketDataCacheService.getCertifiedQuoteForExecution("NVDA")).thenReturn(certifiedQuote);
            when(transactionRepository.calculatePositionNetQuantity(portfolioId, "NVDA"))
                    .thenReturn(new BigDecimal("2.00000000")); // Ne possède que 2 actions

            assertThatThrownBy(() -> tradingEngineService.executeOrder(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Position insuffisante")
                    .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode()).isEqualTo("INSUFFICIENT_POSITION"));

            verify(portfolioRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Sécurité des Données Réelles & Portefeuille")
    class DataIntegrity {

        @Test
        @DisplayName("Échoue si aucune cotation certifiée n'est retournée (Anti-Triche)")
        void shouldFailIfCertifiedMarketDataFails() {
            PlaceOrderRequest request = PlaceOrderRequest.builder()
                    .assetCode("UNKNOWN")
                    .orderDirection("BUY")
                    .quantity(new BigDecimal("1.00000000"))
                    .build();

            when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.of(testPortfolio));
            when(marketDataCacheService.getCertifiedQuoteForExecution("UNKNOWN"))
                    .thenThrow(new BusinessException("Cours certifié indisponible", HttpStatus.SERVICE_UNAVAILABLE));

            assertThatThrownBy(() -> tradingEngineService.executeOrder(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Cours certifié indisponible");

            verify(transactionRepository, never()).save(any());
        }

        @Test
        @DisplayName("Échoue si le portefeuille n'existe pas")
        void shouldFailWhenPortfolioNotFound() {
            PlaceOrderRequest request = PlaceOrderRequest.builder()
                    .assetCode("AAPL")
                    .orderDirection("BUY")
                    .quantity(new BigDecimal("1.00000000"))
                    .build();

            when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> tradingEngineService.executeOrder(userId, request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode()).isEqualTo("PORTFOLIO_NOT_FOUND"));
        }
    }
}
