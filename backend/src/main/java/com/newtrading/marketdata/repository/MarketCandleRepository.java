package com.newtrading.marketdata.repository;

import com.newtrading.marketdata.model.MarketCandle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MarketCandleRepository extends JpaRepository<MarketCandle, UUID> {

    /**
     * Récupère l'historique complet pour un actif et un timeframe, trié par date croissante (prêt pour Lightweight Charts).
     */
    List<MarketCandle> findByAssetCodeAndTimeframeOrderByOpenTimeAsc(String assetCode, String timeframe);

    /**
     * Récupère les bougies sur une plage temporelle donnée (ex: zoom graphique).
     */
    List<MarketCandle> findByAssetCodeAndTimeframeAndOpenTimeBetweenOrderByOpenTimeAsc(
            String assetCode,
            String timeframe,
            Instant start,
            Instant end
    );

    /**
     * Récupère les N dernières bougies (avec tri antéchronologique puis inversion côté service ou subquery).
     */
    @Query("SELECT c FROM MarketCandle c WHERE c.assetCode = :assetCode AND c.timeframe = :timeframe ORDER BY c.openTime DESC")
    List<MarketCandle> findLatestCandles(
            @Param("assetCode") String assetCode,
            @Param("timeframe") String timeframe,
            Pageable pageable
    );

    /**
     * Vérifie la présence de bougies pour savoir si une synchronisation externe est nécessaire.
     */
    boolean existsByAssetCodeAndTimeframe(String assetCode, String timeframe);
}
