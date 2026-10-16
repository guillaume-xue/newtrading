// screens/TradeScreen.tsx
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

import walletIcon from '@/assets/icons/money-bill-transfer 1.svg';
import alarmClockIcon from '@/assets/icons/alarm-clock.svg';

import { AppHeader } from '@/components/layout/AppHeader';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { ChartToolbar, ChartTool } from '@/components/features/market/components/ChartToolbar';
import { AlertPanel } from '@/components/features/market/components/AlertPanel';
import { CreateAlertModal } from '@/components/features/market/components/CreateAlertModal';
import { OrderFormPanel } from '@/components/portfolio/components/OrderFormPanel';
import { tradeApi, PnLData } from '@/lib/api/tradeApi';
import { TimeRange } from '@/types/timeRange';

const TradeScreenContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSymbol = searchParams.get('symbol');
  const symbol = urlSymbol ? urlSymbol.toUpperCase() : 'BTC/USD';

  const [searchValue, setSearchValue] = useState<string>(symbol);
  const [activeTool, setActiveTool] = useState<ChartTool>('crosshair');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1D');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [chartAreaBounds, setChartAreaBounds] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'order' | 'alerts' | null>('order');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertRefreshKey, setAlertRefreshKey] = useState(0);

  const currentPrice = 63432.5;

  useEffect(() => {
    setSearchValue(symbol);
  }, [symbol]);

  const toggleChartType = () => {
    setChartType((prev) => (prev === 'candlestick' ? 'area' : 'candlestick'));
  };

  const toggleRightPanel = (panel: 'order' | 'alerts') => {
    setActiveRightTab((currentPanel) => (currentPanel === panel ? null : panel));
  };

  const handleChartAreaLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setChartAreaBounds({ width, height });
    }
  };

  const loadPortfolio = useCallback(() => tradeApi.getPnL(), []);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await loadPortfolio();
      setPnlData(res);
    } catch {
      // Ignoré pour conserver les valeurs de secours
    }
  }, [loadPortfolio]);

  useEffect(() => {
    let isMounted = true;

    loadPortfolio()
      .then((res) => {
        if (isMounted) setPnlData(res);
      })
      .catch(() => {
        // Ignoré pour conserver les valeurs de secours
      });

    return () => {
      isMounted = false;
    };
  }, [loadPortfolio]);

  const handleSearchChange = (newSymbol: string) => {
    setSearchValue(newSymbol);
    if (newSymbol.trim()) {
      router.push(`/trade?symbol=${encodeURIComponent(newSymbol.trim().toUpperCase())}`);
    }
  };

  const formattedBalance = pnlData
    ? `${pnlData.currentBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $`
    : '100 000,00 $';

  return (
    <View style={styles.screenContainer}>
      <AppHeader
        variant="chart"
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        cashAmount={formattedBalance}
        assetCode={symbol}
        currentPrice={currentPrice}
        selectedRange={selectedRange}
        onSelectRange={setSelectedRange}
        chartType={chartType}
        onToggleChartType={toggleChartType}
        onAlertPress={() => setActiveRightTab('alerts')}
      />

      <View style={styles.workspace}>
        <View style={styles.chartArea} onLayout={handleChartAreaLayout}>
          <ChartToolbar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            bounds={chartAreaBounds}
          />

          <View style={styles.tickerOverlay}>
            <Text style={styles.tickerSymbol}>{symbol}</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>PERP</Text>
            </View>
            <Text style={styles.tickerPrice}>
              {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.tickerPercent}>+2.5%</Text>
          </View>

          <TradingChart
            symbol={symbol}
            themeMode="light"
            chartType={chartType}
            activeTool={activeTool}
            selectedRange={selectedRange}
          />
        </View>

        {activeRightTab === 'order' && (
          <View style={styles.orderPanelColumn}>
            <OrderFormPanel
              assetCode={symbol}
              currentPrice={currentPrice}
              availableBalance={1.0}
              onOrderSuccess={fetchPortfolio}
            />
          </View>
        )}
        {activeRightTab === 'alerts' && (
          <View style={styles.orderPanelColumn}>
            <AlertPanel
              key={alertRefreshKey}
              assetCode={symbol}
              onAddPress={() => setIsAlertModalOpen(true)}
            />
          </View>
        )}

        <View style={styles.rightIconSidebar}>
          <TouchableOpacity
            style={[styles.sidebarIconBtn, activeRightTab === 'order' && styles.sidebarIconActive]}
            onPress={() => toggleRightPanel('order')}
          >
            <Image src={walletIcon} width={20} height={20} alt="Ordre" style={styles.iconTint} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarIconBtn, activeRightTab === 'alerts' && styles.sidebarIconActive]}
            onPress={() => toggleRightPanel('alerts')}
          >
            <Image src={alarmClockIcon} width={20} height={20} alt="Alertes" style={styles.iconTint} />
          </TouchableOpacity>
        </View>
      </View>

      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        assetCode={symbol}
        currentPrice={currentPrice}
        onAlertCreated={() => setAlertRefreshKey((current) => current + 1)}
      />
    </View>
  );
};

export const TradeScreen: React.FC = () => {
  return (
    <Suspense fallback={<View style={styles.screenContainer} />}>
      <TradeScreenContent />
    </Suspense>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#F3F4F6',
    flexDirection: 'column',
    overflow: 'hidden',
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
    width: 400,
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
