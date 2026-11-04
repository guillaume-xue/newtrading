'use client';

// components/features/market/components/HeatmapTile.tsx
import React, { useMemo } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme/ThemeContext';

export type HeatmapDirection = 'up' | 'down';
export type HeatmapBottomLayout = 'stacked' | 'split';

export interface HeatmapTileProps {
  symbol: string;
  sector?: string;
  changePercent: number | string;
  price: number | string;
  direction?: HeatmapDirection;
  bottomLayout?: HeatmapBottomLayout;
  currency?: string;
  decimals?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export const HeatmapTile: React.FC<HeatmapTileProps> = ({
  symbol,
  sector = 'Tech',
  changePercent,
  price,
  direction,
  bottomLayout = 'stacked',
  currency = '$',
  decimals = 2,
  onPress,
  style,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const isUp = useMemo(() => {
    if (direction !== undefined) return direction === 'up';
    if (typeof changePercent === 'number') return changePercent >= 0;
    return !String(changePercent).trim().startsWith('-');
  }, [direction, changePercent]);

  const formattedPercent = useMemo(() => {
    if (typeof changePercent === 'number') {
      const sign = changePercent >= 0 ? '+' : '';
      const formatted = changePercent.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}${formatted}%`;
    }
    return changePercent;
  }, [changePercent, decimals]);

  const formattedPrice = useMemo(() => {
    if (typeof price === 'number') {
      const formatted = price.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${formatted}${currency}`;
    }
    return price;
  }, [price, decimals, currency]);

  const backgroundColor = isUp
    ? colors['colors_tile_up-bg']
    : colors['colors_tile_down-bg'];

  const textColor = colors['colors_tile_text'];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor,
          borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 10,
          padding: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.symbolText, { color: textColor }]} numberOfLines={1}>
          {symbol}
        </Text>
        {sector ? (
          <Text style={[styles.sectorText, { color: textColor }]} numberOfLines={1}>
            {sector}
          </Text>
        ) : null}
      </View>

      {bottomLayout === 'split' ? (
        <View style={styles.splitBottomRow}>
          <Text style={[styles.percentText, { color: textColor }]} numberOfLines={1}>
            {formattedPercent}
          </Text>
          {Boolean(formattedPrice) && (
            <Text style={[styles.priceText, { color: textColor }]} numberOfLines={1}>
              {formattedPrice}
            </Text>
          )}
        </View>
      ) : (
        <View
          style={[
            styles.stackedBottomCol,
            { gap: primitives['spacing & layout_padding & margin_space-1'] ?? 2 },
          ]}
        >
          <Text style={[styles.percentText, { color: textColor }]} numberOfLines={1}>
            {formattedPercent}
          </Text>
          {Boolean(formattedPrice) && (
            <Text style={[styles.priceText, { color: textColor }]} numberOfLines={1}>
              {formattedPrice}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    minWidth: 0,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  symbolText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectorText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  stackedBottomCol: {
    alignItems: 'flex-start',
  },
  splitBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 4,
  },
  percentText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  priceText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    opacity: 0.95,
    fontVariant: ['tabular-nums'],
  },
});

export default HeatmapTile;
