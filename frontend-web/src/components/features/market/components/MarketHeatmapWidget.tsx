'use client';

// src/components/features/market/components/MarketHeatmapWidget.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { HeatmapTile } from './HeatmapTile';
import { useAppTheme } from '@/theme/ThemeContext';

interface MarketHeatmapWidgetProps {
  title?: string;
  onViewAllPress?: () => void;
  onAssetPress?: (symbol: string) => void;
}

export const MarketHeatmapWidget: React.FC<MarketHeatmapWidgetProps> = ({
  title = 'Principales participations',
  onViewAllPress,
  onAssetPress,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  return (
    <View
      style={[
        styles.widgetCard,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor: colors['colors_button_outline-border'],
          borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
          borderWidth: primitives['border width_border-thin'] ?? 1,
          padding: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
          gap: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
        },
      ]}
    >
      {/* 1. Titre du widget */}
      <Text
        style={[
          styles.widgetTitle,
          {
            color: colors['colors_text_primary'],
            fontSize: primitives['typography_font size_font-size-14'] ?? 14,
            lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
          },
        ]}
      >
        {title}
      </Text>

      {/* 2. Grille Treemap Asymétrique */}
      <View style={styles.gridContainer}>
        {/* Ligne du haut : Grande tuile à gauche + 2 tuiles superposées à droite */}
        <View style={styles.topSection}>
          <HeatmapTile
            symbol="NVDA"
            sector="Tech"
            changePercent={3.23}
            price="893,40$"
            direction="up"
            bottomLayout="stacked"
            onPress={() => onAssetPress?.('NVDA')}
            style={styles.largeTile}
          />

          <View style={styles.rightColumn}>
            <HeatmapTile
              symbol="NVDA"
              sector="Tech"
              changePercent={3.23}
              price="893,40$"
              direction="up"
              bottomLayout="stacked"
              onPress={() => onAssetPress?.('NVDA')}
              style={styles.mediumTile}
            />
            <HeatmapTile
              symbol="NVDA"
              sector="Tech"
              changePercent={3.23}
              price="893,40$"
              direction="down"
              bottomLayout="stacked"
              onPress={() => onAssetPress?.('NVDA')}
              style={styles.mediumTile}
            />
          </View>
        </View>

        {/* Ligne du bas : 3 tuiles horizontales */}
        <View style={styles.bottomSection}>
          <HeatmapTile
            symbol="NVDA"
            sector="Tech"
            changePercent={-3.23}
            price="893,40$"
            direction="down"
            bottomLayout="split"
            onPress={() => onAssetPress?.('NVDA')}
            style={styles.bottomSplitTile}
          />
          <HeatmapTile
            symbol="NVDA"
            sector="Tech"
            changePercent={-3.23}
            price="893,40$"
            direction="up"
            bottomLayout="split"
            onPress={() => onAssetPress?.('NVDA')}
            style={styles.bottomSplitTile}
          />
          <HeatmapTile
            symbol="NVDA"
            changePercent={3.23}
            price=""
            direction="down"
            bottomLayout="stacked"
            onPress={() => onAssetPress?.('NVDA')}
            style={styles.bottomSmallTile}
          />
        </View>
      </View>

      {/* 3. Bouton Voir tout */}
      <Pressable
        onPress={onViewAllPress}
        hitSlop={8}
        style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
      >
        <Text
          style={[
            styles.viewAllText,
            {
              color: colors['colors_text_primary'],
              fontSize: primitives['typography_font size_font-size-14'] ?? 14,
              lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
            },
          ]}
        >
          Voir tout &gt;
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  widgetCard: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  widgetTitle: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  gridContainer: {
    flex: 1,
    gap: 8,
    width: '100%',
    minHeight: 0,
  },
  topSection: {
    flex: 3,
    flexDirection: 'row',
    gap: 8,
    minHeight: 0,
  },
  largeTile: {
    flex: 1,
    width: 'auto',
    height: '100%',
  },
  rightColumn: {
    flex: 1,
    gap: 8,
    height: '100%',
    minHeight: 0,
  },
  mediumTile: {
    flex: 1,
    width: 'auto',
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 0,
  },
  bottomSplitTile: {
    flex: 1.35,
    width: 'auto',
    height: '100%',
  },
  bottomSmallTile: {
    flex: 0.8,
    width: 'auto',
    height: '100%',
  },
  viewAllBtn: {
    alignSelf: 'flex-start',
  },
  viewAllText: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default MarketHeatmapWidget;
