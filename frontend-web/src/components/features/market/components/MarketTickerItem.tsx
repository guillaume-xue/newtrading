// components/MarketTickerItem.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, useColorScheme } from 'react-native';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export interface MarketTickerItemProps {
  /**
   * Nom ou symbole de l'actif (ex: "S&P 500")
   */
  name: string;
  /**
   * Prix actuel sous forme numérique ou texte (ex: 5349.10 ou "5 349,10")
   */
  price: number | string;
  /**
   * Variation en pourcentage (ex: -0.43 ou "-0,43 %")
   */
  changePercent: number | string;
  /**
   * Nombre de décimales pour le cours
   */
  priceDecimals?: number;
  /**
   * Style personnalisé pour la ligne
   */
  style?: ViewStyle;
  /**
   * Style personnalisé pour le libellé de l'actif
   */
  nameStyle?: TextStyle;
  /**
   * Style personnalisé pour le prix
   */
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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const formattedPrice =
    typeof price === 'number'
      ? price.toLocaleString('fr-FR', {
          minimumFractionDigits: priceDecimals,
          maximumFractionDigits: priceDecimals,
        })
      : price;

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.name,
          { color: theme['colors_text_primary'] },
          nameStyle,
        ]}
        numberOfLines={1}
      >
        {name}
      </Text>

      <Text
        style={[
          styles.price,
          { color: theme['colors_text_primary'] },
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
    gap: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
  },
  name: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  price: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
