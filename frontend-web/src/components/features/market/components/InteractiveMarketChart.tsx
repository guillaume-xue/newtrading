'use client';

// src/components/features/market/components/InteractiveMarketChart.tsx
import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Image from 'next/image';

import { TradingChart } from './TradingChart';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { TimeRange } from '@/types/timeRange';
import ExpandIcon from '@/assets/icons/fi-rr-expand.svg';
import { useAppTheme } from '@/theme/ThemeContext';

interface InteractiveMarketChartProps {
  symbol: string;
  changePercent?: number | string;
  defaultRange?: TimeRange;
  onFullscreenPress?: () => void;
}

const RANGES: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1D' },
  { label: '3D', value: '3M' },
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'Tout', value: 'ALL' },
];

export const InteractiveMarketChart: React.FC<InteractiveMarketChartProps> = ({
  symbol,
  changePercent,
  defaultRange = '1D',
  onFullscreenPress,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const [selectedRange, setSelectedRange] = useState<TimeRange>(defaultRange);
  const [chartMode, setChartMode] = useState<'left' | 'right'>('right');

  // Détection positif / négatif
  const numericChange = useMemo(() => {
    if (typeof changePercent === 'number') return changePercent;
    if (changePercent != null) {
      return parseFloat(String(changePercent).replace(',', '.').replace('%', '').trim());
    }
    return null;
  }, [changePercent]);

  const isPositive = numericChange !== null ? numericChange >= 0 : true;

  // Couleurs dynamiques basées sur les tokens du thème
  const lineColor = useMemo(() => {
    if (changePercent == null) return colors['colors_badge_primary-action-bg'];
    return isPositive ? colors['colors_button_buy'] : colors['colors_button_sell'];
  }, [changePercent, isPositive, colors]);

  const topColor = useMemo(() => {
    if (changePercent == null) {
      return isDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.2)';
    }
    return isPositive ? 'rgba(5, 150, 105, 0.25)' : 'rgba(220, 38, 38, 0.25)';
  }, [changePercent, isPositive, isDark]);

  const bottomColor = useMemo(() => {
    if (changePercent == null) return 'rgba(37, 99, 235, 0.0)';
    return isPositive ? 'rgba(5, 150, 105, 0.0)' : 'rgba(220, 38, 38, 0.0)';
  }, [changePercent, isPositive]);

  const iconFilter = isDark ? 'brightness(0) invert(1)' : 'brightness(0)';

  return (
    <View style={styles.container}>
      {/* 1. Zone d'affichage du Graphique */}
      <View style={styles.chartViewport}>
        <TradingChart
          symbol={symbol}
          chartType={chartMode === 'left' ? 'candlestick' : 'area'}
          selectedRange={selectedRange}
          themeMode={isDark ? 'dark' : 'light'}
          lineColor={lineColor}
          topColor={topColor}
          bottomColor={bottomColor}
        />
      </View>

      {/* 2. Barre d'outils inférieure */}
      <View style={styles.bottomBar}>
        <View style={styles.rangeButtonsGroup}>
          {RANGES.map((item) => {
            const isSelected = selectedRange === item.value;
            return (
              <Button
                key={item.label}
                label={item.label}
                size="sm"
                variant={isSelected ? 'secondary' : 'ghost'}
                shape="rounded"
                onPress={() => setSelectedRange(item.value)}
                labelStyle={{
                  color: isSelected
                    ? colors['colors_text_primary']
                    : colors['colors_text_secondary'],
                  fontWeight: isSelected ? '700' : '600',
                }}
                style={
                  isSelected
                    ? {
                        ...styles.rangeBtn,
                        backgroundColor: colors['colors_bg_primary'],
                        borderColor: colors['colors_divider_text'],
                        borderWidth: 1,
                      }
                    : styles.rangeBtn
                }
              />
            );
          })}
        </View>

        <View style={styles.displayControlsGroup}>
          <Switch value={chartMode} onChange={setChartMode} />

          <Pressable
            onPress={onFullscreenPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Plein écran"
            style={({ pressed }) => [
              styles.expandBtn,
              {
                backgroundColor: colors['colors_button_ghost'],
                borderColor: colors['colors_button_outline-border'],
                borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
              },
              pressed && styles.pressed,
            ]}
          >
            <Image
              src={ExpandIcon}
              width={18}
              height={18}
              alt="Plein écran"
              style={{
                filter: iconFilter,
                opacity: 0.8,
              }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  chartViewport: {
    flex: 1,
    width: '100%',
    minHeight: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 12,
    flexShrink: 0,
    height: 52,
  },
  rangeButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  rangeBtn: {
    minWidth: 44,
    height: 36,
  },
  displayControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expandBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});

export default InteractiveMarketChart;
