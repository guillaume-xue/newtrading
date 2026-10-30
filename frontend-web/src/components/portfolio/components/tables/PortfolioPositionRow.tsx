'use client';

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { PercentageBadge } from '@/components/ui/PercentageBadge';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme/ThemeContext';

export interface PortfolioPositionRowProps {
  countryOrCategory: string;
  name: string;
  icon?: React.ReactNode;
  averagePrice: number | string;
  currentPrice: number | string;
  valuation: number | string;
  quantity: number | string;
  quantityUnit?: string;
  unrealizedPnLAmount: number;
  unrealizedPnLPercent: number;
  onManagePress?: () => void;
  style?: ViewStyle;
}

export const PortfolioPositionRow: React.FC<PortfolioPositionRowProps> = ({
  countryOrCategory,
  name,
  icon,
  averagePrice,
  currentPrice,
  valuation,
  quantity,
  quantityUnit = 'Actions',
  unrealizedPnLAmount,
  unrealizedPnLPercent,
  onManagePress,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const formattedAveragePrice = useMemo(() => {
    return typeof averagePrice === 'number'
      ? `${averagePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : averagePrice;
  }, [averagePrice]);

  const formattedCurrentPrice = useMemo(() => {
    return typeof currentPrice === 'number'
      ? `${currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : currentPrice;
  }, [currentPrice]);

  const formattedValuation = useMemo(() => {
    return typeof valuation === 'number'
      ? `${valuation.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : valuation;
  }, [valuation]);

  const formattedQuantity = useMemo(() => {
    return typeof quantity === 'number'
      ? `${quantity.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${quantityUnit}`
      : `${quantity} ${quantityUnit}`;
  }, [quantity, quantityUnit]);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderBottomColor: colors['colors_divider_text'],
          paddingVertical: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
          paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
          borderBottomWidth: primitives['border width_border-thin'] ?? 1,
        },
        style,
      ]}
    >
      {/* 1. Actif / Ticker */}
      <View style={styles.colAsset}>
        <MarketTickerInfo
          title={countryOrCategory}
          subtitle={name}
          icon={icon}
          emphasis="title"
        />
      </View>

      {/* 2. Prix Moyen (PRU) */}
      <View style={styles.colNumber}>
        <Text
          style={[
            styles.mainValueText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
        >
          {formattedAveragePrice}
        </Text>
      </View>

      {/* 3. Cours Actuel */}
      <View style={styles.colNumber}>
        <Text
          style={[
            styles.mainValueText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
        >
          {formattedCurrentPrice}
        </Text>
      </View>

      {/* 4. Quantité & Valorisation */}
      <View style={styles.colValuation}>
        <Text
          style={[
            styles.mainValueText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
        >
          {formattedValuation}
        </Text>
        <Text
          style={[
            styles.subValueText,
            {
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
              lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
            },
          ]}
        >
          {formattedQuantity}
        </Text>
      </View>

      {/* 5. P&L Non Réalisé ($) */}
      <View style={styles.colPnL}>
        <FinancialValue
          value={unrealizedPnLAmount}
          type="amount"
          currency="$"
          size="md"
        />
      </View>

      {/* 6. P&L (%) */}
      <View style={styles.colBadge}>
        <PercentageBadge value={unrealizedPnLPercent} />
      </View>

      {/* 7. Action */}
      <View style={styles.colAction}>
        <Button
          label="Gérer"
          variant="secondary"
          shape="rounded"
          size="sm"
          onPress={onManagePress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
  },
  colAsset: {
    flex: 2.2,
    justifyContent: 'center',
  },
  colNumber: {
    flex: 1.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  colValuation: {
    flex: 1.8,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
  },
  colPnL: {
    flex: 1.5,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  colBadge: {
    flex: 1.2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  colAction: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  mainValueText: {
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
  subValueText: {
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
});

export default PortfolioPositionRow;
