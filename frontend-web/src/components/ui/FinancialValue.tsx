// components/FinancialValue.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import CaretUp from '@/assets/icons/caret-up.svg';
import CaretDown from '@/assets/icons/caret-down.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type FinancialDirection = 'up' | 'down';
export type FinancialValueSize = 'sm' | 'md' | 'lg';

export interface FinancialValueProps {
  /**
   * Valeur numérique ou texte formaté (ex: 3123, -123, 0.43, "+3 123,00 $")
   */
  value: number | string;
  /**
   * Type d'affichage : 'amount' (devise) ou 'percent' (pourcentage avec flèche triangle)
   */
  type?: 'amount' | 'percent';
  /**
   * Direction explicite ('up' | 'down') si non déduite de la valeur
   */
  direction?: FinancialDirection;
  /**
   * Afficher la flèche triangle (par défaut : true si type === 'percent')
   */
  showArrow?: boolean;
  /**
   * Devise si type === 'amount' (par défaut : '$')
   */
  currency?: string;
  /**
   * Nombre de décimales pour les valeurs numériques
   */
  decimals?: number;
  /**
   * Taille du texte
   */
  size?: FinancialValueSize;
  /**
   * Style personnalisé pour le conteneur
   */
  style?: ViewStyle;
  /**
   * Style personnalisé pour le texte
   */
  textStyle?: TextStyle;
}

export const FinancialValue: React.FC<FinancialValueProps> = ({
  value,
  type = 'amount',
  direction,
  showArrow,
  currency = '$',
  decimals = 2,
  size = 'md',
  style,
  textStyle,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  // 1. Résolution de la direction (hausse / baisse)
  const isUp =
    direction !== undefined
      ? direction === 'up'
      : typeof value === 'number'
      ? value >= 0
      : !String(value).trim().startsWith('-');

  // 2. Affichage de la flèche (par défaut pour les pourcentages)
  const displayArrow = showArrow !== undefined ? showArrow : type === 'percent';

  // 3. Formatage de la valeur affichée
  const displayValue = (() => {
    if (typeof value === 'number') {
      const sign = isUp ? '+' : '-';
      const formattedNumber = Math.abs(value).toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (type === 'percent') {
        return `${sign}${formattedNumber} %`;
      }
      return `${sign}${formattedNumber} ${currency}`;
    }
    return String(value);
  })();

  // 4. Couleur selon les tokens (vert trading pour up, rouge pour down)[span_1](start_span)[span_1](end_span)
  const color = isUp ? theme['colors_badge_up-text'] : theme['colors_badge_down-text'];

  return (
    <View style={[styles.container, style]}>
      {displayArrow && (
        <Image
          src={isUp ? CaretUp : CaretDown}
          width={primitives['typography_line height_line-height-20'] ?? 20}
          height={primitives['typography_line height_line-height-20'] ?? 20}
          alt=""
        />
      )}
      <Text
        style={[
          styles.text,
          styles[`text_${size}`],
          { color },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  arrow: {
    marginRight: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
    transform: [{ scaleY: 0.85 }], // Ajuste l'étirement vertical de la flèche
  },
  text: {
    fontWeight: '700',
  },

  // Tailles de texte
  text_sm: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
  },
  text_md: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
  },
  text_lg: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
  },

  // Tailles des flèches
  arrow_sm: {
    fontSize: 9,
  },
  arrow_md: {
    fontSize: 10,
  },
  arrow_lg: {
    fontSize: 12,
  },
});
