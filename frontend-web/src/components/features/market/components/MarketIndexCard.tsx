'use client';

// components/features/market/components/MarketIndexCard.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp, // <-- Ajout de StyleProp
  TouchableOpacity,
} from 'react-native';

import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { PercentageBadge } from '@/components/ui/PercentageBadge';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { useAppTheme } from '@/theme/ThemeContext';

export type CardType = 'index' | 'stock' | 'crypto';

export interface MarketIndexCardProps {
  symbol?: string;
  countryOrCategory: string;
  indexName: string;
  points: number | string;
  pointsUnit?: string;
  equivalentAmount: number | string;
  changePercent: number | string;
  style?: StyleProp<ViewStyle>; // <-- Corrigé ici
  cardType?: CardType;
  onPress?: () => void;
}

export const MarketIndexCard: React.FC<MarketIndexCardProps> = ({
  countryOrCategory,
  symbol,
  indexName,
  points,
  pointsUnit = 'pts',
  equivalentAmount,
  changePercent,
  style,
  cardType = 'index',
  onPress,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const numericChange = useMemo(() => {
    return typeof changePercent === 'number'
      ? changePercent
      : parseFloat(String(changePercent).replace(',', '.').replace('%', '').trim());
  }, [changePercent]);

  const isPositive = !isNaN(numericChange) ? numericChange >= 0 : true;

  // Couleurs dérivées dynamiquement des tokens du thème
  const chartLineColor = isPositive
    ? colors['colors_button_buy']
    : colors['colors_button_sell'];

  const chartTopColor = isPositive
    ? 'rgba(5, 150, 105, 0.25)'
    : 'rgba(220, 38, 38, 0.25)';

  const chartBottomColor = isPositive
    ? 'rgba(5, 150, 105, 0.0)'
    : 'rgba(220, 38, 38, 0.0)';

  const formattedPoints = useMemo(() => {
    return typeof points === 'number'
      ? points.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : points;
  }, [points]);

  const formattedAmount = useMemo(() => {
    return typeof equivalentAmount === 'number'
      ? `${equivalentAmount.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}$`
      : equivalentAmount;
  }, [equivalentAmount]);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor: colors['colors_button_outline-border'],
          borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
          borderWidth: primitives['border width_border-thin'] ?? 1,
          padding: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
          gap: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
        },
        style,
      ]}
    >
      {/* 1. Rangée supérieure : Infos indice, Montant/Variation, et Badge % */}
      <View style={styles.topRow}>
        <MarketTickerInfo
          title={countryOrCategory}
          subtitle={indexName}
          emphasis="subtitle"
        />

        {cardType === 'crypto' && (
          <View
            style={[
              styles.amountColumn,
              { gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4 },
            ]}
          >
            <Text
              style={[
                styles.amountText,
                {
                  color: colors['colors_text_primary'],
                  fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                  lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
                },
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

        {cardType !== 'crypto' && <PercentageBadge value={changePercent} />}
      </View>

      {/* 2. Affichage des points */}
      {cardType !== 'crypto' && (
        <View
          style={[
            styles.pointsRow,
            { gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4 },
          ]}
        >
          <Text
            style={[
              styles.pointsValue,
              {
                color: colors['colors_text_primary'],
                fontSize: primitives['typography_font size_font-size-24'] ?? 24,
                lineHeight: primitives['typography_line height_line-height-32'] ?? 32,
              },
            ]}
          >
            {formattedPoints}
          </Text>
          <Text
            style={[
              styles.pointsUnit,
              {
                color: colors['colors_text_secondary'],
                fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
              },
            ]}
          >
            {pointsUnit}
          </Text>
        </View>
      )}

      {/* 3. Mini-graphique (Sparkline) */}
      {cardType === 'index' && (
        <View
          style={[
            styles.chartWrapper,
            {
              marginTop: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
              borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
            },
          ]}
        >
          <TradingChart
            symbol={symbol ?? indexName}
            themeMode={isDark ? 'dark' : 'light'}
            chartType="area"
            activeTool="crosshair"
            disableZoom
            sparkline
            selectedRange="1D"
            lineColor={chartLineColor}
            topColor={chartTopColor}
            bottomColor={chartBottomColor}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 480,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountColumn: {
    alignItems: 'flex-start',
  },
  amountText: {
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pointsValue: {
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  pointsUnit: {
    fontWeight: '500',
  },
  chartWrapper: {
    width: '100%',
    height: 128,
    overflow: 'hidden',
  },
});

export default MarketIndexCard;
