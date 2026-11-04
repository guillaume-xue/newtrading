'use client';

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';

import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { PercentageBadge } from '@/components/ui/PercentageBadge';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme/ThemeContext';

export interface ScreenerItem {
  id: string;
  name: string;
  symbol: string;
  category: 'ACTIONS' | 'CRYPTO' | 'INDICES';
  avgPrice: number;
  currentPrice: number;
  quantity: number;
  unrealizedPnL: number;
  pnlPercent: number;
}

export type SortField = 'name' | 'currentPrice' | 'pnlPercent' | 'unrealizedPnL';
export type SortOrder = 'asc' | 'desc';

interface ScreenerTableProps {
  items: ScreenerItem[];
  isLoading?: boolean;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
}

export const ScreenerTable: React.FC<ScreenerTableProps> = ({
  items,
  isLoading = false,
  sortField,
  sortOrder,
  onSort,
}) => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors } = theme;

  const textPrimary = colors['colors_text_primary'];
  const textMuted = colors['colors_text_secondary'];
  const borderColor = colors['colors_divider_text'];

  const formatPrice = (val: number) =>
    `${val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

  const formatCurrencyPnL = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return <Text style={[styles.sortIndicator, { color: textPrimary }]}>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</Text>;
  };

  return (
    <View style={styles.tableWrapper}>
      {/* 1. En-tête des colonnes */}
      <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
        <Pressable
          onPress={() => onSort?.('name')}
          style={[styles.headerCell, styles.colAsset]}
        >
          <Text style={[styles.headerText, { color: textPrimary }]}>
            ACTIF / TICKER{renderSortIndicator('name')}
          </Text>
        </Pressable>

        <View style={[styles.headerCell, styles.colPru]}>
          <Text style={[styles.headerText, { color: textPrimary }]}>
            PRIX MOYEN (PRU)
          </Text>
        </View>

        <Pressable
          onPress={() => onSort?.('currentPrice')}
          style={[styles.headerCell, styles.colCurrentPrice]}
        >
          <Text style={[styles.headerText, { color: textPrimary }]}>
            COURS ACTUEL{renderSortIndicator('currentPrice')}
          </Text>
        </Pressable>

        <View style={[styles.headerCell, styles.colValuation]}>
          <Text style={[styles.headerText, { color: textPrimary }]}>
            QUANTITÉ / VALORISATION
          </Text>
        </View>

        <Pressable
          onPress={() => onSort?.('unrealizedPnL')}
          style={[styles.headerCell, styles.colPnlDollar]}
        >
          <Text style={[styles.headerText, { color: textPrimary }]}>
            P&L NON RÉALISÉ ($){renderSortIndicator('unrealizedPnL')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onSort?.('pnlPercent')}
          style={[styles.headerCell, styles.colPnlPercent]}
        >
          <Text style={[styles.headerText, { color: textPrimary }]}>
            P&L (%){renderSortIndicator('pnlPercent')}
          </Text>
        </Pressable>

        <View style={[styles.headerCell, styles.colAction]}>
          <Text style={[styles.headerText, { color: textPrimary }]}>ACTION</Text>
        </View>
      </View>

      {/* 2. État de chargement Skeleton */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <View
              key={idx}
              style={[
                styles.skeletonRow,
                {
                  backgroundColor: colors['colors_bg_primary'],
                  borderBottomColor: borderColor,
                },
              ]}
            />
          ))}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: textMuted }]}>
            Aucun actif ne correspond à votre recherche.
          </Text>
        </View>
      ) : (
        /* 3. Lignes de données */
        items.map((item) => {
          const totalValuation = item.quantity * item.currentPrice;
          const isPositivePnL = item.unrealizedPnL >= 0;
          const pnlColor = isPositivePnL
            ? colors['colors_badge_up']
            : colors['colors_badge_down'];

          return (
            <View
              key={item.id}
              style={[styles.dataRow, { borderBottomColor: borderColor }]}
            >
              {/* ACTIF / TICKER */}
              <View style={[styles.cell, styles.colAsset]}>
                <MarketTickerInfo
                  title={item.name}
                  subtitle={item.symbol}
                  size="md"
                  emphasis="title"
                  iconBoxStyle={styles.tickerIconBox}
                />
              </View>

              {/* PRIX MOYEN (PRU) */}
              <View style={[styles.cell, styles.colPru]}>
                <Text style={[styles.numericValue, { color: textPrimary }]}>
                  {formatPrice(item.avgPrice)}
                </Text>
              </View>

              {/* COURS ACTUEL */}
              <View style={[styles.cell, styles.colCurrentPrice]}>
                <Text style={[styles.numericValue, { color: textPrimary }]}>
                  {formatPrice(item.currentPrice)}
                </Text>
              </View>

              {/* QUANTITÉ / VALORISATION */}
              <View style={[styles.cell, styles.colValuation]}>
                <Text style={[styles.numericValue, { color: textPrimary }]}>
                  {formatPrice(totalValuation)}
                </Text>
                <Text style={[styles.subText, { color: textMuted }]}>
                  {item.quantity.toLocaleString('fr-FR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{' '}
                  Actions
                </Text>
              </View>

              {/* P&L NON RÉALISÉ ($) */}
              <View style={[styles.cell, styles.colPnlDollar]}>
                <Text style={[styles.numericValue, { color: pnlColor }]}>
                  {formatCurrencyPnL(item.unrealizedPnL)}
                </Text>
              </View>

              {/* P&L (%) */}
              <View style={[styles.cell, styles.colPnlPercent]}>
                <PercentageBadge
                  value={item.pnlPercent}
                  style={styles.badgeOverride}
                />
              </View>

              {/* ACTION */}
              <View style={[styles.cell, styles.colAction]}>
                <Button
                  label="Gérer"
                  variant="outline"
                  shape="rounded"
                  size="sm"
                  onPress={() =>
                    router.push(`/trade?symbol=${encodeURIComponent(item.symbol)}`)
                  }
                  labelStyle={{
                    color: textPrimary,
                    fontWeight: '600',
                  }}
                  style={[
                    styles.actionBtn,
                    {
                      borderColor: colors['colors_button_outline-border'],
                      backgroundColor: colors['colors_button_ghost'],
                    },
                  ]}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tableWrapper: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  sortIndicator: {
    fontSize: 10,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  cell: {
    justifyContent: 'center',
  },
  colAsset: {
    flex: 2.2,
    flexBasis: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 0,
  },
  tickerIconBox: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    width: 32,
    height: 32,
    marginRight: 10,
  },
  colPru: {
    flex: 1.5,
    flexBasis: 0,
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  colCurrentPrice: {
    flex: 1.5,
    flexBasis: 0,
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  colValuation: {
    flex: 2.0,
    flexBasis: 0,
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  colPnlDollar: {
    flex: 1.6,
    flexBasis: 0,
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  colPnlPercent: {
    flex: 1.2,
    flexBasis: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colAction: {
    flex: 1.0,
    flexBasis: 0,
    alignItems: 'flex-end',
    paddingRight: 0,
  },
  numericValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  subText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  badgeOverride: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionBtn: {
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  skeletonContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  skeletonRow: {
    width: '100%',
    height: 52,
    borderRadius: 4,
    borderBottomWidth: 1,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default ScreenerTable;
