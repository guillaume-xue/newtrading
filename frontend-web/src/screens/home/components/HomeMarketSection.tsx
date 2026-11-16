// src/screens/home/components/HomeMarketSection.tsx
'use client';

import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';

import { MarketIndexCard, CardType } from '@/components/features/market/components/MarketIndexCard';
import { InteractiveMarketChart } from '@/components/features/market/components/InteractiveMarketChart';
import { useAppTheme } from '@/theme/ThemeContext';
import { MarketAssetItem, findSelectedAsset } from '../homeMarketData';

export interface HomeMarketSectionProps {
  title: string;
  items: readonly MarketAssetItem[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  cardType: CardType;
  chartKeyPrefix: string;
  onSectionPress: () => void;
  onFullscreenAsset: (symbol: string) => void;
  /** Slot latéral optionnel (ex: MarketHeatmapWidget sur la section Indices) */
  rightSlot?: React.ReactNode;
}

/**
 * Section générique affichant un en-tête cliquable, un ruban horizontal de cartes
 * sélectionnables et un graphique interactif associé à l'actif actif.
 */
export const HomeMarketSection: React.FC<HomeMarketSectionProps> = ({
  title,
  items,
  selectedSymbol,
  onSelectSymbol,
  cardType,
  chartKeyPrefix,
  onSectionPress,
  onFullscreenAsset,
  rightSlot,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const currentAsset = useMemo(
    () => findSelectedAsset(items, selectedSymbol),
    [items, selectedSymbol]
  );

  const sectionSpacing = primitives['spacing & layout_padding & margin_space-16'] ?? 64;
  const borderRadius = primitives['spacing & layout_border radius_radius-md'] ?? 8;
  const titleFontSize = primitives['typography_font size_font-size-48'] ?? 48;

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors['colors_bg_secondary'],
          padding: sectionSpacing,
          borderRadius,
        },
      ]}
    >
      <Pressable onPress={onSectionPress} style={styles.sectionTitlePressable}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors['colors_text_primary'],
              fontSize: titleFontSize,
            },
          ]}
        >
          {title} {'>'}
        </Text>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.cardsRow}>
          {items.map((item) => {
            const isSelected = item.symbol === selectedSymbol;
            return (
              <MarketIndexCard
                key={item.symbol}
                countryOrCategory={item.countryOrCategory}
                indexName={item.indexName}
                symbol={item.symbol}
                points={item.points}
                equivalentAmount={item.equivalentAmount}
                changePercent={item.changePercent}
                cardType={cardType}
                style={[
                  styles.cardFlex,
                  isSelected && {
                    borderWidth: 2,
                    borderColor: colors['colors_badge_primary-action-bg'],
                  },
                ]}
                onPress={() => onSelectSymbol(item.symbol)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.chartRow}>
        <View
          style={[
            rightSlot ? styles.chartCardSplit : styles.chartCardFull,
            {
              backgroundColor: colors['colors_bg_secondary'],
              borderColor: colors['colors_divider_text'],
            },
          ]}
        >
          <InteractiveMarketChart
            key={`${chartKeyPrefix}-${currentAsset.symbol}`}
            symbol={currentAsset.symbol}
            changePercent={currentAsset.changePercent}
            disableZoom={true}
            onFullscreenPress={() => onFullscreenAsset(currentAsset.symbol)}
          />
        </View>

        {rightSlot && <View style={styles.rightColumn}>{rightSlot}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitlePressable: {
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cardFlex: {
    flex: 1,
    minWidth: 445,
  },
  chartRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
    width: '100%',
  },
  chartCardSplit: {
    flex: 1,
    height: 520,
    minWidth: 0,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  chartCardFull: {
    width: '100%',
    height: 520,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  rightColumn: {
    flexShrink: 0,
    width: 400,
    minWidth: 0,
  },
});
