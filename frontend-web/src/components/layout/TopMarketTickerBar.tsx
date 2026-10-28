'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { fetchScreenerData } from '@/lib/api/marketApi';
import { useAppTheme } from '@/theme/ThemeContext';

export interface TickerData extends MarketTickerItemProps {
  id: string | number;
}

export interface TopMarketTickerBarProps {
  isMarketOpen?: boolean;
  statusLabel?: string;
  timezone?: string;
  speed?: number; // Vitesse en pixels par seconde
  style?: ViewStyle;
}

export const TopMarketTickerBar: React.FC<TopMarketTickerBarProps> = ({
  isMarketOpen = true,
  statusLabel = 'Marchés ouverts',
  timezone = 'UTC+2',
  speed = 40,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [groupWidth, setGroupWidth] = useState(0);

  const animatedMarquee = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 1. Récupération des données réelles du marché
  useEffect(() => {
    let isMounted = true;

    const loadRealQuotes = async () => {
      try {
        const data = await fetchScreenerData();
        if (isMounted && data && data.length > 0) {
          const mapped: TickerData[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.currentPrice,
            changePercent: item.changePercent,
            priceDecimals: item.category === 'CRYPTO' ? 2 : 2,
          }));
          setTickers(mapped);
        }
      } catch (err) {
        console.warn('Erreur chargement ticker bar :', err);
      }
    };

    loadRealQuotes();
    const refreshInterval = setInterval(loadRealQuotes, 15000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);

  // 2. Clignotement fluide du voyant d'état
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

  // 3. Mesure de la largeur d'une séquence pour la boucle continue
  const handleGroupLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && Math.abs(width - groupWidth) > 1) {
      setGroupWidth(width);
    }
  };

  // 4. Défilement continu infini sans à-coup
  useEffect(() => {
    if (groupWidth === 0) return;

    animatedMarquee.setValue(0);
    const duration = (groupWidth / speed) * 1000;

    const scrollAnimation = Animated.loop(
      Animated.timing(animatedMarquee, {
        toValue: -groupWidth,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );

    scrollAnimation.start();
    return () => scrollAnimation.stop();
  }, [groupWidth, speed, animatedMarquee]);

  const dotColor = isMarketOpen
    ? colors['colors_button_buy']
    : colors['colors_button_sell'];

  const gapSize = primitives['spacing & layout_padding & margin_space-6'] ?? 24;

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
      {/* 1. Statut fixe à gauche */}
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

      {/* 2. Zone de défilement infini */}
      <View style={styles.marqueeViewport}>
        {tickers.length > 0 && (
          <Animated.View
            style={[
              styles.tickerTrack,
              {
                transform: [{ translateX: animatedMarquee }],
              },
            ]}
          >
            {/* Premier bloc mesuré */}
            <View
              style={[
                styles.tickerGroup,
                { gap: gapSize, paddingRight: gapSize },
              ]}
              onLayout={handleGroupLayout}
            >
              {tickers.map((ticker) => (
                <MarketTickerItem
                  key={`quote-a-${ticker.id}`}
                  name={ticker.name}
                  price={ticker.price}
                  changePercent={ticker.changePercent}
                  priceDecimals={ticker.priceDecimals}
                />
              ))}
            </View>

            {/* Deuxième bloc (relais sans coupure) */}
            <View
              style={[
                styles.tickerGroup,
                { gap: gapSize, paddingRight: gapSize },
              ]}
            >
              {tickers.map((ticker) => (
                <MarketTickerItem
                  key={`quote-b-${ticker.id}`}
                  name={ticker.name}
                  price={ticker.price}
                  changePercent={ticker.changePercent}
                  priceDecimals={ticker.priceDecimals}
                />
              ))}
            </View>

            {/* Troisième bloc (garantie anti-vide pour écrans larges) */}
            <View
              style={[
                styles.tickerGroup,
                { gap: gapSize, paddingRight: gapSize },
              ]}
            >
              {tickers.map((ticker) => (
                <MarketTickerItem
                  key={`quote-c-${ticker.id}`}
                  name={ticker.name}
                  price={ticker.price}
                  changePercent={ticker.changePercent}
                  priceDecimals={ticker.priceDecimals}
                />
              ))}
            </View>
          </Animated.View>
        )}
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
