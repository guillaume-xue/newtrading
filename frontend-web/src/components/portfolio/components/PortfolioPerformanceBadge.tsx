// components/PortfolioPerformanceBadge.tsx
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

import ChatArrowUp from '@/assets/icons/chat-arrow-up.svg';
import ChatArrowDown from '@/assets/icons/chat-arrow-down.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type PerformanceDirection = 'up' | 'down';

export interface PortfolioPerformanceBadgeProps {
  /**
   * Direction de la performance : 'up' (positif / vert) ou 'down' (négatif / rouge)
   */
  direction?: PerformanceDirection;
  /**
   * Texte complet à afficher (ex: "+18 420,50 $ (+14,81% YTD)")
   */
  label?: string;
  /**
   * Montant en devise (utilisé si `label` n'est pas fourni)
   */
  amount?: number | string;
  /**
   * Pourcentage de variation (ex: 14.81 ou -4.81)
   */
  percentage?: number | string;
  /**
   * Période (ex: 'YTD', '24h', '1M') - Par défaut 'YTD'
   */
  period?: string;
  /**
   * Symbole monétaire (par défaut '$')
   */
  currency?: string;
  /**
   * Remplacement optionnel de l'icône par un composant custom
   */
  customIcon?: React.ReactNode;
  /**
   * Styles personnalisés pour le conteneur
   */
  style?: ViewStyle;
  /**
   * Styles personnalisés pour le texte
   */
  textStyle?: TextStyle;
}

export const PortfolioPerformanceBadge: React.FC<PortfolioPerformanceBadgeProps> = ({
  direction,
  label,
  amount,
  percentage,
  period = 'YTD',
  currency = '$',
  customIcon,
  style,
  textStyle,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  // Détermination automatique de la direction si un pourcentage numérique est passé
  const resolvedDirection: PerformanceDirection =
    direction ??
    (typeof percentage === 'number'
      ? percentage >= 0
        ? 'up'
        : 'down'
      : typeof amount === 'number'
      ? amount >= 0
        ? 'up'
        : 'down'
      : 'up');

  const isUp = resolvedDirection === 'up';

  // Récupération des tokens de couleur selon la direction
  const badgeBg = isUp ? theme['colors_badge_up-bg'] : theme['colors_badge_down-bg'];
  const badgeBorder = isUp ? theme['colors_badge_up-border'] : theme['colors_badge_down-border'];
  const badgeText = isUp ? theme['colors_badge_up-text'] : theme['colors_badge_down-text'];

  // Construction du libellé si non fourni explicitement
  const formattedText =
    label ??
    (() => {
      const sign = isUp ? '+' : '';
      const formattedAmount =
        typeof amount === 'number'
          ? amount.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : amount ?? '0,00';

      const formattedPercentage =
        typeof percentage === 'number'
          ? percentage.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : percentage ?? '0,00';

      return `${sign}${formattedAmount} ${currency} (${sign}${formattedPercentage}% ${period})`;
    })();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {customIcon ? (
          customIcon
        ) : isUp ? (
          <Image src={ChatArrowUp} width={16} height={16} alt="Hausse" />
        ) : (
          <Image src={ChatArrowDown} width={16} height={16} alt="Baisse" />
        )}
      </View>

      <Text
        style={[
          styles.text,
          { color: badgeText },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {formattedText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: primitives['spacing & layout_border radius_radius-full'] ?? 9999,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    paddingVertical: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  iconContainer: {
    marginRight: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
