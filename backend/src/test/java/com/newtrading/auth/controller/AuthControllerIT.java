package com.newtrading.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.auth.dto.RegisterRequest;
import com.newtrading.auth.model.User;
import com.newtrading.auth.repository.UserRepository;
import com.newtrading.portfolio.model.VirtualPortfolio;
import com.newtrading.portfolio.repository.VirtualPortfolioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VirtualPortfolioRepository portfolioRepository;

    @BeforeEach
    void cleanDatabase() {
        portfolioRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Doit insérer l'utilisateur et son portefeuille virtuel avec le solde par défaut")
    void shouldPersistUserAndVirtualPortfolioOnRegistration() throws Exception {
        RegisterRequest request = new RegisterRequest("trader_pro@test.com", "Password123!");

        // Requête HTTP POST /register
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // 1. Vérification en base de données de la présence de l'utilisateur
        Optional<User> userOpt = userRepository.findByEmail("trader_pro@test.com");
        assertThat(userOpt).isPresent();
        User createdUser = userOpt.get();

        // 2. Vérification de la création et du lien direct du portefeuille virtuel
        Optional<VirtualPortfolio> portfolioOpt = portfolioRepository.findByUserId(createdUser.getId());
        assertThat(portfolioOpt).isPresent();

        VirtualPortfolio portfolio = portfolioOpt.get();
        assertThat(portfolio.getUser().getId()).isEqualTo(createdUser.getId());
        assertThat(portfolio.getInitialBalance()).isEqualByComparingTo(new BigDecimal("10000.00000000"));
        assertThat(portfolio.getCurrentBalance()).isEqualByComparingTo(new BigDecimal("10000.00000000"));
    }
}
