'use client';

// src/components/features/market/components/CommoditiesAndCurrenciesWidget.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MarketIndexCard } from './MarketIndexCard';
import { useAppTheme } from '@/theme/ThemeContext';

interface CommoditiesAndCurrenciesWidgetProps {
  title?: string;
  onViewAllPress?: () => void;
  onAssetPress?: (symbol: string) => void;
}

const DEFAULT_ITEMS = [
  {
    id: '1',
    countryOrCategory: 'ALLEMAGNE',
    indexName: 'DAX 40',
    symbol: 'DAX40',
    equivalentAmount: '2 283,10$',
    changePercent: 0.43,
  },
  {
    id: '2',
    countryOrCategory: 'ALLEMAGNE',
    indexName: 'DAX 40',
    symbol: 'DAX40',
    equivalentAmount: '2 283,10$',
    changePercent: 0.43,
  },
  {
    id: '3',
    countryOrCategory: 'ALLEMAGNE',
    indexName: 'DAX 40',
    symbol: 'DAX40',
    equivalentAmount: '2 283,10$',
    changePercent: 0.43,
  },
];

export const CommoditiesAndCurrenciesWidget: React.FC<CommoditiesAndCurrenciesWidgetProps> = ({
  title = 'Matières & Devises',
  onViewAllPress,
  onAssetPress,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderColor: colors['colors_button_outline-border'],
          borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
          borderWidth: primitives['border width_border-thin'] ?? 1,
          padding: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
          gap: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
        },
      ]}
    >
      {/* 1. Titre */}
      <Text
        style={[
          styles.title,
          {
            color: colors['colors_text_primary'],
            fontSize: primitives['typography_font size_font-size-14'] ?? 14,
            lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
          },
        ]}
      >
        {title}
      </Text>

      {/* 2. Liste de cartes compactes (cardType="crypto") */}
      <View style={styles.list}>
        {DEFAULT_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onAssetPress?.(item.symbol)}
          >
            <MarketIndexCard
              countryOrCategory={item.countryOrCategory}
              indexName={item.indexName}
              symbol={item.symbol}
              points={0}
              equivalentAmount={item.equivalentAmount}
              changePercent={item.changePercent}
              cardType="crypto"
              style={styles.card}
            />
          </Pressable>
        ))}
      </View>

      {/* 3. Lien d'action inférieur */}
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
          Consulter d&apos;autres actifs &gt;
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 360,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 12,
    maxWidth: '100%',
  },
  viewAllBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});

export default CommoditiesAndCurrenciesWidget;
