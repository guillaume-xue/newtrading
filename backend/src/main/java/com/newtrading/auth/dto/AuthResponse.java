package com.newtrading.auth.dto;

import java.util.UUID;

public record AuthResponse(
    String accessToken,
    String tokenType,
    UUID userId,
    String email
) {
    public AuthResponse(String accessToken, UUID userId, String email) {
        this(accessToken, "Bearer", userId, email);
    }
}
