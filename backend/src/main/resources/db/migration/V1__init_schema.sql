-- Activation de l'extension pour les fonctions de hachage et UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Table : USERS
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- NULLABLE si authentification Google exclusive
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    oauth_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT uq_users_oauth UNIQUE (oauth_id),
    CONSTRAINT chk_auth_provider CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'APPLE'))
);

-- ==========================================
-- 2. Table : VIRTUAL_PORTFOLIOS
-- ==========================================
CREATE TABLE virtual_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    current_balance NUMERIC(18, 8) NOT NULL DEFAULT 100000.00000000,
    initial_balance NUMERIC(18, 8) NOT NULL DEFAULT 100000.00000000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_portfolios_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_portfolios_user UNIQUE (user_id), -- Assure la relation 1:1
    CONSTRAINT chk_current_balance CHECK (current_balance >= 0) -- Empêche un solde négatif
);

-- ==========================================
-- 3. Table : SIMULATED_TRANSACTIONS
-- ==========================================
CREATE TABLE simulated_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL,
    asset_code VARCHAR(12) NOT NULL,
    order_direction VARCHAR(4) NOT NULL,
    quantity NUMERIC(18, 8) NOT NULL,
    execution_price NUMERIC(18, 8) NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transactions_portfolio FOREIGN KEY (portfolio_id) REFERENCES virtual_portfolios(id) ON DELETE CASCADE,
    CONSTRAINT chk_order_direction CHECK (order_direction IN ('BUY', 'SELL')),
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_price_positive CHECK (execution_price > 0)
);

-- ==========================================
-- 4. Table : ALERTS
-- ==========================================
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    asset_code VARCHAR(12) NOT NULL,
    target_price NUMERIC(18, 8) NOT NULL,
    trigger_condition VARCHAR(10) NOT NULL,
    notification_channel VARCHAR(10) NOT NULL,
    is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_trigger_condition CHECK (trigger_condition IN ('ABOVE', 'BELOW')),
    CONSTRAINT chk_notification_channel CHECK (notification_channel IN ('EMAIL', 'PUSH', 'BOTH')),
    CONSTRAINT chk_target_price_positive CHECK (target_price > 0)
);
