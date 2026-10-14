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
  defaultRange?: TimeRange;
  onFullscreenPress?: () => void;
}

const RANGES: { label: string; value: TimeRange }[] = [
  { label: '1D', value: '1D' },
  { label: '3D', value: '3M' }, // ou intervalle souhaité
  { label: '1M', value: '1M' },
  { label: '1Y', value: '1Y' },
  { label: '5Y', value: '5Y' },
  { label: 'Tout', value: 'ALL' },
];

export const InteractiveMarketChart: React.FC<InteractiveMarketChartProps> = ({
  symbol,
  defaultRange = '1D',
  onFullscreenPress,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [selectedRange, setSelectedRange] = useState<TimeRange>(defaultRange);
  // 'left' = Chandelier / Barres, 'right' = Courbe continue (Area)
  const [chartMode, setChartMode] = useState<'left' | 'right'>('right');

  return (
    <View style={styles.container}>
      {/* 1. Zone d'affichage du Graphique */}
      <View style={styles.chartViewport}>
        <TradingChart
          symbol={symbol}
          chartType={chartMode === 'left' ? 'candlestick' : 'area'}
          selectedRange={selectedRange}
          themeMode={scheme === 'dark' ? 'dark' : 'light'}
        />
      </View>

      {/* 2. Barre d'outils inférieure : Boutons de période + Switch + Plein écran */}
      <View style={styles.bottomBar}>
        {/* Filtres de plages temporelles (Gauche) */}
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
                style={[
                  styles.rangeBtn,
                  isSelected && {
                    backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6',
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Contrôles d'affichage (Droite) */}
        <View style={styles.displayControlsGroup}>
          <Switch
            value={chartMode}
            onChange={setChartMode}
          />

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
