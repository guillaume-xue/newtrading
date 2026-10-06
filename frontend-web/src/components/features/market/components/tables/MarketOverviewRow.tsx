// components/table/MarketOverviewRow.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import Image, { StaticImageData } from 'next/image';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

import CharUpSource from '@/assets/icons/char-up.png';

export interface MarketOverviewRowProps {
  countryOrCategory: string;
  name: string;
  price: number | string;
  changePercent: number;
  volume24h: string;
  style?: ViewStyle;
}

export const MarketOverviewRow: React.FC<MarketOverviewRowProps> = ({
  countryOrCategory,
  name,
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
        {CharUpSource ? (
          <Image
            src={CharUpSource}
            width={64}
            height={28}
            alt="Tendance 7j"
            style={{ objectFit: 'contain' }}
          />
        ) : null}
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
    minHeight: 64,
  },
  colAsset: {
    flex: 2.5,
  },
  colTrendChart: {
    flex: 1.8,
    alignItems: 'flex-start',
  },
  colPrice: {
    flex: 1.5,
  },
  colChange: {
    flex: 1.5,
  },
  colVolume: {
    flex: 1.5,
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
