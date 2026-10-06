// components/table/WatchlistHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export interface WatchlistHeaderProps {
  style?: ViewStyle;
}

export const WatchlistHeader: React.FC<WatchlistHeaderProps> = ({ style }) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderBottomColor: theme['colors_divider_text'] ?? '#E5E7EB',
        },
        style,
      ]}
    >
      <Text style={[styles.headerText, styles.colSymbol, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
        Symbole
      </Text>
      <Text style={[styles.headerText, styles.colNumber, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
        Dernier
      </Text>
      <Text style={[styles.headerText, styles.colNumber, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
        Chg
      </Text>
      <Text style={[styles.headerText, styles.colNumber, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
        Chg %
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
  },
  headerText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  colSymbol: {
    flex: 1.2,
    textAlign: 'left',
  },
  colNumber: {
    flex: 1,
    textAlign: 'right',
  },
});
