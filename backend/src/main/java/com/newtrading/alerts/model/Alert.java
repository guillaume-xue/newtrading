package com.newtrading.alerts.model;

import com.newtrading.auth.model.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "asset_code", nullable = false, length = 12)
    private String assetCode;

    @Column(name = "target_price", nullable = false, precision = 18, scale = 8)
    private BigDecimal targetPrice;

    @Column(name = "trigger_condition", nullable = false, length = 10)
    private String triggerCondition; // "ABOVE" ou "BELOW"

    @Column(name = "notification_channel", nullable = false, length = 10)
    private String notificationChannel; // "EMAIL", "PUSH", "BOTH"

    @Column(name = "is_triggered", nullable = false)
    @Builder.Default
    private Boolean isTriggered = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
