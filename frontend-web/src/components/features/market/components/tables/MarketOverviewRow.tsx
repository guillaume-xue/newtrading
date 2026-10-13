// components/table/MarketOverviewRow.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const formattedPrice =
    typeof price === 'number'
      ? `${price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : price;

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
          themeMode={scheme === 'dark' ? 'dark' : 'light'}
          chartType="area"
          activeTool="crosshair"
          disableZoom
          showPositions={false}
        />
      </View>

      {/* 3. Prix */}
      <View style={styles.colPrice}>
        <Text style={[styles.priceText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
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
        <Text style={[styles.volumeText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
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
    paddingVertical: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
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
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  volumeText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
