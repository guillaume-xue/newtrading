// src/screens/HomeScreen.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'next/navigation';

import { AuthModalType } from '@/screens/AuthSelectionScreen';
import { MarketHeatmapWidget } from '@/components/features/market/components/MarketHeatmapWidget';
import { useAppTheme } from '@/theme/ThemeContext';

import { INDICES_DATA, STOCKS_DATA } from './home/homeMarketData';
import { HomePageShell } from './home/components/HomePageShell';
import { HomeMarketSection } from './home/components/HomeMarketSection';
import { HomeCryptoSection } from './home/components/HomeCryptoSection';

/**
 * Écran d'accueil (Marchés) : présente la synthèse des indices,
 * des actions principales, des cryptomonnaies et les widgets associés.
 */
export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [activeTab] = useState<string>('markets');
  const [search, setSearch] = useState<string>('');

  const [selectedIndexSymbol, setSelectedIndexSymbol] = useState<string>(INDICES_DATA[0].symbol);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(STOCKS_DATA[0].symbol);

  const [showAuthSelection, setShowAuthSelection] = useState<boolean>(false);
  const [targetModal, setTargetModal] = useState<AuthModalType>(null);

  const handleAssetPress = useCallback(
    (symbol: string) => {
      router.push(`/trade?symbol=${encodeURIComponent(symbol)}`);
    },
    [router]
  );

  const handleNavigateScreener = useCallback(() => {
    router.push('/screener');
  }, [router]);

  const handleNavigateLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleNavigateSignup = useCallback(() => {
    router.push('/signup');
  }, [router]);

  const handleNavigateProfile = useCallback(() => {
    router.push('/user');
  }, [router]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthSelection(false);
    setTargetModal(null);
  }, []);

  const handleBackToHome = useCallback(() => {
    setShowAuthSelection(false);
    setTargetModal(null);
  }, []);

  const introPadding = primitives['spacing & layout_padding & margin_space-16'] ?? 64;
  const introRadius = primitives['spacing & layout_border radius_radius-md'] ?? 8;
  const mainTitleSize = primitives['typography_font size_font-size-64'] ?? 64;
  const subTitleSize = primitives['typography_font size_font-size-14'] ?? 14;

  return (
    <HomePageShell
      activeNavId={activeTab}
      searchValue={search}
      onSearchChange={setSearch}
      onLoginPress={handleNavigateLogin}
      onRegisterPress={handleNavigateSignup}
      onProfilePress={handleNavigateProfile}
      showAuthSelection={showAuthSelection}
      targetModal={targetModal}
      onModalChange={setTargetModal}
      onAuthSuccess={handleAuthSuccess}
      onBackFromAuth={handleBackToHome}
    >
      <View style={styles.container}>
        {/* En-tête introductif */}
        <View
          style={[
            styles.sectionHeaderIntro,
            {
              backgroundColor: colors['colors_bg_secondary'],
              padding: introPadding,
              borderRadius: introRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.mainTitle,
              {
                color: colors['colors_text_primary'],
                fontSize: mainTitleSize,
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
                fontSize: subTitleSize,
              },
            ]}
          >
            Cotations en temps réel, analyses et flux de performance courantes.
          </Text>
        </View>

        {/* Section 1 : Indices + Heatmap */}
        <HomeMarketSection
          title="Indices"
          items={INDICES_DATA}
          selectedSymbol={selectedIndexSymbol}
          onSelectSymbol={setSelectedIndexSymbol}
          cardType="index"
          chartKeyPrefix="index"
          onSectionPress={handleNavigateScreener}
          onFullscreenAsset={handleAssetPress}
          rightSlot={
            <MarketHeatmapWidget
              title="Principales participations"
              onAssetPress={handleAssetPress}
              onViewAllPress={handleNavigateScreener}
            />
          }
        />

        {/* Section 2 : Actions */}
        <HomeMarketSection
          title="Actions"
          items={STOCKS_DATA}
          selectedSymbol={selectedStockSymbol}
          onSelectSymbol={setSelectedStockSymbol}
          cardType="stock"
          chartKeyPrefix="stock"
          onSectionPress={handleNavigateScreener}
          onFullscreenAsset={handleAssetPress}
        />

        {/* Section 3 : Cryptomonnaies + Matières & Devises */}
        <HomeCryptoSection
          onSectionPress={handleNavigateScreener}
          onAssetPress={handleAssetPress}
          onViewAllPress={handleNavigateScreener}
        />
      </View>
    </HomePageShell>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 4,
  },
  sectionHeaderIntro: {},
  mainTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subTitle: {},
});

export default HomeScreen;
