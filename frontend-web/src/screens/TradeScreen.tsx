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
import { QuoteModel } from '@/lib/api/marketApi';
import { useMarketStream } from '@/lib/hooks/useMarketStream';
import { useAppTheme } from '@/theme/ThemeContext';
import { TimeRange } from '@/types/timeRange';

const TradeScreenContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSymbol = searchParams.get('symbol') || 'AAPL';
  const symbol = rawSymbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const { theme } = useAppTheme();
  const { colors, isDark } = theme;

  const [searchValue, setSearchValue] = useState<string>(symbol);
  const [activeTool, setActiveTool] = useState<ChartTool>('crosshair');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3M');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [chartAreaBounds, setChartAreaBounds] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'order' | 'alerts' | null>('order');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertRefreshKey, setAlertRefreshKey] = useState(0);

  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [baselinePrice, setBaselinePrice] = useState<number>(0);

  useEffect(() => {
    setSearchValue(symbol);
    setBaselinePrice(0);
  }, [symbol]);

  const handleChartPriceChange = useCallback((price: number, basePrice?: number) => {
    if (price <= 0) return;
    setCurrentPrice(price);

    if (basePrice && basePrice > 0) {
      setBaselinePrice(basePrice);
      const diff = ((price - basePrice) / basePrice) * 100;
      setPriceChangePercent(diff);
    } else if (baselinePrice > 0) {
      const diff = ((price - baselinePrice) / baselinePrice) * 100;
      setPriceChangePercent(diff);
    }
  }, [baselinePrice]);

  const handlePriceUpdate = useCallback((quote: QuoteModel) => {
    if (quote && quote.price != null) {
      const p = Number(quote.price);
      setCurrentPrice(p);
      if (quote.changePercent != null) {
        setPriceChangePercent(Number(quote.changePercent));
      } else if (baselinePrice > 0) {
        setPriceChangePercent(((p - baselinePrice) / baselinePrice) * 100);
      }
    }
  }, [baselinePrice]);

  useMarketStream({
    symbol,
    onPriceUpdate: handlePriceUpdate,
    enabled: true,
  });

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
      // Ignoré
    }
  }, [loadPortfolio]);

  useEffect(() => {
    let isMounted = true;
    loadPortfolio()
      .then((res) => {
        if (isMounted) setPnlData(res);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [loadPortfolio]);

  const handleSearchChange = (newSymbol: string) => {
    setSearchValue(newSymbol);
    const cleaned = newSymbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned) {
      router.push(`/trade?symbol=${encodeURIComponent(cleaned)}`);
    }
  };

  const formattedBalance = pnlData
    ? `${pnlData.currentBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $`
    : '100 000,00 $';

  const isPositive = priceChangePercent >= 0;
  const priceColor = isPositive ? colors['colors_badge_up'] : colors['colors_badge_down'];
  const iconFilter = isDark ? 'brightness(0) invert(1) opacity(0.8)' : 'brightness(0) opacity(0.7)';

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors['colors_bg_primary'] }]}>
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

      <View
        style={[
          styles.workspace,
          {
            backgroundColor: colors['colors_bg_secondary'],
            borderTopColor: colors['colors_divider_text'],
          },
        ]}
      >
        <View
          style={[
            styles.chartArea,
            {
              backgroundColor: colors['colors_bg_secondary'],
              borderRightColor: colors['colors_divider_text'],
            },
          ]}
          onLayout={handleChartAreaLayout}
        >
          <View style={styles.toolbarContainer}>
            <ChartToolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              bounds={chartAreaBounds}
            />
          </View>

          <View style={styles.tickerOverlay}>
            <Text style={[styles.tickerSymbol, { color: colors['colors_text_primary'] }]}>
              {symbol}
            </Text>
            <View style={[styles.badgePill, { backgroundColor: colors['colors_bg_primary'] }]}>
              <Text style={[styles.badgePillText, { color: colors['colors_text_secondary'] }]}>
                SPOT
              </Text>
            </View>
            <Text style={[styles.tickerPrice, { color: priceColor }]}>
              {currentPrice > 0
                ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '---'}
            </Text>
            <Text style={[styles.tickerPercent, { color: priceColor }]}>
              {priceChangePercent !== 0
                ? `${isPositive ? '+' : ''}${priceChangePercent.toFixed(2)}%`
                : '0.00%'}
            </Text>
          </View>

          <TradingChart
            symbol={symbol}
            themeMode={isDark ? 'dark' : 'light'}
            chartType={chartType}
            activeTool={activeTool}
            selectedRange={selectedRange}
            onPriceChange={handleChartPriceChange}
          />
        </View>

        {activeRightTab === 'order' && (
          <View
            style={[
              styles.orderPanelColumn,
              {
                backgroundColor: colors['colors_bg_secondary'],
                borderRightColor: colors['colors_divider_text'],
              },
            ]}
          >
            <OrderFormPanel
              assetCode={symbol}
              currentPrice={currentPrice}
              availableBalance={pnlData?.currentBalance ?? 100000.0}
              onOrderSuccess={fetchPortfolio}
            />
          </View>
        )}

        {activeRightTab === 'alerts' && (
          <View
            style={[
              styles.orderPanelColumn,
              {
                backgroundColor: colors['colors_bg_secondary'],
                borderRightColor: colors['colors_divider_text'],
              },
            ]}
          >
            <AlertPanel
              key={alertRefreshKey}
              assetCode={symbol}
              onAddPress={() => setIsAlertModalOpen(true)}
            />
          </View>
        )}

        <View
          style={[
            styles.rightIconSidebar,
            { backgroundColor: colors['colors_bg_secondary'] },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.sidebarIconBtn,
              activeRightTab === 'order' && { backgroundColor: colors['colors_bg_primary'] },
            ]}
            onPress={() => toggleRightPanel('order')}
          >
            <Image src={walletIcon} width={20} height={20} alt="Ordre" style={{ filter: iconFilter }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sidebarIconBtn,
              activeRightTab === 'alerts' && { backgroundColor: colors['colors_bg_primary'] },
            ]}
            onPress={() => toggleRightPanel('alerts')}
          >
            <Image src={alarmClockIcon} width={20} height={20} alt="Alertes" style={{ filter: iconFilter }} />
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
    flexDirection: 'column',
    overflow: 'hidden',
  },
  workspace: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 1,
    borderTopWidth: 1,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    borderRightWidth: 1,
  },
  toolbarContainer: {
    position: 'absolute',
    left: 16,
    top: 48,
    zIndex: 20,
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
  },
  badgePill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tickerPrice: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tickerPercent: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  orderPanelColumn: {
    width: 400,
    borderRightWidth: 1,
  },
  rightIconSidebar: {
    width: 44,
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
});

export default TradeScreen;
