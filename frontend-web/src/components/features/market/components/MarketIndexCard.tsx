// components/MarketIndexCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Image, { StaticImageData } from 'next/image';

import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { PercentageBadge } from '@/components/ui/PercentageBadge';

import CharUpSource from '@/assets/icons/char-up.png';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type CardType = 'index' | 'stock' | 'crypto';

export interface MarketIndexCardProps {
  /**
   * Catégorie / Pays supérieur (ex: "ALLEMAGNE")[span_1](start_span)[span_1](end_span)
   */
  countryOrCategory: string;
  /**
   * Nom de l'indice (ex: "DAX 40")[span_2](start_span)[span_2](end_span)
   */
  indexName: string;
  /**
   * Valeur principale en points (ex: 18321.12 ou "18 321,12")[span_4](start_span)[span_4](end_span)
   */
  points: number | string;
  /**
   * Unité affichée à côté des points (par défaut: "pts")[span_5](start_span)[span_5](end_span)
   */
  pointsUnit?: string;
  /**
   * Montant équivalent en devise (ex: "2 283,10$")[span_6](start_span)[span_6](end_span)
   */
  equivalentAmount: number | string;
  /**
   * Variation en pourcentage (ex: 0.43 ou "+0,43 %")[span_7](start_span)[span_7](end_span)
   */
  changePercent: number | string;
  /**
   * Source d'image personnalisée pour le mini-graphique (par défaut: char-up.png)
   */
  chartImageSource?: StaticImageData | string;
  /**
   * Style personnalisé pour la carte
   */
  style?: ViewStyle;
  cardType?: CardType;
}

export const MarketIndexCard: React.FC<MarketIndexCardProps> = ({
  countryOrCategory,
  indexName,
  points,
  pointsUnit = 'pts',
  equivalentAmount,
  changePercent,
  chartImageSource = CharUpSource,
  style,
  cardType = 'index',
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const formattedPoints =
    typeof points === 'number'
      ? points.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : points;

  const formattedAmount =
    typeof equivalentAmount === 'number'
      ? `${equivalentAmount.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}$`
      : equivalentAmount;

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
      {/* 1. Rangée supérieure : Infos indice, Montant/Variation, et Badge % */}
      <View style={styles.topRow}>
        {/* Identité de l'indice */}
        <MarketTickerInfo
          title={countryOrCategory}
          subtitle={indexName}
          emphasis="subtitle"
        />

        {/* Montant + Variation */}
        {cardType === 'crypto' && (
          <View style={styles.amountColumn}>
            <Text
              style={[
                styles.amountText,
                { color: theme['colors_text_primary'] },
              ]}
              numberOfLines={1}
            >
              {formattedAmount}
            </Text>
            <FinancialValue
              value={changePercent}
              type="percent"
              showArrow={false}
              size="md"
            />
          </View>
        )}
        {/* Badge de pourcentage */}
        {cardType !== 'crypto' && <PercentageBadge value={changePercent} />}
      </View>

      {/* 2. Affichage des points */}
      {cardType !== 'crypto' && (
        <View style={styles.pointsRow}>
          <Text
            style={[
              styles.pointsValue,
              { color: theme['colors_text_primary'] },
            ]}
          >
            {formattedPoints}
          </Text>
          <Text
            style={[
              styles.pointsUnit,
              { color: theme['colors_text_secondary'] },
            ]}
          >
            {pointsUnit}
          </Text>
        </View>
      )}

      {/* 3. Mini-graphique (Sparkline) */}
      {cardType === 'index' && (
        <View style={styles.chartWrapper}>

            <Image
              src={chartImageSource}
              alt={`Graphique ${indexName}`}
              width={120}
              height={65}
            />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    padding: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
    gap: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountColumn: {
    alignItems: 'flex-start',
    gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  amountText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  pointsValue: {
    fontSize: primitives['typography_font size_font-size-24'] ?? 24,
    lineHeight: primitives['typography_line height_line-height-32'] ?? 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pointsUnit: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '500',
  },
  chartWrapper: {
    width: 120,
    height: 65,
    marginTop: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  chartImage: {
    objectFit: 'contain',
  },
});
