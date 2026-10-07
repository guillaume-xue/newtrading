package com.newtrading.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.newtrading.auth.dto.LoginRequest;
import com.newtrading.auth.dto.RegisterRequest;
import com.newtrading.auth.repository.UserRepository;
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

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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
    @DisplayName("Doit réussir l'inscription et retourner le token JWT")
    void shouldRegisterSuccessfully() throws Exception {
        RegisterRequest request = new RegisterRequest("trader@test.com", "Password123!");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken", notNullValue()))
                .andExpect(jsonPath("$.email").value("trader@test.com"));
    }

    @Test
    @DisplayName("Doit renvoyer 400 Bad Request si le mot de passe ne respecte pas les critères")
    void shouldFailRegisterWhenWeakPassword() throws Exception {
        RegisterRequest request = new RegisterRequest("trader@test.com", "1234");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Erreur de Validation"))
                .andExpect(jsonPath("$.errors.password", notNullValue()));
    }

    @Test
    @DisplayName("Doit bloquer l'accès à une route protégée sans token JWT")
    void shouldRejectAccessToProtectedEndpointWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/portfolio"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Doit renvoyer 401 Unauthorized en cas de mauvais mot de passe au login")
    void shouldFailLoginWhenBadCredentials() throws Exception {
        // Pré-inscription
        RegisterRequest registerReq = new RegisterRequest("trader@test.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)));

        // Tentative de login avec mot de passe erroné
        LoginRequest loginReq = new LoginRequest("trader@test.com", "MauvaisMotDePasse123!");
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Email ou mot de passe incorrect"));
    }
}
