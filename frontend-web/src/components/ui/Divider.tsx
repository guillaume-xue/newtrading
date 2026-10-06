// src/components/Divider.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

export interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ label, style }) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const lineColor = theme['colors_divider_text'] ?? '#E0E3EB';
  const textColor = theme['colors_divider_text'] ?? '#8C93A3';

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.line, { backgroundColor: lineColor }]} />

      {label ? (
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  line: {
    flex: 1,
    height: primitives['border width_border-thin'] ?? 1,
  },
  label: {
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '400',
    textAlign: 'center',
  },
});
