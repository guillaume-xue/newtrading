'use client';

// components/features/market/components/MarketTickerItem.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { useAppTheme } from '@/theme/ThemeContext';

export interface MarketTickerItemProps {
  name: string;
  price: number | string;
  changePercent: number | string;
  priceDecimals?: number;
  style?: ViewStyle;
  nameStyle?: TextStyle;
  priceStyle?: TextStyle;
}

export const MarketTickerItem: React.FC<MarketTickerItemProps> = ({
  name,
  price,
  changePercent,
  priceDecimals = 2,
  style,
  nameStyle,
  priceStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const formattedPrice = useMemo(() => {
    return typeof price === 'number'
      ? price.toLocaleString('fr-FR', {
          minimumFractionDigits: priceDecimals,
          maximumFractionDigits: priceDecimals,
        })
      : price;
  }, [price, priceDecimals]);

  return (
    <View
      style={[
        styles.container,
        {
          gap: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.name,
          {
            color: colors['colors_text_primary'],
            fontSize: primitives['typography_font size_font-size-14'] ?? 14,
            lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
          },
          nameStyle,
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text
        style={[
          styles.price,
          {
            color: colors['colors_text_primary'],
            fontSize: primitives['typography_font size_font-size-14'] ?? 14,
            lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
          },
          priceStyle,
        ]}
        numberOfLines={1}
      >
        {formattedPrice}
      </Text>

      <FinancialValue
        value={changePercent}
        type="percent"
        showArrow={true}
        size="md"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  price: {
    fontWeight: '600',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
});

export default MarketTickerItem;
