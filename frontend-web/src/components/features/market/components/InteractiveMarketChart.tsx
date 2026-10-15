// src/components/features/market/components/InteractiveMarketChart.tsx
'use client';

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, useColorScheme } from 'react-native';
import Image from 'next/image';

import { TradingChart } from './TradingChart';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { TimeRange } from '@/types/timeRange';
import ExpandIcon from '@/assets/icons/fi-rr-expand.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

interface InteractiveMarketChartProps {
  symbol: string;
  changePercent?: number | string; // <-- Ajout de la prop
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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [selectedRange, setSelectedRange] = useState<TimeRange>(defaultRange);
  const [chartMode, setChartMode] = useState<'left' | 'right'>('right');

  // Détection positif / négatif
  const numericChange =
    typeof changePercent === 'number'
      ? changePercent
      : changePercent != null
      ? parseFloat(String(changePercent).replace(',', '.').replace('%', '').trim())
      : null;

  const isPositive = numericChange !== null ? numericChange >= 0 : true;

  // Couleurs dynamiques (Vert / Rouge, ou défaut si non renseigné)
  const lineColor =
    changePercent != null
      ? isPositive ? '#16A34A' : '#DC2626'
      : '#2563EB';

  const topColor =
    changePercent != null
      ? isPositive ? 'rgba(22, 163, 74, 0.25)' : 'rgba(220, 38, 38, 0.25)'
      : 'rgba(37, 99, 235, 0.2)';

  const bottomColor =
    changePercent != null
      ? isPositive ? 'rgba(22, 163, 74, 0.0)' : 'rgba(220, 38, 38, 0.0)'
      : 'rgba(37, 99, 235, 0.0)';

  return (
    <View style={styles.container}>
      {/* 1. Zone d'affichage du Graphique */}
      <View style={styles.chartViewport}>
        <TradingChart
          symbol={symbol}
          chartType={chartMode === 'left' ? 'candlestick' : 'area'}
          selectedRange={selectedRange}
          themeMode={scheme === 'dark' ? 'dark' : 'light'}
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
                style={
                  isSelected
                    ? {
                        ...styles.rangeBtn,
                        backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6',
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
                backgroundColor: theme['colors_button_ghost'] ?? '#E6E9EE',
                borderColor: theme['colors_button_outline-border'] ?? 'transparent',
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
                filter: scheme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)',
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
    minHeight: 0, // Permet au flex de réduire le canvas plutôt que d'écraser la barre du bas
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 12,
    flexShrink: 0, // Empêche la barre de disparaître ou d'être écrasée
    height: 52,    // Hauteur réservée pour les boutons et le Switch
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
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
