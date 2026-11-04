package com.newtrading.portfolio.service;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.PnLResponse;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository.HoldingProjection;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests Métier - PortfolioService & Calculs PnL")
class PortfolioServiceTest {

    @Mock
    private VirtualPortfolioRepository portfolioRepository;

    @Mock
    private SimulatedTransactionRepository transactionRepository;

    @Mock
    private MarketDataCacheService marketDataCacheService;

    @InjectMocks
    private PortfolioService portfolioService;

    @Test
    @DisplayName("Calcule correctement la valorisation totale et le PnL latent")
    void shouldCalculatePnLCorrectly() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();

        VirtualPortfolio portfolio = VirtualPortfolio.builder()
                .id(portfolioId)
                .initialBalance(new BigDecimal("100000.00000000"))
                .currentBalance(new BigDecimal("80000.00000000")) // 20k investis
                .build();

        HoldingProjection holdingAAPL = new HoldingProjection() {
            @Override
            public String getAssetCode() { return "AAPL"; }
            @Override
            public BigDecimal getNetQuantity() { return new BigDecimal("100.00000000"); }
        };

        when(portfolioRepository.findByUserId(userId)).thenReturn(Optional.of(portfolio));
        when(transactionRepository.findActiveHoldingsByPortfolioId(portfolioId)).thenReturn(List.of(holdingAAPL));

        // AAPL vaut 250$ -> Valeur position = 100 * 250 = 25 000$
        when(marketDataCacheService.getQuote("AAPL")).thenReturn(QuoteDto.builder()
                .symbol("AAPL")
                .price(new BigDecimal("250.00000000"))
                .build());

        PnLResponse response = portfolioService.calculatePnL(userId);

        // Valeur totale = 80 000 (cash) + 25 000 (actions) = 105 000
        assertThat(response.getTotalPortfolioValue()).isEqualByComparingTo("105000.00000000");

        // PnL latent = 105 000 - 100 000 = +5 000
        assertThat(response.getTotalUnrealizedPnL()).isEqualByComparingTo("5000.00000000");

        // Rentabilité = (5 000 / 100 000) * 100 = 5.00 %
        assertThat(response.getTotalPnLPercentage()).isEqualByComparingTo("5.00");
    }
}
