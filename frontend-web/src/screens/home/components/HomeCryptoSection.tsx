// src/screens/home/components/HomeCryptoSection.tsx
'use client';

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { MarketOverviewTable } from '@/components/features/market/components/tables/MarketOverviewTable';
import { MarketOverviewRow } from '@/components/features/market/components/tables/MarketOverviewRow';
import { CommoditiesAndCurrenciesWidget } from '@/components/features/market/components/CommoditiesAndCurrenciesWidget';
import { useAppTheme } from '@/theme/ThemeContext';
import { CRYPTOS_DATA } from '../homeMarketData';

export interface HomeCryptoSectionProps {
  onSectionPress: () => void;
  onAssetPress: (symbol: string) => void;
  onViewAllPress: () => void;
}

const DEFAULT_CRYPTO_VOLUME_24H = '28,4 Mds $';

/**
 * Section Cryptomonnaies associant le tableau synthétique et le widget Matières & Devises.
 */
export const HomeCryptoSection: React.FC<HomeCryptoSectionProps> = ({
  onSectionPress,
  onAssetPress,
  onViewAllPress,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

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
          Cryptomonnaies {'>'}
        </Text>
      </Pressable>

      <View style={styles.cryptoRow}>
        <View style={styles.cryptoTableContainer}>
          <MarketOverviewTable>
            {CRYPTOS_DATA.map((crypto) => (
              <MarketOverviewRow
                key={crypto.symbol}
                countryOrCategory={crypto.countryOrCategory}
                name={crypto.indexName}
                symbol={crypto.symbol}
                price={crypto.equivalentAmount}
                changePercent={crypto.changePercent}
                volume24h={DEFAULT_CRYPTO_VOLUME_24H}
              />
            ))}
          </MarketOverviewTable>
        </View>

        <CommoditiesAndCurrenciesWidget
          title="Matières & Devises"
          onAssetPress={onAssetPress}
          onViewAllPress={onViewAllPress}
        />
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
  cryptoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
    width: '100%',
  },
  cryptoTableContainer: {
    flex: 1,
    flexBasis: 0,
    minWidth: 680,
  },
});
