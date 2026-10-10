package com.newtrading.portfolio.service;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.PnLResponse;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final VirtualPortfolioRepository portfolioRepository;
    private final SimulatedTransactionRepository transactionRepository;
    private final MarketDataCacheService marketDataCacheService;

    @Transactional(readOnly = true)
    public VirtualPortfolio getPortfolioByUserId(UUID userId) {
        return portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Portefeuille introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public Page<SimulatedTransaction> getTransactionHistory(UUID userId, Pageable pageable) {
        VirtualPortfolio portfolio = getPortfolioByUserId(userId);
        return transactionRepository.findByPortfolioIdOrderByExecutedAtDesc(portfolio.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public PnLResponse calculatePnL(UUID userId) {
        VirtualPortfolio portfolio = getPortfolioByUserId(userId);
        Page<SimulatedTransaction> allTransactions = transactionRepository.findByPortfolioIdOrderByExecutedAtDesc(
                portfolio.getId(), Pageable.unpaged()
        );

        Map<String, BigDecimal> holdings = new HashMap<>();
        for (SimulatedTransaction tx : allTransactions.getContent()) {
            BigDecimal qty = "BUY".equalsIgnoreCase(tx.getOrderDirection()) ? tx.getQuantity() : tx.getQuantity().negate();
            holdings.merge(tx.getAssetCode(), qty, BigDecimal::add);
        }

        BigDecimal totalPositionsValue = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> entry : holdings.entrySet()) {
            BigDecimal quantity = entry.getValue();
            if (quantity.compareTo(BigDecimal.ZERO) > 0) {
                QuoteDto quote = marketDataCacheService.getQuote(entry.getKey());
                BigDecimal price = (quote != null && quote.getPrice() != null) ? quote.getPrice() : BigDecimal.ZERO;
                totalPositionsValue = totalPositionsValue.add(price.multiply(quantity));
            }
        }

        BigDecimal totalPortfolioValue = portfolio.getCurrentBalance().add(totalPositionsValue).setScale(8, RoundingMode.HALF_UP);
        BigDecimal totalUnrealizedPnL = totalPortfolioValue.subtract(portfolio.getInitialBalance()).setScale(8, RoundingMode.HALF_UP);

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
