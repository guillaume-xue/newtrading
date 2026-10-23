package com.newtrading.alerts.controller;

import com.newtrading.alerts.dto.AlertDto;
import com.newtrading.alerts.dto.CreateAlertRequest;
import com.newtrading.alerts.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @PostMapping
    public ResponseEntity<AlertDto> createAlert(
            Authentication authentication,
            @Valid @RequestBody CreateAlertRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<AlertDto>> getUserAlerts(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(alertService.getUserAlerts(userId));
    }

    @DeleteMapping("/{alertId}")
    public ResponseEntity<Void> deleteAlert(
            Authentication authentication,
            @PathVariable UUID alertId
    ) {
        UUID userId = UUID.fromString(authentication.getName());
        alertService.deleteAlert(userId, alertId);
        return ResponseEntity.noContent().build();
    }
}
