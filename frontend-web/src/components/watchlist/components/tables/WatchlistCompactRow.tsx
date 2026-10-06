// components/table/WatchlistCompactRow.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';

export interface WatchlistCompactRowProps {
  symbol: string;
  lastPrice: number | string;
  changeAmount: number;
  changePercent: number;
  style?: ViewStyle;
}

export const WatchlistCompactRow: React.FC<WatchlistCompactRowProps> = ({
  symbol,
  lastPrice,
  changeAmount,
  changePercent,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const isUp = changeAmount >= 0;
  const trendColor = isUp
    ? (theme['colors_badge_up-text'] ?? '#059669')
    : (theme['colors_badge_down-text'] ?? '#DC2626');

  const formattedLastPrice =
    typeof lastPrice === 'number'
      ? lastPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : lastPrice;

  const formattedChangeAmount = `${isUp ? '' : ''}${changeAmount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formattedChangePercent = `${changePercent.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderBottomColor: theme['colors_divider_text'] ?? '#E5E7EB',
        },
        style,
      ]}
    >
      <View style={styles.symbolGroup}>
        <MarketTickerInfo size="sm" title={symbol} />
      </View>

      <Text style={[styles.priceText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
        {formattedLastPrice}
      </Text>

      <Text style={[styles.changeText, { color: trendColor }]}>
        {formattedChangeAmount}
      </Text>

      <Text style={[styles.changePercentText, { color: trendColor }]}>
        {formattedChangePercent}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
    minHeight: 40,
  },
  symbolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.2,
    gap: 6,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '800',
  },
  priceText: {
    flex: 1,
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  changeText: {
    flex: 1,
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '700',
    textAlign: 'right',
  },
  changePercentText: {
    flex: 1,
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});
