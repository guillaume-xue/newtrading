// screens/HomeScreen.tsx
'use client';

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, useColorScheme } from 'react-native';
import { useRouter } from 'next/navigation';

import { AppHeader, HeaderVariant } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { AuthSelectionScreen, AuthModalType } from '@/screens/AuthSelectionScreen';
import { TopMarketTickerBar } from '@/components/features/market/components/TopMarketTickerBar';
import { MarketIndexCard } from '@/components/features/market/components/MarketIndexCard';
import { InteractiveMarketChart } from '@/components/features/market/components/InteractiveMarketChart';
import { CommoditiesAndCurrenciesWidget } from '@/components/features/market/components/CommoditiesAndCurrenciesWidget';
import { MarketOverviewTable } from '@/components/features/market/components/tables/MarketOverviewTable';
import { MarketOverviewRow } from '@/components/features/market/components/tables/MarketOverviewRow';
import { MarketHeatmapWidget } from '@/components/features/market/components/MarketHeatmapWidget';
import { WidgetHeader } from '@/components/ui/WidgetHeader';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [activeTab, setActiveTab] = useState<string>('markets');
  const [search, setSearch] = useState<string>('');
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>('guest');

  const [showAuthSelection, setShowAuthSelection] = useState<boolean>(false);
  const [targetModal, setTargetModal] = useState<AuthModalType>(null);

  const handleSelectNav = (id: string) => {
    if (id === 'trade') {
      router.push('/trade');
      return;
    }
    setActiveTab(id);
  };

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
    setHeaderVariant('authenticated');
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
          onSelectNav={handleSelectNav}
          searchValue={search}
          onSearchChange={setSearch}
          onLoginPress={handleLoginPress}
          onRegisterPress={handleRegisterPress}
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
                <WidgetHeader title="Indices >" />
                <ScrollView  horizontal={true} showsHorizontalScrollIndicator={false} >
                  <View style={styles.indicesGrid}>
                    <MarketIndexCard
                      countryOrCategory="ALLEMAGNE"
                      indexName="DAX 40"
                      symbol="DAX40"
                      points={18321.12}
                      equivalentAmount="2 283,10$"
                      changePercent={0.43}
                      cardType="index"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="FRANCE"
                      indexName="CAC 40"
                      symbol="CAC40"
                      points={7632.40}
                      equivalentAmount="954,30$"
                      changePercent={-0.12}
                      cardType="index"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="ÉTATS-UNIS"
                      indexName="S&P 500"
                      symbol="SPX"
                      points={5349.10}
                      equivalentAmount="5 349,10$"
                      changePercent={-0.43}
                      cardType="index"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="ÉTATS-UNIS"
                      indexName="S&P 500"
                      symbol="SPX"
                      points={5349.10}
                      equivalentAmount="5 349,10$"
                      changePercent={-0.43}
                      cardType="index"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="ÉTATS-UNIS"
                      indexName="S&P 500"
                      symbol="SPX"
                      points={5349.10}
                      equivalentAmount="5 349,10$"
                      changePercent={-0.43}
                      cardType="index"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="ÉTATS-UNIS"
                      indexName="S&P 500"
                      symbol="SPX"
                      points={5349.10}
                      equivalentAmount="5 349,10$"
                      changePercent={-0.43}
                      cardType="index"
                      style={styles.cardFlex}
                    />
                  </View>
                </ScrollView>

                {/* Graphique global & Heatmap */}
                <View style={styles.chartAndHeatmapRow}>
                  <View style={styles.chartContainerCard}>
                    <InteractiveMarketChart symbol="DAX40" />
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
                <WidgetHeader title="Action >" />
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  <View style={styles.indicesGrid}>
                    <MarketIndexCard
                      countryOrCategory="TECHNOLOGIE"
                      indexName="NASDAQ"
                      symbol="NDX"
                      points={18240.20}
                      equivalentAmount="18 240,20$"
                      changePercent={0.85}
                      cardType="stock"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="INDUSTRIE"
                      indexName="DOW JONES"
                      symbol="DJI"
                      points={39120.00}
                      equivalentAmount="39 120,00$"
                      changePercent={-0.28}
                      cardType="stock"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="INDUSTRIE"
                      indexName="DOW JONES"
                      symbol="DJI"
                      points={39120.00}
                      equivalentAmount="39 120,00$"
                      changePercent={-0.28}
                      cardType="stock"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="INDUSTRIE"
                      indexName="DOW JONES"
                      symbol="DJI"
                      points={39120.00}
                      equivalentAmount="39 120,00$"
                      changePercent={-0.28}
                      cardType="stock"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="INDUSTRIE"
                      indexName="DOW JONES"
                      symbol="DJI"
                      points={39120.00}
                      equivalentAmount="39 120,00$"
                      changePercent={-0.28}
                      cardType="stock"
                      style={styles.cardFlex}
                    />
                    <MarketIndexCard
                      countryOrCategory="INDUSTRIE"
                      indexName="DOW JONES"
                      symbol="DJI"
                      points={39120.00}
                      equivalentAmount="39 120,00$"
                      changePercent={-0.28}
                      cardType="stock"
                      style={styles.cardFlex}
                    />
                  </View>
                </ScrollView>
                <View style={styles.chartContainerCard}>
                  <InteractiveMarketChart symbol="NDX" />
                </View>
              </View>

              {/* Section 3 : Cryptomonnaies */}
              <View style={styles.section}>
                <WidgetHeader title="Cryptomonnaies >" />
                <View style={styles.cryptoRow}>
                  <View style={styles.cryptoTableContainer}>
                    <MarketOverviewTable>
                      <MarketOverviewRow
                        countryOrCategory="ALLEMAGNE"
                        name="DAX 40"
                        symbol="DAX40"
                        price="63 343,50 $"
                        changePercent={-0.43}
                        volume24h="28,4 Mds $"
                      />
                      <MarketOverviewRow
                        countryOrCategory="ALLEMAGNE"
                        name="DAX 40"
                        symbol="DAX40"
                        price="63 343,50 $"
                        changePercent={-0.43}
                        volume24h="28,4 Mds $"
                      />
                      <MarketOverviewRow
                        countryOrCategory="ALLEMAGNE"
                        name="DAX 40"
                        symbol="DAX40"
                        price="63 343,50 $"
                        changePercent={-0.43}
                        volume24h="28,4 Mds $"
                      />
                      <MarketOverviewRow
                        countryOrCategory="ALLEMAGNE"
                        name="DAX 40"
                        symbol="DAX40"
                        price="63 343,50 $"
                        changePercent={-0.43}
                        volume24h="28,4 Mds $"
                      />
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
    fontSize: primitives['typography_font size_font-size-24'] ?? 24,
    fontWeight: '800',
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
    minWidth: 400,
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
    minWidth: 0,
  },

});

export default HomeScreen;
