package com.newtrading.portfolio.service;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.PnLResponse;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository.HoldingProjection;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioService {

    private final VirtualPortfolioRepository portfolioRepository;
    private final SimulatedTransactionRepository transactionRepository;
    private final MarketDataCacheService marketDataCacheService;

    @Transactional(readOnly = true)
    public VirtualPortfolio getPortfolioByUserId(UUID userId) {
        return portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Portefeuille introuvable pour cet utilisateur", HttpStatus.NOT_FOUND, "PORTFOLIO_NOT_FOUND"));
    }

    @Transactional(readOnly = true)
    public Page<SimulatedTransaction> getTransactionHistory(UUID userId, Pageable pageable) {
        VirtualPortfolio portfolio = getPortfolioByUserId(userId);
        return transactionRepository.findByPortfolioIdOrderByExecutedAtDesc(portfolio.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public PnLResponse calculatePnL(UUID userId) {
        VirtualPortfolio portfolio = getPortfolioByUserId(userId);

        // 1. Récupération des positions actives directement agrégées par PostgreSQL
        List<HoldingProjection> activeHoldings = transactionRepository.findActiveHoldingsByPortfolioId(portfolio.getId());

        // 2. Calcul de la valeur marchande totale basée sur les cours actuels
        BigDecimal totalPositionsValue = BigDecimal.ZERO;

        for (HoldingProjection holding : activeHoldings) {
            String assetCode = holding.getAssetCode();
            BigDecimal quantity = holding.getNetQuantity();

            try {
                // Utilise la cotation réelle du cache
                QuoteDto quote = marketDataCacheService.getQuote(assetCode);
                if (quote != null && quote.getPrice() != null && quote.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal positionValue = quote.getPrice().multiply(quantity);
                    totalPositionsValue = totalPositionsValue.add(positionValue);
                } else {
                    log.warn("Cotation indisponible pour valoriser l'actif {} dans le portfolio {}", assetCode, portfolio.getId());
                }
            } catch (Exception e) {
                log.error("Erreur lors de la récupération du prix pour {}: {}", assetCode, e.getMessage());
            }
        }

        // 3. Calcul de la valeur totale du portefeuille (Cash + Valeur des actions)
        BigDecimal totalPortfolioValue = portfolio.getCurrentBalance()
                .add(totalPositionsValue)
                .setScale(8, RoundingMode.HALF_UP);

        // 4. Calcul du PnL latent total (Valeur totale - Solde initial)
        BigDecimal totalUnrealizedPnL = totalPortfolioValue
                .subtract(portfolio.getInitialBalance())
                .setScale(8, RoundingMode.HALF_UP);

        // 5. Calcul du pourcentage de rentabilité global
        BigDecimal totalPnLPercentage = BigDecimal.ZERO;
        if (portfolio.getInitialBalance().compareTo(BigDecimal.ZERO) > 0) {
            totalPnLPercentage = totalUnrealizedPnL
                    .divide(portfolio.getInitialBalance(), 8, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        return PnLResponse.builder()
                .portfolioId(portfolio.getId())
                .currentBalance(portfolio.getCurrentBalance())
                .totalPortfolioValue(totalPortfolioValue)
                .totalUnrealizedPnL(totalUnrealizedPnL)
                .totalPnLPercentage(totalPnLPercentage)
                .build();
    }
}
