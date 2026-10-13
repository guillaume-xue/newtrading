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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
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
    private VirtualPortfolio portfolio;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        portfolio = VirtualPortfolio.builder()
                .id(UUID.randomUUID())
                .currentBalance(new BigDecimal("1000.00000000"))
                .initialBalance(new BigDecimal("1000.00000000"))
                .build();
        when(portfolioRepository.findByUserIdWithLock(userId)).thenReturn(Optional.of(portfolio));
    }

    @Test
    void executeOrder_buy_debitsBalanceAndPersistsTransaction() {
        givenAaplQuote();
        givenTransactionSave();

        SimulatedTransaction transaction = tradingEngineService.executeOrder(userId,
                order(" AAPL ", "BUY", "2"));

        assertThat(portfolio.getCurrentBalance()).isEqualByComparingTo("800.00000000");
        assertThat(transaction.getAssetCode()).isEqualTo("AAPL");
        assertThat(transaction.getOrderDirection()).isEqualTo("BUY");
        assertThat(transaction.getQuantity()).isEqualByComparingTo("2");
        verify(portfolioRepository).save(portfolio);
        verify(transactionRepository).save(any(SimulatedTransaction.class));
    }

    @Test
    void executeOrder_sell_creditsBalanceWhenQuantityIsOwned() {
        givenAaplQuote();
        givenTransactionSave();
        when(transactionRepository.findByPortfolioIdAndAssetCode(portfolio.getId(), "AAPL"))
                .thenReturn(List.of(SimulatedTransaction.builder()
                        .assetCode("AAPL")
                        .orderDirection("BUY")
                        .quantity(new BigDecimal("3"))
                        .build()));

        tradingEngineService.executeOrder(userId, order("AAPL", "SELL", "2"));

        assertThat(portfolio.getCurrentBalance()).isEqualByComparingTo("1200.00000000");
    }

    @Test
    void executeOrder_rejectsInsufficientBalance() {
        assertThatThrownBy(() -> tradingEngineService.executeOrder(userId, order("AAPL", "BUY", "11")))
                .isInstanceOfSatisfying(BusinessException.class, exception ->
                        assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));

        verify(portfolioRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void executeOrder_rejectsSellingMoreThanOwned() {
        givenAaplQuote();
        when(transactionRepository.findByPortfolioIdAndAssetCode(portfolio.getId(), "AAPL"))
                .thenReturn(List.of());

        assertThatThrownBy(() -> tradingEngineService.executeOrder(userId, order("AAPL", "SELL", "1")))
                .isInstanceOfSatisfying(BusinessException.class, exception ->
                        assertThat(exception.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));

        verify(portfolioRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    private PlaceOrderRequest order(String assetCode, String direction, String quantity) {
        return PlaceOrderRequest.builder()
                .assetCode(assetCode)
                .orderDirection(direction)
                .quantity(new BigDecimal(quantity))
                .build();
    }

    private void givenAaplQuote() {
        when(marketDataCacheService.getQuote("AAPL"))
                .thenReturn(QuoteDto.builder().symbol("AAPL").price(new BigDecimal("100.00")).build());
    }

    private void givenTransactionSave() {
        when(transactionRepository.save(any(SimulatedTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }
}
