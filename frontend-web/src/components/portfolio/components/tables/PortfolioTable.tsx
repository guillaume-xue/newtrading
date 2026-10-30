'use client';

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

export interface PortfolioTableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ children, style }) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const bgCard = colors['colors_bg_secondary'];
  const borderCard = colors['colors_divider_text'];
  const textHeader = colors['colors_text_primary'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgCard,
          borderColor: borderCard,
          borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
          borderWidth: primitives['border width_border-thin'] ?? 1,
        },
        style,
      ]}
    >
      {/* En-tête de colonnes */}
      <View
        style={[
          styles.headerRow,
          {
            borderBottomColor: borderCard,
            paddingVertical: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
            paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
            borderBottomWidth: primitives['border width_border-thin'] ?? 1,
          },
        ]}
      >
        <Text
          style={[
            styles.headerCell,
            {
              flex: 2.2,
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          ACTIF / TICKER
        </Text>
        <Text
          style={[
            styles.headerCell,
            {
              flex: 1.5,
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          PRIX MOYEN (PRU)
        </Text>
        <Text
          style={[
            styles.headerCell,
            {
              flex: 1.5,
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          COURS ACTUEL
        </Text>
        <Text
          style={[
            styles.headerCell,
            {
              flex: 1.8,
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          QUANTITÉ / VALORISATION
        </Text>
        <Text
          style={[
            styles.headerCell,
            {
              flex: 1.5,
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          P&L NON RÉALISÉ ($)
        </Text>
        <Text
          style={[
            styles.headerCell,
            {
              flex: 1.2,
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          P&L (%)
        </Text>
        <Text
          style={[
            styles.headerCell,
            {
              flex: 1,
              textAlign: 'right',
              color: textHeader,
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            },
          ]}
        >
          ACTION
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
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

export default PortfolioTable;
