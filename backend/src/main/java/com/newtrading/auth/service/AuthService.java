package com.newtrading.auth.service;

import com.newtrading.auth.dto.AuthResponse;
import com.newtrading.auth.dto.LoginRequest;
import com.newtrading.auth.dto.RegisterRequest;
import com.newtrading.auth.model.User;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import com.newtrading.shared.exception.BusinessException;
import com.newtrading.shared.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VirtualPortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    private static final BigDecimal INITIAL_BALANCE = new BigDecimal("100000.00000000");

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Cet email est déjà associé à un compte", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.email().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .authProvider("LOCAL")
                .build();
        user = userRepository.save(user);

        VirtualPortfolio portfolio = VirtualPortfolio.builder()
                .user(user)
                .initialBalance(INITIAL_BALANCE)
                .currentBalance(INITIAL_BALANCE)
                .build();
        portfolioRepository.save(portfolio);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email ou mot de passe incorrect", HttpStatus.UNAUTHORIZED));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException("Email ou mot de passe incorrect", HttpStatus.UNAUTHORIZED);
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getEmail());
    }
}
