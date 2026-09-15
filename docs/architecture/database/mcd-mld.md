# 🗄️ Modélisation des Données (MCD & MLD) - NewTrading

Ce document détaille la modélisation conceptuelle et logique de la base de données PostgreSQL pour le projet NewTrading, incluant les contraintes d'intégrité, les règles métiers et la stratégie d'indexation.

---

## 1. Modèle Conceptuel de Données (MCD)

### Entités & Relations
- **USERS (Utilisateurs)** : Représente les comptes utilisateurs enregistrés (locaux ou via OAuth).
- **VIRTUAL_PORTFOLIOS (Portefeuilles Virtuels)** : Gère le solde virtuel dédié au paper trading. Relation stricte **1:1** avec `USERS`.
- **SIMULATED_TRANSACTIONS (Transactions Simulées)** : Historique des ordres d'achat (`BUY`) et de vente (`SELL`). Relation **1:N** avec `VIRTUAL_PORTFOLIOS`.
- **ALERTS (Alertes de Prix)** : Alertes configurées par les utilisateurs sur des instruments financiers. Relation **1:N** avec `USERS`.

### Diagramme Entité-Relation (Mermaid)

```mermaid
erDiagram
    USERS ||--|| VIRTUAL_PORTFOLIOS : "possède (1:1)"
    USERS ||--o{ ALERTS : "définit (1:N)"
    VIRTUAL_PORTFOLIOS ||--o{ SIMULATED_TRANSACTIONS : "contient (1:N)"

    USERS {
        UUID id PK "DEFAULT gen_random_uuid()"
        VARCHAR email UK "NOT NULL"
        VARCHAR password_hash "NULLABLE (OAuth)"
        VARCHAR auth_provider "NOT NULL, DEFAULT 'LOCAL'"
        VARCHAR oauth_id UK "NULLABLE"
        TIMESTAMPTZ created_at "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }

    VIRTUAL_PORTFOLIOS {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID user_id FK, UK "NOT NULL, ON DELETE CASCADE"
        NUMERIC current_balance "NOT NULL, DEFAULT 100000.00000000"
        NUMERIC initial_balance "NOT NULL, DEFAULT 100000.00000000"
        TIMESTAMPTZ created_at "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }

    SIMULATED_TRANSACTIONS {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID portfolio_id FK "NOT NULL, ON DELETE CASCADE"
        VARCHAR asset_code "NOT NULL (ex: AAPL)"
        VARCHAR order_direction "NOT NULL (BUY | SELL)"
        NUMERIC quantity "NOT NULL (> 0)"
        NUMERIC execution_price "NOT NULL (> 0)"
        TIMESTAMPTZ executed_at "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }

    ALERTS {
        UUID id PK "DEFAULT gen_random_uuid()"
        UUID user_id FK "NOT NULL, ON DELETE CASCADE"
        VARCHAR asset_code "NOT NULL"
        NUMERIC target_price "NOT NULL (> 0)"
        VARCHAR trigger_condition "NOT NULL (ABOVE | BELOW)"
        VARCHAR notification_channel "NOT NULL (EMAIL | PUSH | BOTH)"
        BOOLEAN is_triggered "NOT NULL, DEFAULT FALSE"
        TIMESTAMPTZ created_at "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
