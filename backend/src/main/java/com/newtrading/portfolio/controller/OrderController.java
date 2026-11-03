package com.newtrading.portfolio.controller;

import com.newtrading.auth.model.User;
import com.newtrading.portfolio.dto.PlaceOrderRequest;
import com.newtrading.portfolio.dto.PnLResponse;
import com.newtrading.portfolio.dto.TransactionResponse;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.service.PortfolioService;
import com.newtrading.portfolio.service.TradingEngineService;
import com.newtrading.shared.exception.BusinessException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trades")
@RequiredArgsConstructor
public class OrderController {

    private final TradingEngineService tradingEngineService;
    private final PortfolioService portfolioService;

    @PostMapping
    public ResponseEntity<TransactionResponse> placeOrder(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        UUID userId = extractUserId(currentUser);
        SimulatedTransaction transaction = tradingEngineService.executeOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TransactionResponse.fromEntity(transaction));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<TransactionResponse>> getOrderHistory(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20, sort = "executedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        UUID userId = extractUserId(currentUser);
        Page<SimulatedTransaction> page = portfolioService.getTransactionHistory(userId, pageable);
        return ResponseEntity.ok(page.map(TransactionResponse::fromEntity));
    }

    @GetMapping("/pnl")
    public ResponseEntity<PnLResponse> getPortfolioPnL(
            @AuthenticationPrincipal User currentUser
    ) {
        UUID userId = extractUserId(currentUser);
        return ResponseEntity.ok(portfolioService.calculatePnL(userId));
    }

    private UUID extractUserId(User currentUser) {
        if (currentUser == null || currentUser.getId() == null) {
            throw new BusinessException("Session utilisateur invalide ou expirée", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
        }
        return currentUser.getId();
    }
}
