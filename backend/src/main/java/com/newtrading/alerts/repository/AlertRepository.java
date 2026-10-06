package com.newtrading.alerts.repository;

import com.newtrading.alerts.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    List<Alert> findByUserId(UUID userId);

    // Exploite directement l'index partiel PostgreSQL (idx_alerts_lookup)
    List<Alert> findByAssetCodeAndIsTriggeredFalse(String assetCode);
}
