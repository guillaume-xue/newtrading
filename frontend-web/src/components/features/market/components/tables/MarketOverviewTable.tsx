'use client';

// components/table/MarketOverviewTable.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

export interface MarketOverviewTableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const MarketOverviewTable: React.FC<MarketOverviewTableProps> = ({ children, style }) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor: colors['colors_button_outline-border'],
          borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
          borderWidth: primitives['border width_border-thin'] ?? 1,
        },
        style,
      ]}
    >
      {/* En-tête des colonnes */}
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: colors['colors_divider_text'],
            borderBottomWidth: primitives['border width_border-thin'] ?? 1,
            paddingVertical: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
            paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
          },
        ]}
      >
        <Text
          style={[
            styles.headerCell,
            styles.assetColumn,
            {
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          Actif
        </Text>
        <Text
          style={[
            styles.headerCell,
            styles.chartColumn,
            {
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          Tendance 7j
        </Text>
        <Text
          style={[
            styles.headerCell,
            styles.priceColumn,
            {
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          Prix
        </Text>
        <Text
          style={[
            styles.headerCell,
            styles.changeColumn,
            {
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          24h %
        </Text>
        <Text
          style={[
            styles.headerCell,
            styles.volumeColumn,
            {
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          Volume 24h
        </Text>
      </View>

      {/* Lignes du tableau */}
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCell: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  assetColumn: {
    flex: 2.4,
    flexBasis: 0,
  },
  chartColumn: {
    flex: 2,
    flexBasis: 0,
    minWidth: 140,
  },
  priceColumn: {
    flex: 1.4,
    flexBasis: 0,
    textAlign: 'right',
  },
  changeColumn: {
    flex: 1.2,
    flexBasis: 0,
    minWidth: 88,
    textAlign: 'right',
  },
  volumeColumn: {
    flex: 1.6,
    flexBasis: 0,
    textAlign: 'right',
  },
});

export default MarketOverviewTable;
