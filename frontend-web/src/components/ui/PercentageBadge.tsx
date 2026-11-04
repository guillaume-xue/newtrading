'use client';

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

export type BadgeDirection = 'up' | 'down';

export interface PercentageBadgeProps {
  value: number | string;
  direction?: BadgeDirection;
  decimals?: number;
  bordered?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PercentageBadge: React.FC<PercentageBadgeProps> = ({
  value,
  direction,
  decimals = 2,
  bordered = false,
  style,
  textStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const isUp = useMemo(() => {
    if (direction !== undefined) return direction === 'up';
    if (typeof value === 'number') return value >= 0;
    return !String(value).trim().startsWith('-');
  }, [direction, value]);

  const displayValue = useMemo(() => {
    if (typeof value === 'number') {
      const sign = isUp ? '+' : '';
      const formattedNumber = Math.abs(value).toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}${isUp ? '' : '-'}${formattedNumber} %`;
    }
    return String(value);
  }, [value, isUp, decimals]);

  const backgroundColor = isUp
    ? colors['colors_badge_up-bg']
    : colors['colors_badge_down-bg'];

  const textColor = isUp
    ? colors['colors_badge_up-text']
    : colors['colors_badge_down-text'];

  const borderColor = isUp
    ? colors['colors_badge_up-border']
    : colors['colors_badge_down-border'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor: bordered ? borderColor : 'transparent',
          borderWidth: bordered ? (primitives['border width_border-thin'] ?? 1) : 0,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
