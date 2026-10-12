// components/table/MarketOverviewTable.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export interface MarketOverviewTableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const MarketOverviewTable: React.FC<MarketOverviewTableProps> = ({ children, style }) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderColor: theme['colors_button_outline-border'] ?? '#D1D5DB',
        },
        style,
      ]}
    >
      {/* En-tête des colonnes */}
      <View
        style={[
          styles.headerRow,
          { borderBottomColor: theme['colors_divider_text'] ?? '#E5E7EB' },
        ]}
      >
        <Text style={[styles.headerCell, styles.assetColumn, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          Actif
        </Text>
        <Text style={[styles.headerCell, styles.chartColumn, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          Tendance 7j
        </Text>
        <Text style={[styles.headerCell, styles.priceColumn, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          Prix
        </Text>
        <Text style={[styles.headerCell, styles.changeColumn, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          24h %
        </Text>
        <Text style={[styles.headerCell, styles.volumeColumn, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
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
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
  },
  headerCell: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
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
