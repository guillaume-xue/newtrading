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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private VirtualPortfolioRepository portfolioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @Nested
    @DisplayName("Tests de la méthode register")
    class RegisterTests {

        @Test
        @DisplayName("Doit inscrire l'utilisateur, créer son portefeuille virtuel et retourner le token JWT")
        void shouldRegisterSuccessfully() {
            // Given
            RegisterRequest request = new RegisterRequest("trader@test.com", "Password123!");
            UUID userId = UUID.randomUUID();
            String encodedPassword = "encodedPasswordHash";
            String expectedToken = "fake.jwt.token";

            given(userRepository.existsByEmail("trader@test.com")).willReturn(false);
            given(passwordEncoder.encode(request.password())).willReturn(encodedPassword);

            User savedUser = User.builder()
                    .id(userId)
                    .email("trader@test.com")
                    .passwordHash(encodedPassword)
                    .authProvider("LOCAL")
                    .build();

            given(userRepository.save(any(User.class))).willReturn(savedUser);
            given(tokenProvider.generateToken(userId, "trader@test.com")).willReturn(expectedToken);

            // When
            AuthResponse response = authService.register(request);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo(expectedToken);
            assertThat(response.userId()).isEqualTo(userId);
            assertThat(response.email()).isEqualTo("trader@test.com");
            assertThat(response.tokenType()).isEqualTo("Bearer");

            // Vérification de la création de l'utilisateur
            ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(userCaptor.capture());
            User userCaptured = userCaptor.getValue();
            assertThat(userCaptured.getEmail()).isEqualTo("trader@test.com");
            assertThat(userCaptured.getPasswordHash()).isEqualTo(encodedPassword);

            // Vérification de la création du portefeuille virtuel initial à 100 000 USD
            ArgumentCaptor<VirtualPortfolio> portfolioCaptor = ArgumentCaptor.forClass(VirtualPortfolio.class);
            verify(portfolioRepository).save(portfolioCaptor.capture());
            VirtualPortfolio portfolioCaptured = portfolioCaptor.getValue();
            assertThat(portfolioCaptured.getUser()).isEqualTo(savedUser);
            assertThat(portfolioCaptured.getCurrentBalance()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
            assertThat(portfolioCaptured.getInitialBalance()).isEqualByComparingTo(new BigDecimal("100000.00000000"));
        }

        @Test
        @DisplayName("Doit lever une BusinessException 409 Conflict si l'email existe déjà")
        void shouldThrowConflictWhenEmailAlreadyExists() {
            // Given
            RegisterRequest request = new RegisterRequest("existing@test.com", "Password123!");
            given(userRepository.existsByEmail("existing@test.com")).willReturn(true);

            // When & Then
            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(businessException.getMessage()).isEqualTo("Cet email est déjà associé à un compte");
                    });

            verify(userRepository, never()).save(any());
            verify(portfolioRepository, never()).save(any());
            verify(tokenProvider, never()).generateToken(any(), any());
        }
    }

    @Nested
    @DisplayName("Tests de la méthode login")
    class LoginTests {

        @Test
        @DisplayName("Doit authentifier l'utilisateur et émettre un token si les identifiants sont valides")
        void shouldLoginSuccessfully() {
            // Given
            LoginRequest request = new LoginRequest("trader@test.com", "Password123!");
            UUID userId = UUID.randomUUID();
            String hash = "validBCryptHash";
            String expectedToken = "signed.jwt.token";

            User existingUser = User.builder()
                    .id(userId)
                    .email("trader@test.com")
                    .passwordHash(hash)
                    .build();

            given(userRepository.findByEmail("trader@test.com")).willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("Password123!", hash)).willReturn(true);
            given(tokenProvider.generateToken(userId, "trader@test.com")).willReturn(expectedToken);

            // When
            AuthResponse response = authService.login(request);

            // Then
            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo(expectedToken);
            assertThat(response.userId()).isEqualTo(userId);
            assertThat(response.email()).isEqualTo("trader@test.com");
        }

        @Test
        @DisplayName("Doit lever une BusinessException 401 Unauthorized si l'email n'existe pas")
        void shouldThrowUnauthorizedWhenEmailNotFound() {
            // Given
            LoginRequest request = new LoginRequest("unknown@test.com", "Password123!");
            given(userRepository.findByEmail("unknown@test.com")).willReturn(Optional.empty());

            // When & Then
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(businessException.getMessage()).isEqualTo("Email ou mot de passe incorrect");
                    });

            verify(passwordEncoder, never()).matches(anyString(), anyString());
            verify(tokenProvider, never()).generateToken(any(), any());
        }

        @Test
        @DisplayName("Doit lever une BusinessException 401 Unauthorized si le mot de passe est erroné")
        void shouldThrowUnauthorizedWhenPasswordDoesNotMatch() {
            // Given
            LoginRequest request = new LoginRequest("trader@test.com", "WrongPassword!");
            User existingUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("trader@test.com")
                    .passwordHash("validHash")
                    .build();

            given(userRepository.findByEmail("trader@test.com")).willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("WrongPassword!", "validHash")).willReturn(false);

            // When & Then
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                        assertThat(businessException.getMessage()).isEqualTo("Email ou mot de passe incorrect");
                    });

            verify(tokenProvider, never()).generateToken(any(), any());
        }

        @Test
        @DisplayName("Doit lever une BusinessException 401 Unauthorized si le compte est OAuth (aucun mot de passe défini)")
        void shouldThrowUnauthorizedWhenUserHasNoPassword() {
            // Given
            LoginRequest request = new LoginRequest("oauth_user@test.com", "Password123!");
            User oauthUser = User.builder()
                    .id(UUID.randomUUID())
                    .email("oauth_user@test.com")
                    .passwordHash(null)
                    .authProvider("GOOGLE")
                    .build();

            given(userRepository.findByEmail("oauth_user@test.com")).willReturn(Optional.of(oauthUser));

            // When & Then
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BusinessException.class)
                    .satisfies(ex -> {
                        BusinessException businessException = (BusinessException) ex;
                        assertThat(businessException.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
                    });

            verify(passwordEncoder, never()).matches(anyString(), anyString());
        }
    }
}
