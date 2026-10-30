-- ==========================================
-- 5. Table : MARKET_CANDLES
-- ==========================================
CREATE TABLE market_candles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(12) NOT NULL,
    timeframe VARCHAR(5) NOT NULL DEFAULT '1D',
    open_time TIMESTAMPTZ NOT NULL,
    open_price NUMERIC(18, 8) NOT NULL,
    high_price NUMERIC(18, 8) NOT NULL,
    low_price NUMERIC(18, 8) NOT NULL,
    close_price NUMERIC(18, 8) NOT NULL,
    volume NUMERIC(18, 8) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Empêche l'enregistrement de bougies en doublon lors des synchronisations
    CONSTRAINT uq_market_candles_record UNIQUE (asset_code, timeframe, open_time),

    -- Validation de cohérence financière de base
    CONSTRAINT chk_candles_prices_positive CHECK (
        open_price > 0 AND high_price > 0 AND low_price > 0 AND close_price > 0 AND volume >= 0
    ),
    CONSTRAINT chk_candles_high_low CHECK (
        high_price >= low_price AND high_price >= open_price AND high_price >= close_price AND low_price <= open_price AND low_price <= close_price
    )
);

-- Index composite optimisé pour les requêtes du graphique (filtrage par actif/timeframe et tri antéchronologique)
CREATE INDEX IF NOT EXISTS idx_candles_lookup
ON market_candles (asset_code, timeframe, open_time DESC);
