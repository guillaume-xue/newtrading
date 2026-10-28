'use client';

// src/components/features/market/components/MarketHeatmapWidget.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { HeatmapTile } from './HeatmapTile';
import { useAppTheme } from '@/theme/ThemeContext';
import { fetchScreenerData, ScreenerModel } from '@/lib/api/marketApi';

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

  const [holdings, setHoldings] = useState<ScreenerModel[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadMarketHoldings = async () => {
      try {
        const data = await fetchScreenerData();
        if (isMounted && data && data.length > 0) {
          // Filtrage pour ne garder que les actions et indices principaux
          const filtered = data.filter((item) => item.category === 'ACTIONS' || item.category === 'INDICES');
          setHoldings(filtered.length >= 6 ? filtered : data);
        }
      } catch (err) {
        console.warn('Erreur chargement Heatmap :', err);
      }
    };

    loadMarketHoldings();
    const interval = setInterval(loadMarketHoldings, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Définition d'éléments de secours réalistes si l'API est en cours de chargement
  const defaultItems = [
    { symbol: 'AAPL', category: 'Tech', currentPrice: 189.4, changePercent: 1.45 },
    { symbol: 'NVDA', category: 'Tech', currentPrice: 893.4, changePercent: 3.23 },
    { symbol: 'MSFT', category: 'Tech', currentPrice: 420.2, changePercent: -0.65 },
    { symbol: 'SPY', category: 'Finance', currentPrice: 534.9, changePercent: 0.43 },
    { symbol: 'QQQ', category: 'Tech', currentPrice: 448.2, changePercent: -0.28 },
    { symbol: 'DIA', category: 'Industrie', currentPrice: 391.2, changePercent: 0.15 },
  ];

  const items = holdings.length >= 6 ? holdings : defaultItems;

  const formatPrice = (price?: number) =>
    price ? `${price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}$` : '';

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

      {/* 2. Grille Treemap avec actifs réels différenciés */}
      <View style={styles.gridContainer}>
        {/* Ligne du haut */}
        <View style={styles.topSection}>
          <HeatmapTile
            symbol={items[0].symbol}
            sector={items[0].category}
            changePercent={items[0].changePercent}
            price={formatPrice(items[0].currentPrice)}
            direction={items[0].changePercent >= 0 ? 'up' : 'down'}
            bottomLayout="stacked"
            onPress={() => onAssetPress?.(items[0].symbol)}
            style={styles.largeTile}
          />

          <View style={styles.rightColumn}>
            <HeatmapTile
              symbol={items[1].symbol}
              sector={items[1].category}
              changePercent={items[1].changePercent}
              price={formatPrice(items[1].currentPrice)}
              direction={items[1].changePercent >= 0 ? 'up' : 'down'}
              bottomLayout="stacked"
              onPress={() => onAssetPress?.(items[1].symbol)}
              style={styles.mediumTile}
            />
            <HeatmapTile
              symbol={items[2].symbol}
              sector={items[2].category}
              changePercent={items[2].changePercent}
              price={formatPrice(items[2].currentPrice)}
              direction={items[2].changePercent >= 0 ? 'up' : 'down'}
              bottomLayout="stacked"
              onPress={() => onAssetPress?.(items[2].symbol)}
              style={styles.mediumTile}
            />
          </View>
        </View>

        {/* Ligne du bas */}
        <View style={styles.bottomSection}>
          <HeatmapTile
            symbol={items[3].symbol}
            sector={items[3].category}
            changePercent={items[3].changePercent}
            price={formatPrice(items[3].currentPrice)}
            direction={items[3].changePercent >= 0 ? 'up' : 'down'}
            bottomLayout="split"
            onPress={() => onAssetPress?.(items[3].symbol)}
            style={styles.bottomSplitTile}
          />
          <HeatmapTile
            symbol={items[4].symbol}
            sector={items[4].category}
            changePercent={items[4].changePercent}
            price={formatPrice(items[4].currentPrice)}
            direction={items[4].changePercent >= 0 ? 'up' : 'down'}
            bottomLayout="split"
            onPress={() => onAssetPress?.(items[4].symbol)}
            style={styles.bottomSplitTile}
          />
          <HeatmapTile
            symbol={items[5].symbol}
            changePercent={items[5].changePercent}
            price={formatPrice(items[5].currentPrice)}
            direction={items[5].changePercent >= 0 ? 'up' : 'down'}
            bottomLayout="stacked"
            onPress={() => onAssetPress?.(items[5].symbol)}
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
