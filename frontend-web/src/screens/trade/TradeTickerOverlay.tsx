'use client';

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';
import { formatUsdPrice } from '@/utils/marketFormatters';

interface TradeTickerOverlayProps {
  symbol: string;
  currentPrice: number;
  priceChangePercent: number;
}

/**
 * Superposition compacte du symbole, badge SPOT, prix tabulaire et variation %
 * dans le coin supérieur gauche de la zone graphique.
 */
export const TradeTickerOverlay: React.FC<TradeTickerOverlayProps> = memo(
  ({ symbol, currentPrice, priceChangePercent }) => {
    const { theme } = useAppTheme();
    const { colors, primitives } = theme;

    const isPositive = priceChangePercent >= 0;
    const priceColor = isPositive ? colors['colors_badge_up'] : colors['colors_badge_down'];

    return (
      <View style={styles.container} pointerEvents="none">
        <Text style={[styles.symbol, { color: colors['colors_text_primary'] }]}>
          {symbol}
        </Text>

        <View
          style={[
            styles.badgePill,
            {
              backgroundColor: colors['colors_bg_primary'],
              borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors['colors_text_secondary'] }]}>
            SPOT
          </Text>
        </View>

        <Text style={[styles.price, { color: priceColor }]}>
          {formatUsdPrice(currentPrice)}
        </Text>

        <Text style={[styles.percent, { color: priceColor }]}>
          {priceChangePercent !== 0
            ? `${isPositive ? '+' : ''}${priceChangePercent.toFixed(2)}%`
            : '0.00%'}
        </Text>
      </View>
    );
  }
);

TradeTickerOverlay.displayName = 'TradeTickerOverlay';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  percent: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
