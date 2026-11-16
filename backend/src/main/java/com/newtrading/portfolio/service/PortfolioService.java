package com.newtrading.portfolio.service;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.EquityPointResponse;
import com.newtrading.portfolio.dto.PnLResponse;
import com.newtrading.portfolio.dto.PnLResponse.AllocationDto;
import com.newtrading.portfolio.dto.PnLResponse.PositionDto;
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
import java.time.Instant;
import java.util.*;

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

        // 1. Récupération des positions nettes actives
        List<HoldingProjection> activeHoldings = transactionRepository.findActiveHoldingsByPortfolioId(portfolio.getId());
        List<SimulatedTransaction> allTransactions = transactionRepository.findByPortfolioIdOrderByExecutedAtAsc(portfolio.getId());

        List<PositionDto> positions = new ArrayList<>();
        BigDecimal totalPositionsValue = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryAmounts = new HashMap<>();

        for (HoldingProjection holding : activeHoldings) {
            String assetCode = holding.getAssetCode();
            BigDecimal netQuantity = holding.getNetQuantity();

            if (netQuantity == null || netQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            // Calcul du Prix de Revient Unitaire (PRU) sur les achats
            BigDecimal totalBuyCost = BigDecimal.ZERO;
            BigDecimal totalBuyQty = BigDecimal.ZERO;

            for (SimulatedTransaction tx : allTransactions) {
                if (tx.getAssetCode().equalsIgnoreCase(assetCode) && "BUY".equalsIgnoreCase(tx.getOrderDirection())) {
                    totalBuyCost = totalBuyCost.add(tx.getExecutionPrice().multiply(tx.getQuantity()));
                    totalBuyQty = totalBuyQty.add(tx.getQuantity());
                }
            }

            BigDecimal averagePrice = totalBuyQty.compareTo(BigDecimal.ZERO) > 0
                    ? totalBuyCost.divide(totalBuyQty, 8, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            QuoteDto quote = marketDataCacheService.getQuote(assetCode);
            BigDecimal currentPrice = (quote != null && quote.getPrice() != null && quote.getPrice().compareTo(BigDecimal.ZERO) > 0)
                    ? quote.getPrice()
                    : averagePrice;

            BigDecimal valuation = currentPrice.multiply(netQuantity).setScale(2, RoundingMode.HALF_UP);
            totalPositionsValue = totalPositionsValue.add(valuation);

            BigDecimal investedAmount = averagePrice.multiply(netQuantity);
            BigDecimal unrealizedPnL = valuation.subtract(investedAmount).setScale(2, RoundingMode.HALF_UP);
            BigDecimal unrealizedPnLPercentage = investedAmount.compareTo(BigDecimal.ZERO) > 0
                    ? unrealizedPnL.divide(investedAmount, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            String category = determineCategory(assetCode);
            categoryAmounts.put(category, categoryAmounts.getOrDefault(category, BigDecimal.ZERO).add(valuation));

            positions.add(PositionDto.builder()
                    .assetCode(assetCode)
                    .category(category)
                    .quantity(netQuantity)
                    .averagePrice(averagePrice.setScale(2, RoundingMode.HALF_UP))
                    .currentPrice(currentPrice.setScale(2, RoundingMode.HALF_UP))
                    .valuation(valuation)
                    .unrealizedPnL(unrealizedPnL)
                    .unrealizedPnLPercentage(unrealizedPnLPercentage)
                    .build());
        }

        BigDecimal currentBalance = portfolio.getCurrentBalance().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPortfolioValue = currentBalance.add(totalPositionsValue).setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalUnrealizedPnL = totalPortfolioValue.subtract(portfolio.getInitialBalance()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPnLPercentage = portfolio.getInitialBalance().compareTo(BigDecimal.ZERO) > 0
                ? totalUnrealizedPnL.divide(portfolio.getInitialBalance(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<AllocationDto> allocations = new ArrayList<>();
        if (totalPortfolioValue.compareTo(BigDecimal.ZERO) > 0) {
            for (Map.Entry<String, BigDecimal> entry : categoryAmounts.entrySet()) {
                BigDecimal pct = entry.getValue().divide(totalPortfolioValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP);
                allocations.add(new AllocationDto(entry.getKey(), entry.getValue(), pct));
            }
            BigDecimal cashPct = currentBalance.divide(totalPortfolioValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).setScale(1, RoundingMode.HALF_UP);
            allocations.add(new AllocationDto("Liquidités", currentBalance, cashPct));
        }

        return PnLResponse.builder()
                .portfolioId(portfolio.getId())
                .currentBalance(currentBalance)
                .totalPortfolioValue(totalPortfolioValue)
                .totalUnrealizedPnL(totalUnrealizedPnL)
                .totalPnLPercentage(totalPnLPercentage)
                .positions(positions)
                .allocations(allocations)
                .build();
    }

    /**
     * Reconstitue la courbe d'équité historique à chaque transaction enregistrée en base.
     */
    @Transactional(readOnly = true)
    public List<EquityPointResponse> getPortfolioEquityHistory(UUID userId) {
        VirtualPortfolio portfolio = getPortfolioByUserId(userId);
        List<SimulatedTransaction> transactions = transactionRepository
                .findByPortfolioIdOrderByExecutedAtAsc(portfolio.getId());

        List<EquityPointResponse> points = new ArrayList<>();

        Instant startPoint = portfolio.getCreatedAt() != null
                ? portfolio.getCreatedAt().toInstant()
                : Instant.now().minusSeconds(86400 * 7);

        points.add(EquityPointResponse.builder()
                .timestamp(startPoint)
                .value(portfolio.getInitialBalance().setScale(2, RoundingMode.HALF_UP))
                .build());

        if (transactions.isEmpty()) {
            points.add(EquityPointResponse.builder()
                    .timestamp(Instant.now())
                    .value(portfolio.getInitialBalance().setScale(2, RoundingMode.HALF_UP))
                    .build());
            return points;
        }

        BigDecimal runningBalance = portfolio.getInitialBalance();
        Map<String, BigDecimal> runningHoldings = new HashMap<>();

        for (SimulatedTransaction tx : transactions) {
            BigDecimal qty = tx.getQuantity();
            BigDecimal cost = tx.getExecutionPrice().multiply(qty);

            if ("BUY".equalsIgnoreCase(tx.getOrderDirection())) {
                runningBalance = runningBalance.subtract(cost);
                runningHoldings.put(tx.getAssetCode(), runningHoldings.getOrDefault(tx.getAssetCode(), BigDecimal.ZERO).add(qty));
            } else {
                runningBalance = runningBalance.add(cost);
                BigDecimal existing = runningHoldings.getOrDefault(tx.getAssetCode(), BigDecimal.ZERO);
                runningHoldings.put(tx.getAssetCode(), existing.subtract(qty));
            }

            BigDecimal currentAssetsValue = BigDecimal.ZERO;
            for (Map.Entry<String, BigDecimal> entry : runningHoldings.entrySet()) {
                if (entry.getValue().compareTo(BigDecimal.ZERO) > 0) {
                    QuoteDto quote = marketDataCacheService.getQuote(entry.getKey());
                    BigDecimal price = (quote != null && quote.getPrice() != null && quote.getPrice().compareTo(BigDecimal.ZERO) > 0)
                            ? quote.getPrice()
                            : tx.getExecutionPrice();
                    currentAssetsValue = currentAssetsValue.add(price.multiply(entry.getValue()));
                }
            }

            BigDecimal totalVal = runningBalance.add(currentAssetsValue).setScale(2, RoundingMode.HALF_UP);
            points.add(EquityPointResponse.builder()
                    .timestamp(tx.getExecutedAt().toInstant())
                    .value(totalVal)
                    .build());
        }

        // Point de fin au cours actuel
        PnLResponse currentPnl = calculatePnL(userId);
        points.add(EquityPointResponse.builder()
                .timestamp(Instant.now())
                .value(currentPnl.getTotalPortfolioValue())
                .build());

        return points;
    }

    private String determineCategory(String symbol) {
        String s = symbol.toUpperCase();
        if (s.endsWith("USDT") || s.startsWith("BTC") || s.startsWith("ETH") || s.startsWith("SOL") || s.startsWith("BNB")) {
            return "Crypto";
        }
        if (s.equals("SPY") || s.equals("QQQ") || s.equals("DIA") || s.equals("IWM") || s.equals("EEM") || s.equals("VGK") || s.equals("EWJ") || s.equals("GLD") || s.equals("TLT")) {
            return "ETF";
        }
        return "Actions";
    }
}
