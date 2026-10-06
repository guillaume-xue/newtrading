// components/TopMarketTickerBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  useColorScheme,
  LayoutChangeEvent,
} from 'react-native';

import { MarketTickerItem, MarketTickerItemProps } from '@/components/features/market/components/MarketTickerItem';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [contentWidth, setContentWidth] = useState(0);
  const animatedMarquee = useRef(new Animated.Value(0)).current;

  // Animation du clignotement
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 1. Boucle de clignotement du point vert
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
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    loopAnimation.start();

    return () => loopAnimation.stop();
  }, [contentWidth, speed, animatedMarquee]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderBottomColor: theme['colors_divider_text'] ?? '#D1D5DB',
        },
        style,
      ]}
    >
      {/* 1. Bloc fixe avec voyant clignotant */}
      <View
        style={[
          styles.statusSection,
          { backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF' },
        ]}
      >
        <Animated.View
          style={[
            styles.statusDot,
            {
              backgroundColor: isMarketOpen
                ? (theme['colors_button_buy'] ?? '#059669')
                : (theme['colors_button_sell'] ?? '#DC2626'),
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
            { color: theme['colors_text_primary'] ?? '#0B0F19' },
          ]}
          numberOfLines={1}
        >
          {statusLabel}
        </Text>

        <View
          style={[
            styles.timezoneBadge,
            { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
          ]}
        >
          <Text
            style={[
              styles.timezoneText,
              { color: theme['colors_text_primary'] ?? '#0B0F19' },
            ]}
          >
            {timezone}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: theme['colors_divider_text'] ?? '#D1D5DB' },
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
          <View style={styles.tickerGroup} onLayout={handleLayout}>
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

          <View style={styles.tickerGroup}>
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
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
    overflow: 'hidden',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    zIndex: 2,
    elevation: 2,
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '600',
  },
  timezoneBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timezoneText: {
    fontSize: primitives['typography_font size_font-size-10'] ?? 10,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 16,
    marginLeft: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
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
    gap: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
    paddingRight: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
  },
});
