'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
  Platform,
} from 'react-native';

import {
  MarketTickerItem,
  MarketTickerItemProps,
} from '@/components/features/market/components/MarketTickerItem';
import { fetchScreenerData, ScreenerModel } from '@/lib/api/marketApi';
import { useAppTheme } from '@/theme/ThemeContext';

export interface TickerData extends MarketTickerItemProps {
  id: string;
  symbol: string;
  sessionZone: MarketSessionZone;
}

export interface TopMarketTickerBarProps {
  isMarketOpen?: boolean;
  statusLabel?: string;
  timezone?: string;
  speed?: number;
  style?: ViewStyle;
}

export type MarketSessionZone = 'US_EQUITY' | 'EU_EQUITY' | 'JP_EQUITY';

export interface CanonicalIndexDefinition {
  symbol: string;
  defaultName: string;
  sessionZone: MarketSessionZone;
}

export interface FranceClockParts {
  weekday: number;
  minutes: number;
  offsetLabel: string;
}

export const CANONICAL_INDICES: readonly CanonicalIndexDefinition[] = [
  { symbol: 'SPY', defaultName: 'S&P 500 ETF', sessionZone: 'US_EQUITY' },
  { symbol: 'QQQ', defaultName: 'NASDAQ 100 ETF', sessionZone: 'US_EQUITY' },
  { symbol: 'DIA', defaultName: 'DOW JONES ETF', sessionZone: 'US_EQUITY' },
  { symbol: 'IWM', defaultName: 'RUSSELL 2000 ETF', sessionZone: 'US_EQUITY' },
  { symbol: 'EEM', defaultName: 'MSCI EMERGING ETF', sessionZone: 'US_EQUITY' },
  { symbol: 'VGK', defaultName: 'FTSE EUROPE ETF', sessionZone: 'EU_EQUITY' },
  { symbol: 'EWJ', defaultName: 'MSCI JAPAN ETF', sessionZone: 'JP_EQUITY' },
  { symbol: 'VIXY', defaultName: 'VIX SHORT-TERM', sessionZone: 'US_EQUITY' },
  { symbol: 'GLD', defaultName: 'GOLD SHARES ETF', sessionZone: 'US_EQUITY' },
  { symbol: 'TLT', defaultName: 'TREASURY 20+ YR', sessionZone: 'US_EQUITY' },
] as const;

const CANONICAL_INDEX_MAP = new Map<string, CanonicalIndexDefinition>(
  CANONICAL_INDICES.map((item) => [item.symbol.toUpperCase(), item])
);

function normalizeSymbol(value?: string): string {
  return String(value ?? '')
    .trim()
    .toUpperCase();
}

function normalizeTimezoneProp(timezone?: string): {
  ianaZone: string;
  staticLabel?: string;
} {
  if (!timezone) {
    return { ianaZone: 'Europe/Paris' };
  }
  const trimmed = timezone.trim();
  if (/^(UTC|GMT)[+-]\d{1,2}(:\d{2})?$/i.test(trimmed)) {
    return {
      ianaZone: 'Europe/Paris',
      staticLabel: trimmed.toUpperCase().replace('GMT', 'UTC'),
    };
  }
  return { ianaZone: trimmed };
}

export function getFranceClockParts(date: Date = new Date()): FranceClockParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset',
  });

  const parts = formatter.formatToParts(date);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);
  const rawOffset = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+1';

  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    weekday: weekdayMap[weekdayStr] ?? 1,
    minutes: hour * 60 + minute,
    offsetLabel: rawOffset.replace('GMT', 'UTC'),
  };
}

export function isIndexOpenInFrance(
  zone: MarketSessionZone,
  date: Date = new Date()
): boolean {
  const { weekday, minutes, offsetLabel } = getFranceClockParts(date);
  const isWeekday = weekday >= 1 && weekday <= 5;
  if (!isWeekday) return false;

  switch (zone) {
    case 'EU_EQUITY':
      return minutes >= 9 * 60 && minutes < 17 * 60 + 30;
    case 'US_EQUITY':
      return minutes >= 15 * 60 + 30 && minutes < 22 * 60;
    case 'JP_EQUITY': {
      const isSummer = offsetLabel === 'UTC+2';
      const start = isSummer ? 2 * 60 : 1 * 60;
      const end = isSummer ? 8 * 60 : 7 * 60;
      return minutes >= start && minutes < end;
    }
  }
}

function mapScreenerToCanonicalTickers(items: ScreenerModel[]): TickerData[] {
  const bySymbol = new Map<string, ScreenerModel>();
  for (const item of items) {
    const key = normalizeSymbol(item.symbol);
    if (CANONICAL_INDEX_MAP.has(key) && !bySymbol.has(key)) {
      bySymbol.set(key, item);
    }
  }

  return CANONICAL_INDICES.map((def) => {
    const live = bySymbol.get(def.symbol);
    return {
      id: live?.id ?? def.symbol,
      symbol: def.symbol,
      name: live?.name?.trim() ? live.name : def.defaultName,
      price: live?.currentPrice ?? 0,
      changePercent: live?.changePercent ?? 0,
      priceDecimals: 2,
      sessionZone: def.sessionZone,
    };
  });
}

