// screens/TradeScreen.tsx
'use client';

import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

import { AppHeader } from '@/components/layout/AppHeader';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';

interface TradeScreenProps {
  onBackToHome?: () => void;
}

export const TradeScreen: React.FC<TradeScreenProps> = ({ onBackToHome }) => {
  const scheme = useColorScheme();
  const themeMode = scheme === 'dark' ? 'dark' : 'light';
  const theme = themeMode === 'dark' ? darkColors : lightColors;

  const [symbol, setSymbol] = useState<string>('BTC/USD');
  const [searchValue, setSearchValue] = useState<string>('BTC/USD');

  const handleSearchSubmit = (text: string) => {
    setSearchValue(text);
    if (text.trim().length > 0) {
      setSymbol(text.trim().toUpperCase());
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors_bg_primary ?? '#0B0F19' },
      ]}
    >
      {/* 1. Header en variante 'chart' avec outils (1D, stats, alarme, liquidités) */}
      <AppHeader
        variant="chart"
        searchValue={searchValue}
        onSearchChange={handleSearchSubmit}
        cashAmount="100 000,00 $"
        onAlertPress={() => console.log('Ouvrir modal alerte')}
        onSettingsPress={() => console.log('Paramètres')}
        onNotificationsPress={() => console.log('Notifications')}
        onProfilePress={() => console.log('Profil')}
      />

      {/* 2. Zone principale : Graphique de trading */}
      <View style={styles.chartWrapper}>
        <TradingChart symbol={symbol} themeMode={themeMode} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // @ts-ignore
    height: '100vh',
    // @ts-ignore
    maxHeight: '100vh',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  chartWrapper: {
    width: '100%',
    // @ts-ignore
    height: 'calc(100vh - 64px)', // 64px = hauteur exacte de AppHeader
    position: 'relative',
    overflow: 'hidden',
  },
});

export default TradeScreen;
