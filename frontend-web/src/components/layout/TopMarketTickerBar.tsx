'use client';

// components/layout/TopMarketTickerBar.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';

import { MarketTickerItem, MarketTickerItemProps } from '@/components/features/market/components/MarketTickerItem';
import { useAppTheme } from '@/theme/ThemeContext';

export interface TickerData extends MarketTickerItemProps {
  id: string | number;
}

export interface TopMarketTickerBarProps {
  isMarketOpen?: boolean;
  statusLabel?: string;
  timezone?: string;
  items?: TickerData[];
  speed?: number;
  style?: ViewStyle;
}

const DEFAULT_TICKERS: TickerData[] = [
  { id: '1', name: 'S&P 500', price: 5349.10, changePercent: -0.43 },
  { id: '2', name: 'NASDAQ', price: 18240.20, changePercent: 0.85 },
  { id: '3', name: 'DAX 40', price: 18321.12, changePercent: 0.43 },
  { id: '4', name: 'CAC 40', price: 7632.40, changePercent: -0.12 },
  { id: '5', name: 'DOW JONES', price: 39120.00, changePercent: -0.28 },
  { id: '6', name: 'FTSE 100', price: 8245.50, changePercent: 0.15 },
];

export const TopMarketTickerBar: React.FC<TopMarketTickerBarProps> = ({
  isMarketOpen = true,
  statusLabel = 'Marchés ouverts',
  timezone = 'UTC+2',
  items = DEFAULT_TICKERS,
  speed = 45,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [contentWidth, setContentWidth] = useState(0);
  const [animatedMarquee] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // 1. Boucle de clignotement du point d'état
  useEffect(() => {
    if (!isMarketOpen) {
      pulseAnim.setValue(1);
      return;
    }

    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    );

    blinkAnimation.start();

    return () => blinkAnimation.stop();
  }, [isMarketOpen, pulseAnim]);

  // 2. Défilement horizontal des indices
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== contentWidth) {
      setContentWidth(width);
    }
  };

  useEffect(() => {
    if (contentWidth === 0) return;

    animatedMarquee.setValue(0);
    const duration = (contentWidth / speed) * 1000;

    const loopAnimation = Animated.loop(
      Animated.timing(animatedMarquee, {
        toValue: -contentWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    loopAnimation.start();

    return () => loopAnimation.stop();
  }, [contentWidth, speed, animatedMarquee]);

  const dotColor = isMarketOpen
    ? colors['colors_button_buy']
    : colors['colors_button_sell'];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderBottomColor: colors['colors_divider_text'],
          borderBottomWidth: primitives['border width_border-thin'] ?? 1,
        },
        style,
      ]}
    >
      {/* 1. Bloc fixe avec voyant clignotant */}
      <View
        style={[
          styles.statusSection,
          {
            backgroundColor: colors['colors_bg_secondary'],
            paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
            gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.statusDot,
            {
              backgroundColor: dotColor,
              opacity: pulseAnim,
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0.25, 1],
                    outputRange: [0.85, 1],
                  }),
                },
              ],
            },
          ]}
        />

        <Text
          style={[
            styles.statusText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
              lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
            },
          ]}
          numberOfLines={1}
        >
          {statusLabel}
        </Text>

        <View
          style={[
            styles.timezoneBadge,
            {
              backgroundColor: colors['colors_bg_primary'],
              borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
            },
          ]}
        >
          <Text
            style={[
              styles.timezoneText,
              {
                color: colors['colors_text_primary'],
                fontSize: primitives['typography_font size_font-size-10'] ?? 10,
              },
            ]}
          >
            {timezone}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors['colors_divider_text'],
              marginLeft: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
            },
          ]}
        />
      </View>

      {/* 2. Flux défilant */}
      <View style={styles.marqueeViewport}>
        <Animated.View
          style={[
            styles.tickerTrack,
            {
              transform: [{ translateX: animatedMarquee }],
            },
          ]}
        >
          <View
            style={[
              styles.tickerGroup,
              {
                gap: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
                paddingRight: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
              },
            ]}
            onLayout={handleLayout}
          >
            {items.map((ticker) => (
              <MarketTickerItem
                key={`a-${ticker.id}`}
                name={ticker.name}
                price={ticker.price}
                changePercent={ticker.changePercent}
                priceDecimals={ticker.priceDecimals}
              />
            ))}
          </View>

          <View
            style={[
              styles.tickerGroup,
              {
                gap: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
                paddingRight: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
              },
            ]}
          >
            {items.map((ticker) => (
              <MarketTickerItem
                key={`b-${ticker.id}`}
                name={ticker.name}
                price={ticker.price}
                changePercent={ticker.changePercent}
                priceDecimals={ticker.priceDecimals}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: '600',
  },
  timezoneBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timezoneText: {
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 16,
  },
  marqueeViewport: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default TopMarketTickerBar;
