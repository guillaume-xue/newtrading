// src/components/features/market/components/CommoditiesAndCurrenciesWidget.tsx
'use client';

import React from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { MarketIndexCard } from './MarketIndexCard';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderColor: theme['colors_button_outline-border'] ?? '#E5E7EB',
        },
      ]}
    >
      {/* 1. Titre */}
      <Text
        style={[
          styles.title,
          { color: theme['colors_text_primary'] ?? '#0B0F19' },
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
            { color: theme['colors_text_primary'] ?? '#0B0F19' },
          ]}
        >
          Consulter d&apos;autre &gt;
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 360,
    borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    padding: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    gap: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    maxWidth: '100%',
  },
  viewAllBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
