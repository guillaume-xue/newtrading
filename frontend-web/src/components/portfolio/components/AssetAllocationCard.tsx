'use client';

// components/portfolio/components/AssetAllocationCard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

export type AssetCategoryVariant = 'crypto' | 'action' | 'etf';

export interface AssetAllocationCardProps {
  variant?: AssetCategoryVariant;
  label?: string;
  percentage: number | string;
  amount: number | string;
  currency?: string;
  amountDecimals?: number;
  percentDecimals?: number;
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
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  // Couleurs thématiques selon la catégorie d'actif
  const palette = useMemo(() => {
    switch (variant) {
      case 'action':
        return {
          primary: colors['colors_badge_primary-action-bg'],
          secondary: colors['colors_badge_secondary-action-bg'],
        };
      case 'etf':
        return {
          primary: colors['colors_badge_primary-etf-bg'],
          secondary: colors['colors_badge_secondary-etf-bg'],
        };
      case 'crypto':
      default:
        return {
          primary: colors['colors_badge_primary-crypto-bg'],
          secondary: colors['colors_badge_secondary-crypto-bg'],
        };
    }
  }, [variant, colors]);

  const numericPercentage = useMemo(() => {
    return typeof percentage === 'number'
      ? percentage
      : parseFloat(String(percentage).replace(',', '.'));
  }, [percentage]);

  const clampedPercentage = useMemo(() => {
    return Math.min(Math.max(isNaN(numericPercentage) ? 0 : numericPercentage, 0), 100);
  }, [numericPercentage]);

  const formattedPercentage = useMemo(() => {
    return typeof percentage === 'number'
      ? `${percentage.toLocaleString('fr-FR', {
          minimumFractionDigits: percentDecimals,
          maximumFractionDigits: percentDecimals,
        })}%`
      : percentage;
  }, [percentage, percentDecimals]);

  const formattedAmount = useMemo(() => {
    return typeof amount === 'number'
      ? `${amount.toLocaleString('fr-FR', {
          minimumFractionDigits: amountDecimals,
          maximumFractionDigits: amountDecimals,
        })}${currency}`
      : amount;
  }, [amount, amountDecimals, currency]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor: colors['colors_button_outline-border'],
          borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
          borderWidth: primitives['border width_border-thin'] ?? 1,
          padding: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
          gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
        },
        style,
      ]}
    >
      {/* Ligne 1 : Puce + Libellé à gauche, Pourcentage à droite */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.categoryInfo,
            { gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8 },
          ]}
        >
          <View style={[styles.bulletDot, { backgroundColor: palette.primary }]} />
          <Text
            style={[
              styles.labelText,
              {
                color: colors['colors_text_primary'],
                fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>

        <Text
          style={[
            styles.percentText,
            {
              color: palette.primary,
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
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
          {
            color: colors['colors_text_primary'],
            fontSize: primitives['typography_font size_font-size-16'] ?? 16,
            lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
          },
        ]}
        numberOfLines={1}
      >
        {formattedAmount}
      </Text>

      {/* Ligne 3 : Barre de progression horizontale */}
      <View
        style={[
          styles.progressBarBackground,
          {
            backgroundColor: palette.secondary,
            marginTop: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
          },
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  labelText: {
    fontWeight: '600',
  },
  percentText: {
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  amountText: {
    fontWeight: '800',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 9999,
  },
});

export default AssetAllocationCard;
