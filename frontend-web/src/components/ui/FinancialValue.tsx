'use client';

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Image from 'next/image';

import CaretUp from '@/assets/icons/caret-up.svg';
import CaretDown from '@/assets/icons/caret-down.svg';
import { useAppTheme } from '@/theme/ThemeContext';

export type FinancialDirection = 'up' | 'down';
export type FinancialValueSize = 'sm' | 'md' | 'lg';

export interface FinancialValueProps {
  value: number | string;
  type?: 'amount' | 'percent';
  direction?: FinancialDirection;
  showArrow?: boolean;
  currency?: string;
  decimals?: number;
  size?: FinancialValueSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const FinancialValue: React.FC<FinancialValueProps> = ({
  value,
  type = 'amount',
  direction,
  showArrow,
  currency = '$',
  decimals = 2,
  size = 'md',
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

  const displayArrow = showArrow !== undefined ? showArrow : type === 'percent';

  const displayValue = useMemo(() => {
    if (typeof value === 'number') {
      const sign = isUp ? '+' : '-';
      const formattedNumber = Math.abs(value).toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (type === 'percent') {
        return `${sign}${formattedNumber} %`;
      }
      return `${sign}${formattedNumber} ${currency}`;
    }
    return String(value);
  }, [value, isUp, decimals, type, currency]);

  const color = isUp ? colors['colors_badge_up'] : colors['colors_badge_down'];
  const arrowSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <View style={[styles.container, style]}>
      {displayArrow && (
        <View style={styles.arrowWrapper}>
          <Image
            src={isUp ? CaretUp : CaretDown}
            width={arrowSize}
            height={arrowSize}
            alt=""
          />
        </View>
      )}
      <Text
        style={[
          styles.text,
          styles[`text_${size}`],
          { color },
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  arrowWrapper: {
    marginRight: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  text_sm: {
    fontSize: 12,
    lineHeight: 16,
  },
  text_md: {
    fontSize: 14,
    lineHeight: 20,
  },
  text_lg: {
    fontSize: 16,
    lineHeight: 24,
  },
});
