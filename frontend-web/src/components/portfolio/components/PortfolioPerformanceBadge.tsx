'use client';

// components/portfolio/components/PortfolioPerformanceBadge.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Image from 'next/image';

import ChatArrowUp from '@/assets/icons/chat-arrow-up.svg';
import ChatArrowDown from '@/assets/icons/chat-arrow-down.svg';
import { useAppTheme } from '@/theme/ThemeContext';

export type PerformanceDirection = 'up' | 'down';

export interface PortfolioPerformanceBadgeProps {
  direction?: PerformanceDirection;
  label?: string;
  amount?: number | string;
  percentage?: number | string;
  period?: string;
  currency?: string;
  customIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PortfolioPerformanceBadge: React.FC<PortfolioPerformanceBadgeProps> = ({
  direction,
  label,
  amount,
  percentage,
  period = 'YTD',
  currency = '$',
  customIcon,
  style,
  textStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const resolvedDirection: PerformanceDirection = useMemo(() => {
    if (direction !== undefined) return direction;
    if (typeof percentage === 'number') return percentage >= 0 ? 'up' : 'down';
    if (typeof amount === 'number') return amount >= 0 ? 'up' : 'down';
    return 'up';
  }, [direction, percentage, amount]);

  const isUp = resolvedDirection === 'up';

  const badgeBg = isUp ? colors['colors_badge_up-bg'] : colors['colors_badge_down-bg'];
  const badgeBorder = isUp ? colors['colors_badge_up-border'] : colors['colors_badge_down-border'];
  const badgeText = isUp ? colors['colors_badge_up-text'] : colors['colors_badge_down-text'];

  const formattedText = useMemo(() => {
    if (label) return label;

    const sign = isUp ? '+' : '';
    const formattedAmount =
      typeof amount === 'number'
        ? amount.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : amount ?? '0,00';

    const formattedPercentage =
      typeof percentage === 'number'
        ? percentage.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : percentage ?? '0,00';

    return `${sign}${formattedAmount} ${currency} (${sign}${formattedPercentage}% ${period})`;
  }, [label, isUp, amount, currency, percentage, period]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
          borderRadius: primitives['spacing & layout_border radius_radius-full'] ?? 9999,
          borderWidth: primitives['border width_border-thin'] ?? 1,
          paddingVertical: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
          paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { marginRight: primitives['spacing & layout_padding & margin_space-2'] ?? 8 },
        ]}
      >
        {customIcon ? (
          customIcon
        ) : isUp ? (
          <Image src={ChatArrowUp} width={16} height={16} alt="Hausse" />
        ) : (
          <Image src={ChatArrowDown} width={16} height={16} alt="Baisse" />
        )}
      </View>

      <Text
        style={[
          styles.text,
          {
            color: badgeText,
            fontSize: primitives['typography_font size_font-size-14'] ?? 14,
            lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {formattedText}
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
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'],
  },
});

export default PortfolioPerformanceBadge;
