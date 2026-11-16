'use client';

// components/features/market/components/MarketTickerInfo.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Image from 'next/image';

import Bank from '@/assets/icons/bank.svg';
import { useAppTheme } from '@/theme/ThemeContext';

export type TickerInfoEmphasis = 'title' | 'subtitle';
export type TickerInfoSize = 'sm' | 'md';

export interface MarketTickerInfoProps {
  title: string;
  subtitle?: string;
  size?: TickerInfoSize;
  emphasis?: TickerInfoEmphasis;
  icon?: React.ReactNode;
  style?: ViewStyle;
  iconBoxStyle?: ViewStyle;
}

export const MarketTickerInfo: React.FC<MarketTickerInfoProps> = ({
  title,
  subtitle,
  size = 'md',
  emphasis = 'subtitle',
  icon,
  style,
  iconBoxStyle,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const isTitlePrimary = emphasis === 'title';

  const titleColor = isTitlePrimary || size === 'sm'
    ? colors['colors_text_primary']
    : colors['colors_text_secondary'];

  const subtitleColor = isTitlePrimary
    ? colors['colors_text_secondary']
    : colors['colors_text_primary'];

  const iconFilter = useMemo(() => {
    return isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
  }, [isDark]);

  if (size === 'sm') {
    return (
      <View
        style={[
          styles.containerSm,
          { gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8 },
          style,
        ]}
      >
        <View style={styles.iconWrapperSm}>
          {icon ?? (
            <Image
              src={Bank}
              width={16}
              height={16}
              alt=""
              style={{ filter: iconFilter }}
            />
          )}
        </View>
        <Text
          style={[
            styles.titleTextSm,
            {
              color: titleColor,
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconBox,
          {
            borderColor: colors['colors_button_outline-border'],
            backgroundColor: colors['colors_bg_secondary'],
            borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 10,
            borderWidth: primitives['border width_border-thin'] ?? 1,
            marginRight: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
          },
          iconBoxStyle,
        ]}
      >
        {icon ?? (
          <Image
            src={Bank}
            width={primitives['typography_line height_line-height-32'] ?? 32}
            height={primitives['typography_line height_line-height-32'] ?? 32}
            alt=""
            style={{ filter: iconFilter }}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.titleText,
            isTitlePrimary ? styles.fontEmphasis : styles.fontMuted,
            {
              color: titleColor,
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              !isTitlePrimary ? styles.fontEmphasis : styles.fontMuted,
              {
                color: subtitleColor,
                fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
              },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleText: {
    textTransform: 'uppercase',
  },
  subtitleText: {},
  fontEmphasis: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  fontMuted: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  containerSm: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconWrapperSm: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextSm: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});

export default MarketTickerInfo;
