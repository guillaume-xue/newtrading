// components/HeatmapTile.tsx
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from 'react-native';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type HeatmapDirection = 'up' | 'down';
export type HeatmapBottomLayout = 'stacked' | 'split';

export interface HeatmapTileProps {
  /**
   * Symbole de l'actif (ex: "NVDA")
   */
  symbol: string;
  /**
   * Secteur ou catégorie d'activité (ex: "Tech")
   */
  sector?: string;
  /**
   * Variation en pourcentage (ex: 3.23 ou -3.23 ou "+3,23%")
   */
  changePercent: number | string;
  /**
   * Cours actuel sous forme numérique ou texte (ex: 893.40 ou "893,40$")
   */
  price: number | string;
  /**
   * Forcer la couleur (hausse/baisse). Si omis, déterminé automatiquement selon changePercent.
   */
  direction?: HeatmapDirection;
  /**
   * Disposition de la section inférieure :
   * - 'stacked' : pourcentage au-dessus du prix (en bas à gauche)
   * - 'split' : pourcentage à gauche, prix à droite
   */
  bottomLayout?: HeatmapBottomLayout;
  /**
   * Symbole monétaire (par défaut "$")
   */
  currency?: string;
  /**
   * Nombre de décimales pour les montants
   */
  decimals?: number;
  /**
   * Action au clic sur la tuile
   */
  onPress?: () => void;
  /**
   * Styles personnalisés pour le conteneur
   */
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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  // 1. Détermination de la couleur (hausse = vert, baisse = rouge)
  const isUp =
    direction !== undefined
      ? direction === 'up'
      : typeof changePercent === 'number'
      ? changePercent >= 0
      : !String(changePercent).trim().startsWith('-');

  // 2. Formatage des valeurs
  const formattedPercent = (() => {
    if (typeof changePercent === 'number') {
      const sign = changePercent >= 0 ? '+' : '';
      const formatted = changePercent.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${sign}${formatted}%`;
    }
    return changePercent;
  })();

  const formattedPrice = (() => {
    if (typeof price === 'number') {
      const formatted = price.toLocaleString('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${formatted}${currency}`;
    }
    return price;
  })();

  const backgroundColor = isUp
    ? theme['colors_tile_up-bg']
    : theme['colors_tile_down-bg'];

  const textColor = theme['colors_tile_text'] ?? '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor },
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* En-tête : Ticker à gauche, Secteur à droite */}
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

      {/* Pied : Répartition stacked ou split */}
      {bottomLayout === 'split' ? (
        <View style={styles.splitBottomRow}>
          <Text style={[styles.percentText, { color: textColor }]} numberOfLines={1}>
            {formattedPercent}
          </Text>
          <Text style={[styles.priceText, { color: textColor }]} numberOfLines={1}>
            {formattedPrice}
          </Text>
        </View>
      ) : (
        <View style={styles.stackedBottomCol}>
          <Text style={[styles.percentText, { color: textColor }]} numberOfLines={1}>
            {formattedPercent}
          </Text>
          <Text style={[styles.priceText, { color: textColor }]} numberOfLines={1}>
            {formattedPrice}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 156,
    height: 156,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
    padding: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbolText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectorText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '600',
    opacity: 0.9,
  },
  stackedBottomCol: {
    alignItems: 'flex-start',
    gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  splitBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  percentText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
  },
  priceText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '500',
    opacity: 0.95,
  },
});
