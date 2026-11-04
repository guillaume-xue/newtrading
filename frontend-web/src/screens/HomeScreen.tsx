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
    points: 580.40,
    equivalentAmount: '580,40$',
    changePercent: 0.43,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NASDAQ 100 ETF',
    symbol: 'QQQ',
    points: 495.20,
    equivalentAmount: '495,20$',
    changePercent: 0.85,
  },
  {
    countryOrCategory: 'INDUSTRIE',
    indexName: 'DOW JONES ETF',
    symbol: 'DIA',
    points: 425.10,
    equivalentAmount: '425,10$',
    changePercent: -0.28,
  },
  {
    countryOrCategory: 'PETITES CAP.',
    indexName: 'RUSSELL 2000 ETF',
    symbol: 'IWM',
    points: 220.50,
    equivalentAmount: '220,50$',
    changePercent: 0.62,
  },
  {
    countryOrCategory: 'ÉMERGENTS',
    indexName: 'MSCI EMERGING ETF',
    symbol: 'EEM',
    points: 44.50,
    equivalentAmount: '44,50$',
    changePercent: -0.35,
  },
  {
    countryOrCategory: 'EUROPE',
    indexName: 'FTSE EUROPE ETF',
    symbol: 'VGK',
    points: 70.15,
    equivalentAmount: '70,15$',
    changePercent: 0.18,
  },
  {
    countryOrCategory: 'JAPON',
    indexName: 'MSCI JAPAN ETF',
    symbol: 'EWJ',
    points: 72.30,
    equivalentAmount: '72,30$',
    changePercent: 0.54,
  },
  {
    countryOrCategory: 'VOLATILITÉ',
    indexName: 'VIX SHORT-TERM',
    symbol: 'VIXY',
    points: 13.50,
    equivalentAmount: '13,50$',
    changePercent: -1.82,
  },
  {
    countryOrCategory: 'MATIÈRES PREM.',
    indexName: 'GOLD SHARES ETF',
    symbol: 'GLD',
    points: 250.20,
    equivalentAmount: '250,20$',
    changePercent: 0.38,
  },
  {
    countryOrCategory: 'OBLIGATIONS',
    indexName: 'TREASURY 20+ YR',
    symbol: 'TLT',
    points: 93.10,
    equivalentAmount: '93,10$',
    changePercent: -0.15,
  },
];

const STOCKS_DATA = [
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'APPLE',
    symbol: 'AAPL',
    points: 230.15,
    equivalentAmount: '230,15$',
    changePercent: 1.15,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NVIDIA',
    symbol: 'NVDA',
    points: 140.25,
    equivalentAmount: '140,25$',
    changePercent: 3.42,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'MICROSOFT',
    symbol: 'MSFT',
    points: 430.50,
    equivalentAmount: '430,50$',
    changePercent: -0.64,
  },
  {
    countryOrCategory: 'CONSOMMATION',
    indexName: 'AMAZON',
    symbol: 'AMZN',
    points: 190.80,
    equivalentAmount: '190,80$',
    changePercent: 0.72,
  },
  {
    countryOrCategory: 'COMMUNICATION',
    indexName: 'ALPHABET (GOOGLE)',
    symbol: 'GOOGL',
    points: 170.40,
    equivalentAmount: '170,40$',
    changePercent: 0.45,
  },
  {
    countryOrCategory: 'COMMUNICATION',
    indexName: 'META PLATFORMS',
    symbol: 'META',
    points: 585.30,
    equivalentAmount: '585,30$',
    changePercent: 1.88,
  },
  {
    countryOrCategory: 'AUTOMOBILE',
    indexName: 'TESLA',
    symbol: 'TSLA',
    points: 220.60,
    equivalentAmount: '220,60$',
    changePercent: -1.24,
  },
  {
    countryOrCategory: 'FINANCE',
    indexName: 'BERKSHIRE HATHAWAY',
    symbol: 'BRK.B',
    points: 450.10,
    equivalentAmount: '450,10$',
    changePercent: 0.22,
  },
  {
    countryOrCategory: 'SEMICONDUCTEURS',
    indexName: 'BROADCOM',
    symbol: 'AVGO',
    points: 180.35,
    equivalentAmount: '180,35$',
    changePercent: 2.10,
  },
  {
    countryOrCategory: 'FINANCE',
    indexName: 'JPMORGAN CHASE',
    symbol: 'JPM',
    points: 225.40,
    equivalentAmount: '225,40$',
    changePercent: 0.58,
  },
];

const CRYPTOS_DATA = [
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'BITCOIN',
    symbol: 'BTCUSDT',
    points: 65000.00,
    equivalentAmount: '65 000,00$',
    changePercent: 2.14,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'ETHEREUM',
    symbol: 'ETHUSDT',
    points: 3500.00,
    equivalentAmount: '3 500,00$',
    changePercent: -1.35,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'SOLANA',
    symbol: 'SOLUSDT',
    points: 145.00,
    equivalentAmount: '145,00$',
    changePercent: 4.80,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'BINANCE COIN',
    symbol: 'BNBUSDT',
    points: 580.00,
    equivalentAmount: '580,00$',
    changePercent: 1.25,
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
                      disableZoom={true}
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
                    disableZoom={true}
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
