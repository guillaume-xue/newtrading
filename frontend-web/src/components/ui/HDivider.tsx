'use client';

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

export interface HDividerProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const HDivider: React.FC<HDividerProps> = React.memo(({ label, style }) => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const lineColor = colors['colors_divider_text'];
  const textColor = colors['colors_text_secondary'];

  return (
    <View style={[styles.container, style]} accessibilityRole="separator">
      <View style={[styles.line, { backgroundColor: lineColor }]} />

      {label ? (
        <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}

      <View style={[styles.line, { backgroundColor: lineColor }]} />
    </View>
  );
});
HDivider.displayName = 'HDivider';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HDivider;
