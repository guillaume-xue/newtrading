'use client';

// src/components/features/market/components/MarketHeatmapWidget.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadMarketHoldings = async () => {
      try {
        const data = await fetchScreenerData();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Filtrer les actifs valides avec cotation non nulle
          const validItems = data.filter((item) => Number(item.currentPrice) > 0);
          setHoldings(validItems.length >= 6 ? validItems.slice(0, 6) : data.slice(0, 6));
        }
      } catch (err) {
        console.warn('Erreur chargement Heatmap :', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadMarketHoldings();
    const interval = setInterval(loadMarketHoldings, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const formatPrice = (price?: number) => {
    if (!price || isNaN(Number(price))) return '';
    return `${Number(price).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} $`;
  };

  const getSectorLabel = (category?: string) => {
    if (!category) return 'Marché';
    switch (category.toUpperCase()) {
      case 'ACTIONS':
        return 'Action';
      case 'INDICES':
        return 'Indice';
      case 'CRYPTO':
        return 'Crypto';
      default:
        return category;
    }
  };

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

      {/* 2. État de chargement ou Grille Heatmap avec données réelles */}
      {loading && holdings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors['colors_badge_primary-action-bg']} />
          <Text style={[styles.loadingText, { color: colors['colors_text_secondary'] }]}>
            Chargement des cours...
          </Text>
        </View>
      ) : holdings.length < 6 ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors['colors_text_secondary'] }]}>
            Données de marché en attente de synchronisation.
          </Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {/* Ligne du haut */}
          <View style={styles.topSection}>
            <HeatmapTile
              symbol={holdings[0].symbol}
              sector={getSectorLabel(holdings[0].category)}
              changePercent={holdings[0].changePercent ?? 0}
              price={formatPrice(holdings[0].currentPrice)}
              direction={(holdings[0].changePercent ?? 0) >= 0 ? 'up' : 'down'}
              bottomLayout="stacked"
              onPress={() => onAssetPress?.(holdings[0].symbol)}
              style={styles.largeTile}
            />

            <View style={styles.rightColumn}>
              <HeatmapTile
                symbol={holdings[1].symbol}
                sector={getSectorLabel(holdings[1].category)}
                changePercent={holdings[1].changePercent ?? 0}
                price={formatPrice(holdings[1].currentPrice)}
                direction={(holdings[1].changePercent ?? 0) >= 0 ? 'up' : 'down'}
                bottomLayout="stacked"
                onPress={() => onAssetPress?.(holdings[1].symbol)}
                style={styles.mediumTile}
              />
              <HeatmapTile
                symbol={holdings[2].symbol}
                sector={getSectorLabel(holdings[2].category)}
                changePercent={holdings[2].changePercent ?? 0}
                price={formatPrice(holdings[2].currentPrice)}
                direction={(holdings[2].changePercent ?? 0) >= 0 ? 'up' : 'down'}
                bottomLayout="stacked"
                onPress={() => onAssetPress?.(holdings[2].symbol)}
                style={styles.mediumTile}
              />
            </View>
          </View>

          {/* Ligne du bas */}
          <View style={styles.bottomSection}>
            <HeatmapTile
              symbol={holdings[3].symbol}
              sector={getSectorLabel(holdings[3].category)}
              changePercent={holdings[3].changePercent ?? 0}
              price={formatPrice(holdings[3].currentPrice)}
              direction={(holdings[3].changePercent ?? 0) >= 0 ? 'up' : 'down'}
              bottomLayout="split"
              onPress={() => onAssetPress?.(holdings[3].symbol)}
              style={styles.bottomSplitTile}
            />
            <HeatmapTile
              symbol={holdings[4].symbol}
              sector={getSectorLabel(holdings[4].category)}
              changePercent={holdings[4].changePercent ?? 0}
              price={formatPrice(holdings[4].currentPrice)}
              direction={(holdings[4].changePercent ?? 0) >= 0 ? 'up' : 'down'}
              bottomLayout="split"
              onPress={() => onAssetPress?.(holdings[4].symbol)}
              style={styles.bottomSplitTile}
            />
            <HeatmapTile
              symbol={holdings[5].symbol}
              sector={getSectorLabel(holdings[5].category)}
              changePercent={holdings[5].changePercent ?? 0}
              price={formatPrice(holdings[5].currentPrice)}
              direction={(holdings[5].changePercent ?? 0) >= 0 ? 'up' : 'down'}
              bottomLayout="stacked"
              onPress={() => onAssetPress?.(holdings[5].symbol)}
              style={styles.bottomSmallTile}
            />
          </View>
        </View>
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
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
