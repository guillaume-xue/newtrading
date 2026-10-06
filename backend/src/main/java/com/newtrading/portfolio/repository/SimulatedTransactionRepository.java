package com.newtrading.portfolio.repository;

import com.newtrading.portfolio.model.SimulatedTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SimulatedTransactionRepository extends JpaRepository<SimulatedTransaction, UUID> {

    Page<SimulatedTransaction> findByPortfolioIdOrderByExecutedAtDesc(UUID portfolioId, Pageable pageable);

    List<SimulatedTransaction> findByPortfolioIdAndAssetCode(UUID portfolioId, String assetCode);
}
