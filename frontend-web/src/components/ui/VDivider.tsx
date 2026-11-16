'use client';

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

export interface VDividerProps {
  label?: string;
  style?: ViewStyle;
}

export const VDivider: React.FC<VDividerProps> = ({ label, style }) => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const lineColor = colors['colors_divider_text'];

  return (
    <View
      style={[
        styles.separator,
        { backgroundColor: lineColor },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  separator: {
    width: 1.5,
    height: 20,
    flexShrink: 0,
  },
});