export const TopMarketTickerBar: React.FC<TopMarketTickerBarProps> = ({
  isMarketOpen,
  statusLabel,
  timezone = 'Europe/Paris',
  speed = 40,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [tickers, setTickers] = useState<TickerData[]>(() =>
    CANONICAL_INDICES.map((def) => ({
      id: def.symbol,
      symbol: def.symbol,
      name: def.defaultName,
      price: 0,
      changePercent: 0,
      priceDecimals: 2,
      sessionZone: def.sessionZone,
    }))
  );
  const [groupWidth, setGroupWidth] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [nowTick, setNowTick] = useState<Date>(() => new Date());

  const animatedMarquee = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const loadCanonicalIndices = useCallback(async (active: boolean) => {
    try {
      const data = await fetchScreenerData();
      if (!active || !Array.isArray(data)) return;
      setTickers(mapScreenerToCanonicalTickers(data));
    } catch (err) {
      console.warn('Erreur chargement des 10 indices (TopMarketTickerBar) :', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void loadCanonicalIndices(true);
    const refreshInterval = setInterval(() => {
      void loadCanonicalIndices(isMounted);
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [loadCanonicalIndices]);

  const marketState = useMemo(() => {
    if (typeof isMarketOpen === 'boolean') {
      return {
        isOpen: isMarketOpen,
        label: statusLabel ?? (isMarketOpen ? 'Indices ouverts' : 'Indices fermés'),
      };
    }

    const isOpen = tickers.some((t) => isIndexOpenInFrance(t.sessionZone, nowTick));

    if (statusLabel) {
      return { isOpen, label: statusLabel };
    }

    return {
      isOpen,
      label: isOpen ? 'Indices ouverts' : 'Indices fermés',
    };
  }, [isMarketOpen, statusLabel, tickers, nowTick]);

  const timezoneDisplay = useMemo(() => {
    const { ianaZone, staticLabel } = normalizeTimezoneProp(timezone);
    if (staticLabel) {
      return staticLabel;
    }
    try {
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: ianaZone,
        timeZoneName: 'shortOffset',
      });
      const offsetPart = formatter
        .formatToParts(nowTick)
        .find((p) => p.type === 'timeZoneName')?.value;
      return offsetPart
        ? offsetPart.replace('GMT', 'UTC')
        : getFranceClockParts(nowTick).offsetLabel;
    } catch {
      return getFranceClockParts(nowTick).offsetLabel;
    }
  }, [timezone, nowTick]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const handleGroupLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0 && Math.abs(width - groupWidth) > 1) {
        setGroupWidth(width);
      }
    },
    [groupWidth]
  );

  useEffect(() => {
    animatedMarquee.stopAnimation();

    if (groupWidth === 0 || isPaused) return;

    const currentOffset =
      ((animatedMarquee as unknown as { _value?: number })._value ?? 0) % groupWidth;
    const normalizedOffset = currentOffset > 0 ? currentOffset - groupWidth : currentOffset;
    const remainingDistance = Math.abs(-groupWidth - normalizedOffset);
    const duration = Math.max(1000, (remainingDistance / speed) * 1000);

    animatedMarquee.setValue(normalizedOffset);

    let loopAnim: Animated.CompositeAnimation | null = null;
    const scrollAnimation = Animated.timing(animatedMarquee, {
      toValue: -groupWidth,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    scrollAnimation.start(({ finished }) => {
      if (finished && !isPaused) {
        animatedMarquee.setValue(0);
        loopAnim = Animated.loop(
          Animated.timing(animatedMarquee, {
            toValue: -groupWidth,
            duration: (groupWidth / speed) * 1000,
            easing: Easing.linear,
            useNativeDriver: false,
          })
        );
        loopAnim.start();
      }
    });

    return () => {
      scrollAnimation.stop();
      loopAnim?.stop();
      animatedMarquee.stopAnimation();
    };
  }, [groupWidth, speed, isPaused, animatedMarquee]);

  const dotColor = marketState.isOpen
    ? colors['colors_button_buy']
    : colors['colors_button_sell'];

  const gapSize = primitives['spacing & layout_padding & margin_space-6'] ?? 24;

  const webHoverProps =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setIsPaused(true),
          onMouseLeave: () => setIsPaused(false),
        }
      : {};

  return (
    <View
      {...webHoverProps}
      style={[
        styles.container,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderBottomColor: colors['colors_divider_text'],
        },
        style,
      ]}
    >
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
                    outputRange: [0.88, 1.05],
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
          {marketState.label}
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
            {timezoneDisplay}
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

      <View style={styles.marqueeViewport} pointerEvents="none">
        <Animated.View
          style={[
            styles.tickerTrack,
            {
              transform: [{ translateX: animatedMarquee }],
            },
          ]}
        >
          <View
            style={[styles.tickerGroup, { gap: gapSize, paddingRight: gapSize }]}
            onLayout={handleGroupLayout}
          >
            {tickers.map((ticker) => (
              <MarketTickerItem
                key={`quote-a-${ticker.symbol}`}
                name={ticker.name}
                price={ticker.price}
                changePercent={ticker.changePercent}
                priceDecimals={ticker.priceDecimals}
              />
            ))}
          </View>

          <View style={[styles.tickerGroup, { gap: gapSize, paddingRight: gapSize }]}>
            {tickers.map((ticker) => (
              <MarketTickerItem
                key={`quote-b-${ticker.symbol}`}
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
    flexShrink: 0,
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
    ...(Platform.OS === 'web' ? ({ cursor: 'default', userSelect: 'none' } as object) : {}),
  },
  tickerTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tickerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
});

export default TopMarketTickerBar;
