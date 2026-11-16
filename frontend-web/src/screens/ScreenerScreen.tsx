'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { TopMarketTickerBar } from '@/components/layout/TopMarketTickerBar';
import {
  ScreenerTable,
  ScreenerItem,
  SortField,
  SortOrder,
} from '@/components/features/market/components/tables/ScreenerTable';
import { fetchScreenerData } from '@/lib/api/marketApi';
import { useAppTheme } from '@/theme/ThemeContext';

type AssetCategory = 'TOUT' | 'ACTIONS' | 'CRYPTO' | 'INDICES';
const CATEGORIES: AssetCategory[] = ['TOUT', 'ACTIONS', 'CRYPTO', 'INDICES'];

export const ScreenerScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [screenerData, setScreenerData] = useState<ScreenerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('TOUT');
  const [sortField, setSortField] = useState<SortField>('currentPrice');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const textPrimary = colors['colors_text_primary'];
  const textSecondary = colors['colors_text_secondary'];
  const bgCard = colors['colors_bg_secondary'];
  const borderCard = colors['colors_divider_text'];

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const data = await fetchScreenerData();
        if (isMounted) {
          const formattedItems: ScreenerItem[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            symbol: item.symbol,
            category: item.category as any,
            currentPrice: item.currentPrice,
            avgPrice: item.currentPrice,
            quantity: 0,
            unrealizedPnL: item.change ?? 0,
            pnlPercent: item.changePercent ?? 0,
          }));
          setScreenerData(formattedItems);
        }
      } catch (err) {
        console.error('Erreur chargement screener :', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    return screenerData
      .filter((item) => selectedCategory === 'TOUT' || item.category === selectedCategory)
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else {
          comparison = (a[sortField] as number) - (b[sortField] as number);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [screenerData, selectedCategory, sortField, sortOrder]);

  return (
    <View style={[styles.screen, { backgroundColor: colors['colors_bg_primary'] }]}>
      <TopMarketTickerBar />
      <AppHeader />

      <View style={styles.content}>
        <View
          style={[
            styles.headerBlock,
            {
              backgroundColor: bgCard,
              borderColor: borderCard,
              padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            },
          ]}
        >
          <Text
            style={[
              styles.pageTitle,
              {
                color: textPrimary,
                fontSize: primitives['typography_font size_font-size-64'] ?? 64,
                lineHeight: primitives['typography_line height_line-height-64'] ?? 64,
              },
            ]}
          >
            Toutes les actions
          </Text>
        </View>

        <View
          style={[
            styles.contentBlock,
            {
              backgroundColor: bgCard,
              borderColor: borderCard,
              padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            },
          ]}
        >
          <View style={styles.categoryTabs}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryTab,
                    isActive && {
                      backgroundColor: colors['colors_bg_primary'],
                      borderColor: colors['colors_button_outline-border'],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      {
                        color: isActive ? textPrimary : textSecondary,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {loading && screenerData.length === 0 ? (
            <ActivityIndicator size="large" color={colors['colors_button_primary']} />
          ) : (
            <ScreenerTable
              items={filteredAndSortedItems}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    width: '100%',
    paddingVertical: 4,
    flex: 1,
    gap: 4,
  },
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  contentBlock: {
    flexDirection: 'column',
    flex: 1,
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
