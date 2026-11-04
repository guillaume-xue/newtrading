package com.newtrading.portfolio.repository;

import com.newtrading.portfolio.model.SimulatedTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface SimulatedTransactionRepository extends JpaRepository<SimulatedTransaction, UUID> {

    Page<SimulatedTransaction> findByPortfolioIdOrderByExecutedAtDesc(UUID portfolioId, Pageable pageable);

    /**
     * Récupère toutes les transactions triées par ordre chronologique ascendant
     * pour reconstituer la courbe d'équité historique du portefeuille.
     */
    List<SimulatedTransaction> findByPortfolioIdOrderByExecutedAtAsc(UUID portfolioId);

    List<SimulatedTransaction> findByPortfolioIdAndAssetCode(UUID portfolioId, String assetCode);

    @Query("""
        SELECT COALESCE(SUM(CASE WHEN t.orderDirection = 'BUY' THEN t.quantity ELSE -t.quantity END), 0)
        FROM SimulatedTransaction t
        WHERE t.portfolio.id = :portfolioId AND t.assetCode = :assetCode
    """)
    BigDecimal calculatePositionNetQuantity(@Param("portfolioId") UUID portfolioId, @Param("assetCode") String assetCode);

    /**
     * Projection agrégée exécutée directement par PostgreSQL :
     * Renvoie le symbole et la quantité nette restante (uniquement les positions actives).
     */
    interface HoldingProjection {
        String getAssetCode();
        BigDecimal getNetQuantity();
    }

    @Query("""
        SELECT t.assetCode AS assetCode,
               SUM(CASE WHEN t.orderDirection = 'BUY' THEN t.quantity ELSE -t.quantity END) AS netQuantity
        FROM SimulatedTransaction t
        WHERE t.portfolio.id = :portfolioId
        GROUP BY t.assetCode
        HAVING SUM(CASE WHEN t.orderDirection = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0
    """)
    List<HoldingProjection> findActiveHoldingsByPortfolioId(@Param("portfolioId") UUID portfolioId);
}
