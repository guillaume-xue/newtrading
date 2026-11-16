'use client';

import React, { Suspense, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';

import { AppHeader } from '@/components/layout/AppHeader';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { ChartToolbar } from '@/components/features/market/components/ChartToolbar';
import { CreateAlertModal } from '@/components/features/market/components/CreateAlertModal';
import { useTradeWorkspace } from '@/hooks/useTradeWorkspace';
import { TradeTickerOverlay } from '@/screens/trade/TradeTickerOverlay';
import { TradeRightDock } from '@/screens/trade/TradeRightDock';
import { useAppTheme } from '@/theme/ThemeContext';

const TradeScreenContent: React.FC = () => {
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const {
    symbol,
    searchValue,
    activeTool,
    setActiveTool,
    selectedRange,
    setSelectedRange,
    chartType,
    toggleChartType,
    chartAreaBounds,
    handleChartAreaLayout,
    activeRightTab,
    toggleRightPanel,
    openAlertsPanel,
    isAlertModalOpen,
    setIsAlertModalOpen,
    alertRefreshToken,
    triggerAlertsRefresh,
    currentPrice,
    priceChangePercent,
    latestLiveQuote,
    availableBalance,
    formattedBalance,
    fetchPortfolio,
    handleChartPriceChange,
    handleSearchChange,
  } = useTradeWorkspace();

  const onChartLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      handleChartAreaLayout(width, height);
    },
    [handleChartAreaLayout]
  );

  const handleCloseAlertModal = useCallback(() => {
    setIsAlertModalOpen(false);
  }, [setIsAlertModalOpen]);

  const handleOpenAlertModal = useCallback(() => {
    setIsAlertModalOpen(true);
  }, [setIsAlertModalOpen]);

  return (
    <View
      style={[
        styles.screenContainer,
        { backgroundColor: colors['colors_bg_primary'] },
      ]}
    >
      <AppHeader
        variant="chart"
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        cashAmount={formattedBalance}
        assetCode={symbol}
        currentPrice={currentPrice}
        onSelectRange={setSelectedRange}
        chartType={chartType}
        onToggleChartType={toggleChartType}
        onAlertPress={openAlertsPanel}
      />

      <View
        style={[
          styles.workspace,
          {
            backgroundColor: colors['colors_bg_secondary'],
            borderTopColor: colors['colors_divider_text'],
            borderTopWidth: primitives['border width_border-thin'] ?? 1,
          },
        ]}
      >
        <View
          style={[
            styles.chartArea,
            {
              backgroundColor: colors['colors_bg_secondary'],
              borderRightColor: colors['colors_divider_text'],
              borderRightWidth: primitives['border width_border-thin'] ?? 1,
            },
          ]}
          onLayout={onChartLayout}
        >
          <View style={styles.toolbarContainer}>
            <ChartToolbar
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              bounds={chartAreaBounds}
            />
          </View>

          <TradeTickerOverlay
            symbol={symbol}
            currentPrice={currentPrice}
            priceChangePercent={priceChangePercent}
          />

          <TradingChart
            symbol={symbol}
            themeMode={isDark ? 'dark' : 'light'}
            chartType={chartType}
            activeTool={activeTool}
            selectedRange={selectedRange}
            liveQuote={latestLiveQuote}
            onPriceChange={handleChartPriceChange}
          />
        </View>

        <TradeRightDock
          symbol={symbol}
          currentPrice={currentPrice}
          availableBalance={availableBalance}
          activeTab={activeRightTab}
          alertRefreshToken={alertRefreshToken}
          onToggleTab={toggleRightPanel}
          onOrderSuccess={fetchPortfolio}
          onOpenCreateAlertModal={handleOpenAlertModal}
        />
      </View>

      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={handleCloseAlertModal}
        assetCode={symbol}
        currentPrice={currentPrice > 0 ? currentPrice : undefined}
        onAlertCreated={triggerAlertsRefresh}
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
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  toolbarContainer: {
    position: 'absolute',
    left: 16,
    top: 48,
    zIndex: 20,
  },
});

export default TradeScreen;
