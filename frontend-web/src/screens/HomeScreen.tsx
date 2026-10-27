'use client';

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { useRouter } from 'next/navigation';

import { AppHeader, HeaderVariant } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { AuthSelectionScreen, AuthModalType } from '@/screens/AuthSelectionScreen';
import { TopMarketTickerBar } from '@/components/layout/TopMarketTickerBar';
import { MarketIndexCard } from '@/components/features/market/components/MarketIndexCard';
import { InteractiveMarketChart } from '@/components/features/market/components/InteractiveMarketChart';
import { CommoditiesAndCurrenciesWidget } from '@/components/features/market/components/CommoditiesAndCurrenciesWidget';
import { MarketOverviewTable } from '@/components/features/market/components/tables/MarketOverviewTable';
import { MarketOverviewRow } from '@/components/features/market/components/tables/MarketOverviewRow';
import { MarketHeatmapWidget } from '@/components/features/market/components/MarketHeatmapWidget';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';

const INDICES_DATA = [
  {
    countryOrCategory: 'ÉTATS-UNIS',
    indexName: 'S&P 500 ETF',
    symbol: 'SPY',
    points: 534.91,
    equivalentAmount: '534,91$',
    changePercent: 0.43,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NASDAQ 100 ETF',
    symbol: 'QQQ',
    points: 448.20,
    equivalentAmount: '448,20$',
    changePercent: 0.85,
  },
  {
    countryOrCategory: 'INDUSTRIE',
    indexName: 'DOW JONES ETF',
    symbol: 'DIA',
    points: 391.20,
    equivalentAmount: '391,20$',
    changePercent: -0.28,
  },
];

const STOCKS_DATA = [
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'APPLE',
    symbol: 'AAPL',
    points: 224.23,
    equivalentAmount: '224,23$',
    changePercent: 1.15,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'MICROSOFT',
    symbol: 'MSFT',
    points: 448.37,
    equivalentAmount: '448,37$',
    changePercent: -0.64,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NVIDIA',
    symbol: 'NVDA',
    points: 128.50,
    equivalentAmount: '128,50$',
    changePercent: 3.42,
  },
];

