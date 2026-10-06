// components/MarketCashInfo.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const formattedAmount = (() => {
    if (typeof amount === 'number') {
      const formattedNumber = amount.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${formattedNumber} ${currency}`;
    }
    return amount;
  })();

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.label,
          { color: theme['colors_text_primary'] },
          labelStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.amount,
          { color: theme['colors_text_primary'] },
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
    gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  label: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: -0.2,
  },
  amount: {
    fontSize: primitives['typography_font size_font-size-18'] ?? 18,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});
