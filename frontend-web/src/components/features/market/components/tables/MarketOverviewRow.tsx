'use client';

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { useAppTheme } from '@/theme/ThemeContext';

export interface MarketOverviewRowProps {
  countryOrCategory: string;
  name: string;
  symbol?: string;
  price: number | string;
  changePercent: number;
  volume24h: string;
  style?: ViewStyle;
}

export const MarketOverviewRow: React.FC<MarketOverviewRowProps> = ({
  countryOrCategory,
  name,
  symbol,
  price,
  changePercent,
  volume24h,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  // Calcul de la tendance (positif ou négatif)
  const numericChange = useMemo(() => {
    return typeof changePercent === 'number'
      ? changePercent
      : parseFloat(String(changePercent).replace(',', '.').replace('%', '').trim());
  }, [changePercent]);

  const isPositive = !isNaN(numericChange) ? numericChange >= 0 : true;

  // Couleurs dérivées dynamiquement des tokens du thème
  const lineColor = isPositive
    ? colors['colors_button_buy']
    : colors['colors_button_sell'];

  const topColor = isPositive
    ? 'rgba(5, 150, 105, 0.25)'
    : 'rgba(220, 38, 38, 0.25)';

  const bottomColor = isPositive
    ? 'rgba(5, 150, 105, 0.0)'
    : 'rgba(220, 38, 38, 0.0)';

  const formattedPrice = useMemo(() => {
    return typeof price === 'number'
      ? `${price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : price;
  }, [price]);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderBottomColor: colors['colors_divider_text'],
          paddingVertical: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
          paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
          borderBottomWidth: primitives['border width_border-thin'] ?? 1,
        },
        style,
      ]}
    >
      {/* 1. Actif */}
      <View style={styles.colAsset}>
        <MarketTickerInfo
          title={countryOrCategory}
          subtitle={name}
          emphasis="title"
        />
      </View>

      {/* 2. Tendance 7j (Mini-Graphique) */}
      <View style={styles.colTrendChart}>
        <TradingChart
          symbol={symbol ?? name}
          themeMode={isDark ? 'dark' : 'light'}
          chartType="area"
          activeTool="crosshair"
          disableZoom
          sparkline
          selectedRange="1M"
          lineColor={lineColor}
          topColor={topColor}
          bottomColor={bottomColor}
        />
      </View>

      {/* 3. Prix */}
      <View style={styles.colPrice}>
        <Text
          style={[
            styles.priceText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
        >
          {formattedPrice}
        </Text>
      </View>

      {/* 4. 24h % */}
      <View style={styles.colChange}>
        <FinancialValue
          value={changePercent}
          type="percent"
          showArrow={true}
          size="md"
          style={styles.changeValue}
        />
      </View>

      {/* 5. Volume 24h */}
      <View style={styles.colVolume}>
        <Text
          style={[
            styles.volumeText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
        >
          {volume24h}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  colAsset: {
    flex: 2.4,
    flexBasis: 0,
  },
  colTrendChart: {
    flex: 2,
    flexBasis: 0,
    minWidth: 140,
    height: 52,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  colPrice: {
    flex: 1.4,
    flexBasis: 0,
    alignItems: 'flex-end',
  },
  colChange: {
    flex: 1.2,
    flexBasis: 0,
    minWidth: 88,
    alignItems: 'flex-end',
  },
  changeValue: {
    alignSelf: 'flex-end',
  },
  colVolume: {
    flex: 1.6,
    flexBasis: 0,
    alignItems: 'flex-end',
  },
  priceText: {
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  volumeText: {
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
});

export default MarketOverviewRow;
