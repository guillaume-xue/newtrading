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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingEngineService {

    private final VirtualPortfolioRepository portfolioRepository;
    private final SimulatedTransactionRepository transactionRepository;
    private final MarketDataCacheService marketDataCacheService;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public SimulatedTransaction executeOrder(UUID userId, PlaceOrderRequest request) {
        String assetCode = request.getAssetCode().toUpperCase().trim();
        String direction = request.getOrderDirection().toUpperCase().trim();
        BigDecimal quantity = request.getQuantity();

        // 1. Verrou pessimiste en base (SELECT ... FOR UPDATE) pour isoler le portefeuille
        VirtualPortfolio portfolio = portfolioRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new BusinessException("Portefeuille introuvable pour cet utilisateur", HttpStatus.NOT_FOUND, "PORTFOLIO_NOT_FOUND"));

        // 2. Récupération STRICTE d'un cours réel certifié (pas de fallback / mock)
        QuoteDto certifiedQuote = marketDataCacheService.getCertifiedQuoteForExecution(assetCode);
        BigDecimal executionPrice = certifiedQuote.getPrice();

        // 3. Calcul du montant total de la transaction (précision 8 décimales)
        BigDecimal totalCost = executionPrice.multiply(quantity).setScale(8, RoundingMode.HALF_UP);

        // 4. Validation des règles métier selon le sens de l'ordre
        if ("BUY".equals(direction)) {
            if (portfolio.getCurrentBalance().compareTo(totalCost) < 0) {
                throw new BusinessException(
                        "Solde insuffisant pour exécuter cet achat (Requis : " + totalCost + ", Disponible : " + portfolio.getCurrentBalance() + ")",
                        HttpStatus.BAD_REQUEST,
                        "INSUFFICIENT_FUNDS"
                );
            }
            portfolio.setCurrentBalance(portfolio.getCurrentBalance().subtract(totalCost));

        } else if ("SELL".equals(direction)) {
            BigDecimal ownedQuantity = getAvailableQuantity(portfolio.getId(), assetCode);
            if (ownedQuantity.compareTo(quantity) < 0) {
                throw new BusinessException(
                        "Position insuffisante pour exécuter cette vente (Détenu : " + ownedQuantity + ", Demandé : " + quantity + ")",
                        HttpStatus.BAD_REQUEST,
                        "INSUFFICIENT_POSITION"
                );
            }
            portfolio.setCurrentBalance(portfolio.getCurrentBalance().add(totalCost));

        } else {
            throw new BusinessException("Direction d'ordre inconnue : " + direction, HttpStatus.BAD_REQUEST, "INVALID_DIRECTION");
        }

        // 5. Sauvegarde de l'état mis à jour
        portfolioRepository.save(portfolio);

        SimulatedTransaction transaction = SimulatedTransaction.builder()
                .portfolio(portfolio)
                .assetCode(assetCode)
                .orderDirection(direction)
                .quantity(quantity)
                .executionPrice(executionPrice)
                .build();

        SimulatedTransaction savedTx = transactionRepository.save(transaction);
        log.info("Ordre {} exécuté avec succès pour user {}: {} x {} @ {}", direction, userId, quantity, assetCode, executionPrice);

        return savedTx;
    }

    public BigDecimal getAvailableQuantity(UUID portfolioId, String assetCode) {
        BigDecimal netQuantity = transactionRepository.calculatePositionNetQuantity(portfolioId, assetCode);
        return netQuantity != null ? netQuantity : BigDecimal.ZERO;
    }
}
