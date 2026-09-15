# 🌐 Vue d'Ensemble du Système

## Architecture Globale

```mermaid
graph TD
    subgraph Clients
        Web["Client Web (Next.js / Lightweight Charts)"]
        Mobile["Client Mobile (React Native / iOS & Android)"]
    end

    subgraph API_Gateway_Backend["Backend (Java / Spring Boot)"]
        Security["Spring Security (JWT / OAuth2)"]
        TradingEngine["Moteur de Paper Trading (PnL)"]
        WSHandler["WebSocket Manager (Spring WebSocket)"]
        AlertEngine["Moteur d'Alertes (Background Worker)"]
    end

    subgraph Database["Stockage"]
        Postgres[(PostgreSQL 16)]
    end

    subgraph External_Services["Services Tiers"]
        MarketAPI["API Boursière (Alpha Vantage / Flux OHLCV)"]
        FCM["Firebase Cloud Messaging (Push)"]
        SendGrid["SendGrid (Email)"]
        GoogleAuth["Google OAuth 2.0"]
    end

    %% Flux Clients
    Web -->|REST / HTTPS| Security
    Mobile -->|REST / HTTPS| Security
    Web <-->|WebSockets (Live Ticks)| WSHandler
    Mobile <-->|WebSockets (Live Ticks)| WSHandler

    %% Flux Backend Interne
    Security --> TradingEngine
    TradingEngine --> Postgres
    AlertEngine --> Postgres

    %% Flux Externes
    TradingEngine -->|Fetch Prices| MarketAPI
    AlertEngine -->|Trigger Push| FCM
    AlertEngine -->|Trigger Email| SendGrid
    Security -->|Verify Token| GoogleAuth
    MarketAPI -->|Stream Ticks| WSHandler
```

## Description des Flux Temps Réel
1. Le client s'abonne à un canal WebSocket pour un actif spécifique (ex: `AAPL`).
2. Le service `marketdata` interroge le flux distant ou diffuse les ticks aux clients abonnés.
3. Le moteur d'alertes compare les cours en temps réel aux critères configurés et déclenche FCM ou SendGrid de façon asynchrone.
