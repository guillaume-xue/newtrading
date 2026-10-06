package com.newtrading.portfolio.repository;

import com.newtrading.portfolio.model.VirtualPortfolio;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VirtualPortfolioRepository extends JpaRepository<VirtualPortfolio, UUID> {

    /**
     * Recherche le portefeuille par l'ID de l'utilisateur.
     */
    Optional<VirtualPortfolio> findByUserId(UUID userId);

    /**
     * Bonne pratique en finance/trading : verrou pessimiste (SELECT ... FOR UPDATE)
     * pour empêcher les conditions de course (double dépense) lors de l'exécution d'un ordre.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM VirtualPortfolio p WHERE p.user.id = :userId")
    Optional<VirtualPortfolio> findByUserIdWithLock(@Param("userId") UUID userId);
}
