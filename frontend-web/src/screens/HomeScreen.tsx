// screens/HomeScreen.tsx
'use client';

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, useColorScheme } from 'react-native';
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
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

const INDICES_DATA = [
  {
    countryOrCategory: 'ALLEMAGNE',
    indexName: 'DAX 40',
    symbol: 'DAX40',
    points: 18321.12,
    equivalentAmount: '2 283,10$',
    changePercent: 0.43,
  },
  {
    countryOrCategory: 'FRANCE',
    indexName: 'CAC 40',
    symbol: 'CAC40',
    points: 7632.40,
    equivalentAmount: '954,30$',
    changePercent: -0.12,
  },
  {
    countryOrCategory: 'ÉTATS-UNIS',
    indexName: 'S&P 500',
    symbol: 'SPX',
    points: 5349.10,
    equivalentAmount: '5 349,10$',
    changePercent: -0.43,
  },
];

const STOCKS_DATA = [
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NASDAQ',
    symbol: 'NDX',
    points: 18240.20,
    equivalentAmount: '18 240,20$',
    changePercent: 0.85,
  },
  {
    countryOrCategory: 'INDUSTRIE',
    indexName: 'DOW JONES',
    symbol: 'DJI',
    points: 39120.00,
    equivalentAmount: '39 120,00$',
    changePercent: -0.28,
  },
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
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'BINANCE COIN',
    symbol: 'BNBUSDT',
    points: 585.10,
    equivalentAmount: '585,10$',
    changePercent: -0.62,
  },
];

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [activeTab, setActiveTab] = useState<string>('markets');
  const [search, setSearch] = useState<string>('');

  const { isAuthenticated } = useAuthStore();
  const headerVariant: HeaderVariant = isAuthenticated ? 'authenticated' : 'guest';

  const [selectedIndexSymbol, setSelectedIndexSymbol] = useState<string>('DAX40');
  const currentSelected = INDICES_DATA.find((item) => item.symbol === selectedIndexSymbol);

  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('NDX');
  const currentSelectedStock = STOCKS_DATA.find((item) => item.symbol === selectedStockSymbol);

  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState<string>('BTCUSDT');
  const currentSelectedCrypto = CRYPTOS_DATA.find((item) => item.symbol === selectedCryptoSymbol);

  const [showAuthSelection, setShowAuthSelection] = useState<boolean>(false);
  const [targetModal, setTargetModal] = useState<AuthModalType>(null);

  const handleAssetPress = (symbol: string) => {
    router.push(`/trade?symbol=${symbol}`);
  };

  const handleLoginPress = () => {
    setTargetModal('login');
    setShowAuthSelection(true);
  };

  const handleRegisterPress = () => {
    setTargetModal('signup');
    setShowAuthSelection(true);
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
    <View
      style={[
        styles.screen,
        { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
      ]}
    >
      {/* Barre supérieure de cotations rapides sous le header */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
              {/* Introduction de la page */}
              <View style={styles.sectionHeaderIntro}>
                <Text style={[styles.mainTitle, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
                  Les marchés
                </Text>
                <Text style={[styles.subTitle, { color: theme['colors_text_secondary'] ?? '#64748B' }]}>
                  Cotations en temps réel, analyses et flux de performance courantes.
                </Text>
              </View>

              {/* Section 1 : Indices */}
              <View style={styles.section}>
                <Pressable onPress={() => router.push('/screener')} style={styles.sectionTitlePressable}>
                  <Text style={[styles.sectionTitle, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
                    Indices {'>'}
                  </Text>
                </Pressable>

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.indicesGrid}>
                    {INDICES_DATA.map((item, idx) => (
                      <MarketIndexCard
                        key={`${item.symbol}-${idx}`}
                        countryOrCategory={item.countryOrCategory}
                        indexName={item.indexName}
                        symbol={item.symbol}
                        points={item.points}
                        equivalentAmount={item.equivalentAmount}
                        changePercent={item.changePercent}
                        cardType="index"
                        style={styles.cardFlex}
                        onPress={() => setSelectedIndexSymbol(item.symbol)}
                      />
                    ))}
                  </View>
                </ScrollView>

                {/* Graphique global & Heatmap */}
                <View style={styles.chartAndHeatmapRow}>
                  <View style={styles.chartContainerCard}>
                    <InteractiveMarketChart
                      symbol={selectedIndexSymbol}
                      changePercent={currentSelected?.changePercent}
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
              <View style={styles.section}>
                <Pressable onPress={() => router.push('/screener')} style={styles.sectionTitlePressable}>
                  <Text style={[styles.sectionTitle, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
                    Actions {'>'}
                  </Text>
                </Pressable>

                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.indicesGrid}>
                    {STOCKS_DATA.map((item, idx) => (
                      <MarketIndexCard
                        key={`${item.symbol}-${idx}`}
                        countryOrCategory={item.countryOrCategory}
                        indexName={item.indexName}
                        symbol={item.symbol}
                        points={item.points}
                        equivalentAmount={item.equivalentAmount}
                        changePercent={item.changePercent}
                        cardType="stock"
                        style={styles.cardFlex}
                        onPress={() => setSelectedStockSymbol(item.symbol)}
                      />
                    ))}
                  </View>
                </ScrollView>
                <View style={styles.chartContainerCard}>
                  <InteractiveMarketChart
                    symbol={selectedStockSymbol}
                    changePercent={currentSelectedStock?.changePercent}
                  />
                </View>
              </View>

              {/* Section 3 : Cryptomonnaies */}
              <View style={styles.section}>
                <Pressable onPress={() => router.push('/screener')} style={styles.sectionTitlePressable}>
                  <Text style={[styles.sectionTitle, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
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
  sectionHeaderIntro: {
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
  },
  mainTitle: {
    fontSize: primitives['typography_font size_font-size-64'] ?? 64,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionTitlePressable: {
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  sectionTitle: {
    fontSize: primitives['typography_font size_font-size-48'] ?? 48,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
  },
  section: {
    gap: 16,
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 16,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
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
    overflow: 'hidden',
  },
  chartContainerCard: {
    flex: 1,
    flexBasis: 0,
    height: 520,
    minWidth: 0,
    minHeight: 520,
    overflow: 'hidden',
    padding: 8,
  },
  heatmapColumn: {
    flexShrink: 0,
    overflow: 'hidden',
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
