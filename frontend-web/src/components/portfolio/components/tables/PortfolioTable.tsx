// components/table/PortfolioTable.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export interface PortfolioTableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ children, style }) => {
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
      {/* En-tête de colonnes */}
      <View
        style={[
          styles.headerRow,
          { borderBottomColor: theme['colors_divider_text'] ?? '#E5E7EB' },
        ]}
      >
        <Text style={[styles.headerCell, { flex: 2.2, color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          ACTIF / TICKER
        </Text>
        <Text style={[styles.headerCell, { flex: 1.5, color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          PRIX MOYEN (PRU)
        </Text>
        <Text style={[styles.headerCell, { flex: 1.5, color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          COURS ACTUEL
        </Text>
        <Text style={[styles.headerCell, { flex: 1.8, color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          QUANTITÉ / VALORISATION
        </Text>
        <Text style={[styles.headerCell, { flex: 1.5, color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          P&L NON RÉALISÉ ($)
        </Text>
        <Text style={[styles.headerCell, { flex: 1.2, color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
          P&L (%)
        </Text>
        <Text style={[styles.headerCell, { flex: 1, textAlign: 'right', color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
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
    borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
  },
  headerCell: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
