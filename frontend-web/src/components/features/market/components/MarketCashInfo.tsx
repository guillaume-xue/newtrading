'use client';

// components/features/market/components/MarketCashInfo.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

export interface MarketCashInfoProps {
  /**
   * Libellé supérieur (ex: "LIQUIDITÉS")
   */
  label: string;
  /**
   * Montant sous forme numérique ou texte (ex: 100000 ou "100 000,00 $")
   */
  amount: number | string;
  /**
   * Devise si amount est un nombre (par défaut: "$")
   */
  currency?: string;
  /**
   * Nombre de décimales si amount est un nombre (par défaut: 2)
   */
  decimals?: number;
  /**
   * Style personnalisé pour le conteneur
   */
  style?: ViewStyle;
  /**
   * Style personnalisé pour le label
   */
  labelStyle?: TextStyle;
  /**
   * Style personnalisé pour le montant
   */
  amountStyle?: TextStyle;
}

export const MarketCashInfo: React.FC<MarketCashInfoProps> = ({
  label,
  amount,
  currency = '$',
  decimals = 2,
  style,
  labelStyle,
  amountStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const formattedAmount = useMemo(() => {
    if (typeof amount === 'number') {
      const formattedNumber = amount.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${formattedNumber} ${currency}`;
    }
    return amount;
  }, [amount, decimals, currency]);

  return (
    <View
      style={[
        styles.container,
        { gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4 },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: colors['colors_text_secondary'],
            fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
          },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.amount,
          {
            color: colors['colors_text_primary'],
            fontSize: primitives['typography_font size_font-size-18'] ?? 18,
            lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
          },
          amountStyle,
        ]}
        numberOfLines={1}
      >
        {formattedAmount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  amount: {
    fontWeight: '800',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
});

export default MarketCashInfo;
