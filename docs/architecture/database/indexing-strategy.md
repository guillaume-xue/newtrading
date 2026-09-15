# ⚡ Stratégie d'Indexation & Performance PostgreSQL — NewTrading

Ce document formalise la stratégie d'optimisation des requêtes de la base de données PostgreSQL pour l'application NewTrading, afin de garantir une faible latence face aux flux temps réel (WebSockets) et aux traitements asynchrones (moteur d'alertes).

---

## 1. Vue d'Ensemble des Index

| Table | Nom de l'Index | Colonnes | Type / Prédicat | Cas d'usage métier |
| :--- | :--- | :--- | :--- | :--- |
| `simulated_transactions` | `idx_transactions_portfolio_id` | `portfolio_id` | B-Tree | Affichage du dashboard & calcul du PnL utilisateur |
| `simulated_transactions` | `idx_transactions_asset_code` | `asset_code` | B-Tree | Historique d'ordres par instrument (ex: `AAPL`) |
| `alerts` | `idx_alerts_lookup` | `(asset_code, is_triggered)` | B-Tree **Partiel** (`WHERE is_triggered = FALSE`) | Scanner temps réel des cours boursiers |

---

## 2. Analyse Détaillée des Index Personnalisés

### A. Historique des Transactions par Portefeuille
```sql
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id
    ON simulated_transactions(portfolio_id);
