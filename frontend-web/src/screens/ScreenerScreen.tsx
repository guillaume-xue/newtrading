'use client';

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'next/navigation';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { TopMarketTickerBar } from '@/components/features/market/components/TopMarketTickerBar';
import {
  ScreenerTable,
  ScreenerItem,
  SortField,
  SortOrder,
} from '@/components/features/market/components/tables/ScreenerTable';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

type AssetCategory = 'TOUT' | 'ACTIONS' | 'CRYPTO' | 'INDICES';

// Jeux de données par défaut aligné sur le PRD & la maquette Figma
const INITIAL_SCREENER_DATA: ScreenerItem[] = [
  { id: '1', name: 'ALLEMAGNE', symbol: 'DAX 40', category: 'INDICES', avgPrice: 743.43, currentPrice: 843.5, quantity: 40.0, unrealizedPnL: 3123.0, pnlPercent: 0.43 },
  { id: '2', name: 'APPLE INC.', symbol: 'AAPL', category: 'ACTIONS', avgPrice: 175.2, currentPrice: 189.4, quantity: 25.0, unrealizedPnL: 355.0, pnlPercent: 8.1 },
  { id: '3', name: 'NVIDIA CORP.', symbol: 'NVDA', category: 'ACTIONS', avgPrice: 420.0, currentPrice: 495.2, quantity: 15.0, unrealizedPnL: 1128.0, pnlPercent: 17.9 },
  { id: '4', name: 'BITCOIN', symbol: 'BTC/USD', category: 'CRYPTO', avgPrice: 61200.0, currentPrice: 63432.5, quantity: 0.5, unrealizedPnL: 1116.25, pnlPercent: 3.64 },
  { id: '5', name: 'ETHEREUM', symbol: 'ETH/USD', category: 'CRYPTO', avgPrice: 3100.0, currentPrice: 3450.0, quantity: 2.0, unrealizedPnL: 700.0, pnlPercent: 11.29 },
  { id: '6', name: 'S&P 500', symbol: 'SPX', category: 'INDICES', avgPrice: 5120.0, currentPrice: 5349.1, quantity: 5.0, unrealizedPnL: 1145.5, pnlPercent: 4.47 },
];

export const ScreenerScreen: React.FC = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('TOUT');
  const [sortField, setSortField] = useState<SortField>('currentPrice');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const textPrimary = theme['colors_text_primary'] ?? '#0B0F19';

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    return INITIAL_SCREENER_DATA.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === 'TOUT' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = (a[sortField] as number) - (b[sortField] as number);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchQuery, selectedCategory, sortField, sortOrder]);

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme['colors_bg_primary'] ?? '#F8FAFC' },
      ]}
    >
      <TopMarketTickerBar />
      <AppHeader
        variant="authenticated"
        activeNavId="screener"
        onSelectNav={(id) => {
          if (id === 'markets') router.push('/');
          if (id === 'trade') router.push('/trade');
          if (id === 'screener') router.push('/screener');
        }}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onProfilePress={() => router.push('/user')}
      />

      <View style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={[styles.pageTitle, { color: textPrimary }]}>
            Tout les actions
          </Text>
        </View>

        <View style={styles.contentBlock}>
            {/* Onglets de filtrage rapide par classe d'actif */}
          <View style={styles.categoryTabs}>
            {(['TOUT', 'ACTIONS', 'CRYPTO', 'INDICES'] as AssetCategory[]).map(
              (cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryTab,
                      isActive && {
                        backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
                        borderColor: theme['colors_button_outline-border'] ?? '#D1D5DB',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryTabText,
                        {
                          color: isActive
                            ? textPrimary
                            : (theme['colors_text_secondary'] ?? '#9CA3AF'),
                          fontWeight: isActive ? '700' : '500',
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
            <ScreenerTable
            items={filteredAndSortedItems}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            />
        </View>
      </View>

      <AppFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  content: {
    width: '100%',
    marginHorizontal: 'auto',
    paddingVertical: 4,
    flex: 1,
    gap: 4,
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    gap: 4,
  },
  pageTitle: {
    fontSize: primitives['typography_font size_font-size-64'] ?? 64,
    lineHeight: primitives['typography_line height_line-height-64'] ?? 64,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentBlock: {
    flexDirection: 'column',
    height: '100%',
    flex: 1,
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    gap: 32,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabText: {
    fontSize: 13,
  },
});

export default ScreenerScreen;
