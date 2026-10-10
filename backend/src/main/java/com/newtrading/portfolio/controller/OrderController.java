package com.newtrading.portfolio.controller;

import com.newtrading.auth.model.User;
import com.newtrading.portfolio.dto.PlaceOrderRequest;
import com.newtrading.portfolio.dto.PnLResponse;
import com.newtrading.portfolio.model.SimulatedTransaction;
import com.newtrading.portfolio.service.PortfolioService;
import com.newtrading.portfolio.service.TradingEngineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/trades")
@RequiredArgsConstructor
public class OrderController {

    private final TradingEngineService tradingEngineService;
    private final PortfolioService portfolioService;

    @PostMapping
    public ResponseEntity<SimulatedTransaction> placeOrder(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody PlaceOrderRequest request
    ) {
        SimulatedTransaction transaction = tradingEngineService.executeOrder(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<SimulatedTransaction>> getOrderHistory(
            @AuthenticationPrincipal User currentUser,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(portfolioService.getTransactionHistory(currentUser.getId(), pageable));
    }

    @GetMapping("/pnl")
    public ResponseEntity<PnLResponse> getPortfolioPnL(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(portfolioService.calculatePnL(currentUser.getId()));
    }
}
