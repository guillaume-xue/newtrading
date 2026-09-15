-- Optimise l'affichage de l'historique des transactions d'un portefeuille spécifique
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON simulated_transactions(portfolio_id);

-- Optimise les recherches d'historique de prix par actif
CREATE INDEX IF NOT EXISTS idx_transactions_asset_code ON simulated_transactions(asset_code);

-- Optimise le moteur d'arrière-plan du backend Spring Boot qui scanne les alertes actives par actif
CREATE INDEX IF NOT EXISTS idx_alerts_lookup ON alerts(asset_code, is_triggered) WHERE is_triggered = FALSE;
