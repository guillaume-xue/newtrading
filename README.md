# NewTrading

Plateforme de simulation boursière et de Paper Trading temps réel.

## 🛠️ Stack Technique
- **API REST & WS :** Java Spring Boot 3, Spring Security (JWT)
- **Base de données :** PostgreSQL (UUID v4, types NUMERIC(18, 8))
- **Frontends :** Next.js (Web), React Native (Mobile), Lightweight Charts
- **Tiers :** Google OAuth 2.0, Firebase Cloud Messaging, SendGrid

## 🚀 Démarrage Rapide
1. Démarrer PostgreSQL : `docker compose up -d`
2. Lancer le backend : `cd backend && ./mvnw spring-boot:run`
3. Lancer le web : `cd frontend-web && npm run dev`
