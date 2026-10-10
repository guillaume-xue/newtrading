// screens/TradeScreen.tsx
'use client';

import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';

import { AppHeader } from '@/components/layout/AppHeader';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { ChartToolbar, ChartTool } from '@/components/features/market/components/ChartToolbar';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';

// Modèle temporaire pour matérialiser les positions sur le graphique
export interface PositionItem {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  takeProfit?: number;
  stopLoss?: number;
}

interface TradeScreenProps {
  onBackToHome?: () => void;
}

export const TradeScreen: React.FC<TradeScreenProps> = ({ onBackToHome }) => {
  const scheme = useColorScheme();
  const themeMode = scheme === 'dark' ? 'dark' : 'light';
  const theme = themeMode === 'dark' ? darkColors : lightColors;

  const [symbol, setSymbol] = useState<string>('BTC/USD');
  const [searchValue, setSearchValue] = useState<string>('BTC/USD');

  // Gestion des outils d'analyse et annotations (Issue 19)
  const [activeTool, setActiveTool] = useState<ChartTool>('cursor');
  const [showPositions, setShowPositions] = useState<boolean>(true);
  const [hasDrawings, setHasDrawings] = useState<boolean>(false);

  // Exemple de position ouverte pour valider le marquage (DoD)
  const [activePositions] = useState<PositionItem[]>([
    {
      id: 'pos-1',
      symbol: 'BTC/USD',
      direction: 'BUY',
      entryPrice: 182.5,
      takeProfit: 195.0,
      stopLoss: 175.0,
    },
  ]);

  const handleSearchSubmit = (text: string) => {
    setSearchValue(text);
    if (text.trim().length > 0) {
      setSymbol(text.trim().toUpperCase());
    }
  };

  const handleClearDrawings = () => {
    console.log('Effacement de toutes les annotations graphiques');
    setHasDrawings(false);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors_bg_primary ?? '#0B0F19' },
      ]}
    >
      {/* 1. Header en variante 'chart' */}
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

      {/* 2. Zone principale : Graphique de trading + Toolbar */}
      <View style={styles.chartWrapper}>
        {/* Barre d'outils d'annotation (Issue 19) */}
        <ChartToolbar
          themeMode={themeMode}
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          showPositions={showPositions}
          onTogglePositions={() => setShowPositions((prev) => !prev)}
          onClearDrawings={handleClearDrawings}
          hasDrawings={hasDrawings}
        />

        {/* Graphique principal */}
        <TradingChart
          symbol={symbol}
          themeMode={themeMode}
        />
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