const CRYPTOS_DATA = [
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'BITCOIN',
    symbol: 'BTCUSDT',
    points: 63343.50,
    equivalentAmount: '63 343,50$',
    changePercent: 2.14,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'ETHEREUM',
    symbol: 'ETHUSDT',
    points: 2640.80,
    equivalentAmount: '2 640,80$',
    changePercent: -1.35,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'SOLANA',
    symbol: 'SOLUSDT',
    points: 152.40,
    equivalentAmount: '152,40$',
    changePercent: 4.80,
  },
];

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [activeTab, setActiveTab] = useState<string>('markets');
  const [search, setSearch] = useState<string>('');

  const { isAuthenticated } = useAuthStore();
  const headerVariant: HeaderVariant = isAuthenticated ? 'authenticated' : 'guest';

  const [selectedIndexSymbol, setSelectedIndexSymbol] = useState<string>('SPY');
  const currentSelected = INDICES_DATA.find((item) => item.symbol === selectedIndexSymbol) ?? INDICES_DATA[0];

  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('AAPL');
  const currentSelectedStock = STOCKS_DATA.find((item) => item.symbol === selectedStockSymbol) ?? STOCKS_DATA[0];

  const [showAuthSelection, setShowAuthSelection] = useState<boolean>(false);
  const [targetModal, setTargetModal] = useState<AuthModalType>(null);

  const handleAssetPress = (symbol: string) => {
    router.push(`/trade?symbol=${symbol}`);
  };

  const handleAuthSuccess = () => {
    setShowAuthSelection(false);
    setTargetModal(null);
  };

  const handleBackToHome = () => {
    setShowAuthSelection(false);
    setTargetModal(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors['colors_bg_primary'] }]}>
      {!showAuthSelection && <TopMarketTickerBar />}

      {!showAuthSelection && (
        <AppHeader
          variant={headerVariant}
          activeNavId={activeTab}
          searchValue={search}
          onSearchChange={setSearch}
          onLoginPress={() => router.push('/login')}
          onRegisterPress={() => router.push('/signup')}
          onProfilePress={() => router.push('/user')}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.mainContent}>
          {showAuthSelection ? (
            <AuthSelectionScreen
              initialModal={targetModal}
              onModalChange={setTargetModal}
              onAuthSuccess={handleAuthSuccess}
              onBack={handleBackToHome}
            />
          ) : (
            <View style={styles.container}>
              {/* Introduction */}
              <View
                style={[
                  styles.sectionHeaderIntro,
                  {
                    backgroundColor: colors['colors_bg_secondary'],
                    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
                    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.mainTitle,
                    {
                      color: colors['colors_text_primary'],
                      fontSize: primitives['typography_font size_font-size-64'] ?? 64,
                    },
                  ]}
                >
                  Les marchés
                </Text>
                <Text
                  style={[
                    styles.subTitle,
                    {
                      color: colors['colors_text_secondary'],
                      fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                    },
                  ]}
                >
                  Cotations en temps réel, analyses et flux de performance courantes.
                </Text>
              </View>

              {/* Section 1 : Indices */}
              <View
                style={[
                  styles.section,
                  {
                    backgroundColor: colors['colors_bg_secondary'],
                    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 16,
                    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                  },
                ]}
              >
                <Pressable onPress={() => router.push('/screener')} style={styles.sectionTitlePressable}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors['colors_text_primary'],
                        fontSize: primitives['typography_font size_font-size-48'] ?? 48,
                      },
                    ]}
                  >
                    Indices {'>'}
                  </Text>
                </Pressable>

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.indicesGrid}>
                    {INDICES_DATA.map((item, idx) => {
                      const isSelected = item.symbol === selectedIndexSymbol;
                      return (
                        <MarketIndexCard
                          key={`${item.symbol}-${idx}`}
                          countryOrCategory={item.countryOrCategory}
                          indexName={item.indexName}
                          symbol={item.symbol}
                          points={item.points}
                          equivalentAmount={item.equivalentAmount}
                          changePercent={item.changePercent}
                          cardType="index"
                          style={[
                            styles.cardFlex,
                            isSelected && {
                              borderWidth: 2,
                              borderColor: colors['colors_badge_primary-action-bg'],
                            },
                          ]}
                          onPress={() => setSelectedIndexSymbol(item.symbol)}
                        />
                      );
                    })}
                  </View>
                </ScrollView>

                <View style={styles.chartAndHeatmapRow}>
                  <View
                    style={[
                      styles.chartContainerCard,
                      {
                        backgroundColor: colors['colors_bg_secondary'],
                        borderColor: colors['colors_divider_text'],
                      },
                    ]}
                  >
                    <InteractiveMarketChart
                      key={`index-${selectedIndexSymbol}`}
                      symbol={selectedIndexSymbol}
                      changePercent={currentSelected.changePercent}
                      onFullscreenPress={() => handleAssetPress(selectedIndexSymbol)}
                    />
                  </View>

                  <View style={styles.heatmapColumn}>
                    <MarketHeatmapWidget
                      title="Principales participations"
                      onAssetPress={handleAssetPress}
                      onViewAllPress={() => router.push('/screener')}
                    />
                  </View>
                </View>
              </View>

              {/* Section 2 : Actions */}
              <View
                style={[
                  styles.section,
                  {
                    backgroundColor: colors['colors_bg_secondary'],
                    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 16,
                    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                  },
                ]}
              >
                <Pressable onPress={() => router.push('/screener')} style={styles.sectionTitlePressable}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors['colors_text_primary'],
                        fontSize: primitives['typography_font size_font-size-48'] ?? 48,
                      },
                    ]}
                  >
                    Actions {'>'}
                  </Text>
                </Pressable>

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.indicesGrid}>
                    {STOCKS_DATA.map((item, idx) => {
                      const isSelected = item.symbol === selectedStockSymbol;
                      return (
                        <MarketIndexCard
                          key={`${item.symbol}-${idx}`}
                          countryOrCategory={item.countryOrCategory}
                          indexName={item.indexName}
                          symbol={item.symbol}
                          points={item.points}
                          equivalentAmount={item.equivalentAmount}
                          changePercent={item.changePercent}
                          cardType="stock"
                          style={[
                            styles.cardFlex,
                            isSelected && {
                              borderWidth: 2,
                              borderColor: colors['colors_badge_primary-action-bg'],
                            },
                          ]}
                          onPress={() => setSelectedStockSymbol(item.symbol)}
                        />
                      );
                    })}
                  </View>
                </ScrollView>

                <View
                  style={[
                    styles.chartContainerCardFull,
                    {
                      backgroundColor: colors['colors_bg_secondary'],
                      borderColor: colors['colors_divider_text'],
                    },
                  ]}
                >
                  <InteractiveMarketChart
                    key={`stock-${selectedStockSymbol}`}
                    symbol={selectedStockSymbol}
                    changePercent={currentSelectedStock.changePercent}
                    onFullscreenPress={() => handleAssetPress(selectedStockSymbol)}
                  />
                </View>
              </View>

              {/* Section 3 : Cryptomonnaies */}
              <View
                style={[
                  styles.section,
                  {
                    backgroundColor: colors['colors_bg_secondary'],
                    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 16,
                    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                  },
                ]}
              >
                <Pressable onPress={() => router.push('/screener')} style={styles.sectionTitlePressable}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors['colors_text_primary'],
                        fontSize: primitives['typography_font size_font-size-48'] ?? 48,
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
                          volume24h="28,4 Mds $"
                        />
                      ))}
                    </MarketOverviewTable>
                  </View>

                  <CommoditiesAndCurrenciesWidget
                    title="Matières & Devises"
                    onAssetPress={handleAssetPress}
                    onViewAllPress={() => router.push('/screener')}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {!showAuthSelection && <AppFooter />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  container: {
    width: '100%',
    gap: 4,
  },
  sectionHeaderIntro: {},
  mainTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionTitlePressable: {
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subTitle: {},
  section: {
    gap: 16,
  },
  indicesGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  cardFlex: {
    flex: 1,
    minWidth: 445,
  },
  chartAndHeatmapRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
    width: '100%',
  },
  chartContainerCard: {
    flex: 1,
    height: 520,
    minWidth: 0,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  chartContainerCardFull: {
    width: '100%',
    height: 520,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  heatmapColumn: {
    flexShrink: 0,
    width: 400,
    minWidth: 0,
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

export default HomeScreen;
