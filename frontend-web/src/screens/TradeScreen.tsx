'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Image from 'next/image';

import walletIcon from '@/assets/icons/money-bill-transfer 1.svg';
import alarmClockIcon from '@/assets/icons/alarm-clock.svg';
import listIcon from '@/assets/icons/list 1.svg';

import { AppHeader } from '@/components/layout/AppHeader';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { ChartToolbar, ChartTool } from '@/components/features/market/components/ChartToolbar';
import { OrderFormPanel } from '@/components/portfolio/components/OrderFormPanel';
import { tradeApi, PnLData } from '@/lib/api/tradeApi';

export const TradeScreen: React.FC = () => {
  const [symbol, setSymbol] = useState<string>('BTC/USD');
  const [searchValue, setSearchValue] = useState<string>('');
  const [activeTool, setActiveTool] = useState<ChartTool>('crosshair');
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'order' | 'alerts' | 'watchlist'>('order');

  const currentPrice = 63432.5;

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await tradeApi.getPnL();
      setPnlData(res);
    } catch {
      // Ignoré pour conserver les valeurs de secours
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const formattedBalance = pnlData
    ? `${pnlData.currentBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $`
    : '100 000,00 $';

  return (
    <View style={styles.screenContainer}>
      {/* 2. Header de trading (aligné avec la vue chart) */}
      <AppHeader
        variant="chart"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        cashAmount={formattedBalance}
        onAlertPress={() => setActiveRightTab('alerts')}
      />

      {/* 3. Zone principale de trading (split 3 colonnes) */}
      <View style={styles.workspace}>
        {/* Colonne centrale : Graphique avec Toolbar et Info Ticker */}
        <View style={styles.chartArea}>
          <ChartToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

          {/* Bandeau d'informations ticker incrusté en haut du graphique */}
          <View style={styles.tickerOverlay}>
            <Text style={styles.tickerSymbol}>BTC/USD</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>PERP</Text>
            </View>
            <Text style={styles.tickerPrice}>
              {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.tickerPercent}>+2.5%</Text>
          </View>

          {/* Graphique Lightweight Charts */}
          <TradingChart symbol={symbol} themeMode="light" />
        </View>

        {/* Colonne droite : Formulaire d'ordre et Historique */}
        <View style={styles.orderPanelColumn}>
          <OrderFormPanel
            assetCode={symbol}
            currentPrice={currentPrice}
            availableBalance={1.0}
            onOrderSuccess={fetchPortfolio}
          />
        </View>

        {/* Colonne d'icônes à l'extrême droite */}
        <View style={styles.rightIconSidebar}>
          <TouchableOpacity
            style={[styles.sidebarIconBtn, activeRightTab === 'order' && styles.sidebarIconActive]}
            onPress={() => setActiveRightTab('order')}
          >
            <Image src={walletIcon} width={20} height={20} alt="Ordre" style={styles.iconTint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarIconBtn, activeRightTab === 'alerts' && styles.sidebarIconActive]}
            onPress={() => setActiveRightTab('alerts')}
          >
            <Image src={alarmClockIcon} width={20} height={20} alt="Alertes" style={styles.iconTint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarIconBtn, activeRightTab === 'watchlist' && styles.sidebarIconActive]}
            onPress={() => setActiveRightTab('watchlist')}
          >
            <Image src={listIcon} width={20} height={20} alt="Watchlist" style={styles.iconTint} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: '100%',
    // @ts-ignore
    height: '100vh',
    backgroundColor: '#F3F4F6',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBreadcrumbBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 2,
    backgroundColor: '#FFFFFF',
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginTop: 1,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  tickerOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tickerSymbol: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0F19',
  },
  badgePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  tickerPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009F6B',
  },
  tickerPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009F6B',
  },
  orderPanelColumn: {
    width: 400, // Aligné sur la largeur de OrderFormPanel (350px au lieu de 290px)
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  rightIconSidebar: {
    width: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 12,
    gap: 16,
  },
  sidebarIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarIconActive: {
    backgroundColor: '#F3F4F6',
  },
  iconTint: {
    filter: 'brightness(0) opacity(0.7)',
  },
});

export default TradeScreen;
