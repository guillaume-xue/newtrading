// components/PercentageBadge.tsx
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

export type BadgeDirection = 'up' | 'down';

export interface PercentageBadgeProps {
  /**
   * Valeur numérique (ex: 0.43 ou -0.43) ou texte formaté (ex: "+0,43%")
   */
  value: number | string;
  /**
   * Forcer la direction ('up' | 'down') si non déductible automatiquement
   */
  direction?: BadgeDirection;
  /**
   * Nombre de décimales pour le formatage numérique (par défaut : 2)
   */
  decimals?: number;
  /**
   * Styles personnalisés pour le conteneur
   */
  style?: ViewStyle;
  /**
   * Styles personnalisés pour le texte
   */
  textStyle?: TextStyle;
}

export const PercentageBadge: React.FC<PercentageBadgeProps> = ({
  value,
  direction,
  decimals = 2,
  style,
  textStyle,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  // 1. Détermination de la direction (hausse / baisse)
  const isUp =
    direction !== undefined
      ? direction === 'up'
      : typeof value === 'number'
      ? value >= 0
      : !value.trim().startsWith('-');

  // 2. Formatage du libellé affiché
  const displayValue = (() => {
    if (typeof value === 'number') {
      const sign = isUp ? '+' : '';
      const formattedNumber = Math.abs(value).toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}${isUp ? '' : '-'}${formattedNumber}%`;
    }
    return value;
  })();

  // 3. Récupération des tokens de thème
  const backgroundColor = isUp
    ? theme['colors_badge_up-bg']
    : theme['colors_badge_down-bg'];

  const textColor = isUp
    ? theme['colors_badge_up-text']
    : theme['colors_badge_down-text'];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
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
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
  },
  text: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
