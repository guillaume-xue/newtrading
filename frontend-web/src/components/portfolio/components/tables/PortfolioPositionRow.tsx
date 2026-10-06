// components/table/PortfolioPositionRow.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { PercentageBadge } from '@/components/ui/PercentageBadge';
import { Button } from '@/components/ui/Button';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const formattedAveragePrice =
    typeof averagePrice === 'number'
      ? `${averagePrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : averagePrice;

  const formattedCurrentPrice =
    typeof currentPrice === 'number'
      ? `${currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : currentPrice;

  const formattedValuation =
    typeof valuation === 'number'
      ? `${valuation.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`
      : valuation;

  const formattedQuantity =
    typeof quantity === 'number'
      ? `${quantity.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${quantityUnit}`
      : `${quantity} ${quantityUnit}`;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderBottomColor: theme['colors_divider_text'] ?? '#E5E7EB',
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
        <Text style={[styles.mainValueText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          {formattedAveragePrice}
        </Text>
      </View>

      {/* 3. Cours Actuel */}
      <View style={styles.colNumber}>
        <Text style={[styles.mainValueText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          {formattedCurrentPrice}
        </Text>
      </View>

      {/* 4. Quantité & Valorisation */}
      <View style={styles.colValuation}>
        <Text style={[styles.mainValueText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          {formattedValuation}
        </Text>
        <Text style={[styles.subValueText, { color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>
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
    paddingVertical: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
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
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subValueText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '500',
  },
});
