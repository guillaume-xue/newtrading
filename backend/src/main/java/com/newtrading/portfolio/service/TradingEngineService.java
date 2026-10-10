package com.newtrading.portfolio.service;

import com.newtrading.marketdata.dto.QuoteDto;
import com.newtrading.marketdata.service.MarketDataCacheService;
import com.newtrading.portfolio.dto.PlaceOrderRequest;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.SimulatedTransactionRepository;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TradingEngineService {

    private final VirtualPortfolioRepository portfolioRepository;
    private final SimulatedTransactionRepository transactionRepository;
    private final MarketDataCacheService marketDataCacheService;

    @Transactional
    public SimulatedTransaction executeOrder(UUID userId, PlaceOrderRequest request) {
        String assetCode = request.getAssetCode().toUpperCase().trim();
        String direction = request.getOrderDirection().toUpperCase().trim();
        BigDecimal quantity = request.getQuantity();

        VirtualPortfolio portfolio = portfolioRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new BusinessException("Portefeuille introuvable pour cet utilisateur", HttpStatus.NOT_FOUND));

        QuoteDto quote = marketDataCacheService.getQuote(assetCode);
        if (quote == null || quote.getPrice() == null || quote.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Impossible de récupérer la cotation en temps réel pour l'actif : " + assetCode, HttpStatus.BAD_REQUEST);
        }

        BigDecimal executionPrice = quote.getPrice();
        BigDecimal totalCost = executionPrice.multiply(quantity).setScale(8, RoundingMode.HALF_UP);

        if ("BUY".equals(direction)) {
            if (portfolio.getCurrentBalance().compareTo(totalCost) < 0) {
                throw new BusinessException("Solde virtuel insuffisant pour exécuter cet achat", HttpStatus.BAD_REQUEST);
            }
            portfolio.setCurrentBalance(portfolio.getCurrentBalance().subtract(totalCost));
        } else if ("SELL".equals(direction)) {
            BigDecimal ownedQuantity = getAvailableQuantity(portfolio.getId(), assetCode);
            if (ownedQuantity.compareTo(quantity) < 0) {
                throw new BusinessException("Quantité détenue insuffisante pour exécuter cette vente", HttpStatus.BAD_REQUEST);
            }
            portfolio.setCurrentBalance(portfolio.getCurrentBalance().add(totalCost));
        } else {
            throw new BusinessException("Direction d'ordre non reconnue : " + direction, HttpStatus.BAD_REQUEST);
        }

        portfolioRepository.save(portfolio);

        SimulatedTransaction transaction = SimulatedTransaction.builder()
                .portfolio(portfolio)
                .assetCode(assetCode)
                .orderDirection(direction)
                .quantity(quantity)
                .executionPrice(executionPrice)
                .build();

        return transactionRepository.save(transaction);
    }

    public BigDecimal getAvailableQuantity(UUID portfolioId, String assetCode) {
        List<SimulatedTransaction> transactions = transactionRepository.findByPortfolioIdAndAssetCode(portfolioId, assetCode);
        BigDecimal netQuantity = BigDecimal.ZERO;

        for (SimulatedTransaction tx : transactions) {
            if ("BUY".equalsIgnoreCase(tx.getOrderDirection())) {
                netQuantity = netQuantity.add(tx.getQuantity());
            } else if ("SELL".equalsIgnoreCase(tx.getOrderDirection())) {
                netQuantity = netQuantity.subtract(tx.getQuantity());
            }
        }
        return netQuantity;
    }
}
