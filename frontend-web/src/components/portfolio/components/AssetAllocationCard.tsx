// components/AssetAllocationCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type AssetCategoryVariant = 'crypto' | 'action' | 'etf';

export interface AssetAllocationCardProps {
  /**
   * Catégorie d'actif : 'crypto' (Orange), 'action' (Bleu) ou 'etf' (Vert)
   */
  variant?: AssetCategoryVariant;
  /**
   * Nom de la catégorie (ex: "Crypto", "Actions", "ETF")
   */
  label?: string;
  /**
   * Pourcentage alloué (ex: 60.0 ou "60,0%")
   */
  percentage: number | string;
  /**
   * Montant alloué sous forme numérique ou texte (ex: 85710 ou "85 710,00$")
   */
  amount: number | string;
  /**
   * Devise monétaire (par défaut: "$")
   */
  currency?: string;
  /**
   * Nombre de décimales pour les valeurs numériques (par défaut: 2 pour le montant, 1 pour le %)
   */
  amountDecimals?: number;
  percentDecimals?: number;
  /**
   * Style personnalisé pour le conteneur
   */
  style?: ViewStyle;
}

export const AssetAllocationCard: React.FC<AssetAllocationCardProps> = ({
  variant = 'crypto',
  label = 'Crypto',
  percentage,
  amount,
  currency = '$',
  amountDecimals = 2,
  percentDecimals = 1,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  // 1. Couleurs thématiques selon la catégorie d'actif
  const getThemePalette = () => {
    switch (variant) {
      case 'action':
        return {
          primary: theme['colors_badge_primary-action-bg'],
          secondary: theme['colors_badge_secondary-action-bg'],
        };
      case 'etf':
        return {
          primary: theme['colors_badge_primary-etf-bg'],
          secondary: theme['colors_badge_secondary-etf-bg'],
        };
      case 'crypto':
      default:
        return {
          primary: theme['colors_badge_primary-crypto-bg'],
          secondary: theme['colors_badge_secondary-crypto-bg'],
        };
    }
  };

  const palette = getThemePalette();

  // 2. Formatage des valeurs
  const numericPercentage = typeof percentage === 'number' ? percentage : parseFloat(String(percentage).replace(',', '.'));
  const clampedPercentage = Math.min(Math.max(isNaN(numericPercentage) ? 0 : numericPercentage, 0), 100);

  const formattedPercentage =
    typeof percentage === 'number'
      ? `${percentage.toLocaleString('fr-FR', {
          minimumFractionDigits: percentDecimals,
          maximumFractionDigits: percentDecimals,
        })}%`
      : percentage;

  const formattedAmount =
    typeof amount === 'number'
      ? `${amount.toLocaleString('fr-FR', {
          minimumFractionDigits: amountDecimals,
          maximumFractionDigits: amountDecimals,
        })}${currency}`
      : amount;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme['colors_bg_secondary'],
          borderColor: theme['colors_button_outline-border'],
        },
        style,
      ]}
    >
      {/* Ligne 1 : Puce + Libellé à gauche, Pourcentage à droite */}
      <View style={styles.topRow}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.bulletDot,
              { backgroundColor: palette.primary },
            ]}
          />
          <Text
            style={[
              styles.labelText,
              { color: theme['colors_text_primary'] },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>

        <Text
          style={[
            styles.percentText,
            { color: palette.primary },
          ]}
          numberOfLines={1}
        >
          {formattedPercentage}
        </Text>
      </View>

      {/* Ligne 2 : Montant valorisé */}
      <Text
        style={[
          styles.amountText,
          { color: theme['colors_text_primary'] },
        ]}
        numberOfLines={1}
      >
        {formattedAmount}
      </Text>

      {/* Ligne 3 : Barre de progression horizontale */}
      <View
        style={[
          styles.progressBarBackground,
          { backgroundColor: palette.secondary },
        ]}
      >
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${clampedPercentage}%`,
              backgroundColor: palette.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    padding: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  bulletDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  labelText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '600',
  },
  percentText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '600',
  },
  amountText: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    borderRadius: primitives['spacing & layout_border radius_radius-full'] ?? 9999,
    overflow: 'hidden',
    marginTop: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: primitives['spacing & layout_border radius_radius-full'] ?? 9999,
  },
});
