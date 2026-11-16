'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ChartTool } from '@/components/features/market/components/ChartToolbar';
import { tradeApi, PnLData } from '@/lib/api/tradeApi';
import { QuoteModel } from '@/lib/api/marketApi';
import { useMarketStream, StreamStatus } from '@/lib/hooks/useMarketStream';
import { TimeRange } from '@/types/timeRange';
import { formatCashBalance } from '@/utils/marketFormatters';

export type RightWorkspaceTab = 'order' | 'alerts' | null;

const DEFAULT_AVAILABLE_BALANCE = 100000.0;

function sanitizeSymbol(rawSymbol: string | null): string {
  const cleaned = (rawSymbol ?? 'AAPL').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return cleaned.length > 0 ? cleaned : 'AAPL';
}

export function useTradeWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const symbol = useMemo(
    () => sanitizeSymbol(searchParams.get('symbol')),
    [searchParams]
  );

  // État de navigation & outils graphiques
  const [searchValue, setSearchValue] = useState<string>(symbol);
  const [activeTool, setActiveTool] = useState<ChartTool>('crosshair');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('3M');
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [chartAreaBounds, setChartAreaBounds] = useState({ width: 0, height: 0 });

  // État des panneaux latéraux & modales
  const [activeRightTab, setActiveRightTab] = useState<RightWorkspaceTab>('order');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertRefreshToken, setAlertRefreshToken] = useState(0);

  // État portefeuille & cotation live
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [baselinePrice, setBaselinePrice] = useState<number>(0);
  const [latestLiveQuote, setLatestLiveQuote] = useState<QuoteModel | null>(null);

  // Synchronisation du champ de recherche quand le query param `symbol` change
  useEffect(() => {
    setSearchValue(symbol);
    setBaselinePrice(0);
    setLatestLiveQuote(null);
  }, [symbol]);

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await tradeApi.getPnL();
      setPnlData(data);
    } catch {
      // Conservation du dernier état connu en cas d'échec transitoire
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void tradeApi
      .getPnL()
      .then((data) => {
        if (isMounted) setPnlData(data);
      })
      .catch(() => {});

    const handleExternalPortfolioUpdate = () => {
      void fetchPortfolio();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio:updated', handleExternalPortfolioUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('portfolio:updated', handleExternalPortfolioUpdate);
      }
    };
  }, [fetchPortfolio]);

  // Mise à jour du prix depuis l'historique initial du graphique
  const handleChartPriceChange = useCallback(
    (price: number, basePrice?: number) => {
      if (!Number.isFinite(price) || price <= 0) return;

      setCurrentPrice(price);

      if (basePrice && basePrice > 0) {
        setBaselinePrice(basePrice);
        setPriceChangePercent(((price - basePrice) / basePrice) * 100);
        return;
      }

      setBaselinePrice((prevBase) => {
        if (prevBase > 0) {
          setPriceChangePercent(((price - prevBase) / prevBase) * 100);
        }
        return prevBase;
      });
    },
    []
  );

  // Réception unique du flux temps réel STOMP pour le workspace
  const handlePriceUpdate = useCallback((quote: QuoteModel) => {
    if (!quote || quote.price == null) return;
    const numericPrice = Number(quote.price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return;

    setLatestLiveQuote(quote);
    setCurrentPrice(numericPrice);

    if (quote.changePercent != null && Number.isFinite(Number(quote.changePercent))) {
      setPriceChangePercent(Number(quote.changePercent));
    } else {
      setBaselinePrice((prevBase) => {
        if (prevBase > 0) {
          setPriceChangePercent(((numericPrice - prevBase) / prevBase) * 100);
        }
        return prevBase;
      });
    }
  }, []);

  const { status: streamStatus }: { status: StreamStatus } = useMarketStream({
    symbol,
    onPriceUpdate: handlePriceUpdate,
    enabled: true,
  });

  const toggleChartType = useCallback(() => {
    setChartType((prev) => (prev === 'candlestick' ? 'area' : 'candlestick'));
  }, []);

  const toggleRightPanel = useCallback((panel: Exclude<RightWorkspaceTab, null>) => {
    setActiveRightTab((current) => (current === panel ? null : panel));
  }, []);

  const openAlertsPanel = useCallback(() => {
    setActiveRightTab('alerts');
  }, []);

  const handleChartAreaLayout = useCallback((width: number, height: number) => {
    if (width <= 0 || height <= 0) return;
    setChartAreaBounds((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height }
    );
  }, []);

  const handleSearchChange = useCallback(
    (nextValue: string) => {
      setSearchValue(nextValue);
      const cleaned = sanitizeSymbol(nextValue);
      if (cleaned && cleaned !== symbol) {
        router.push(`/trade?symbol=${encodeURIComponent(cleaned)}`);
      }
    },
    [router, symbol]
  );

  const triggerAlertsRefresh = useCallback(() => {
    setAlertRefreshToken((prev) => prev + 1);
  }, []);

  const availableBalance = pnlData?.currentBalance ?? DEFAULT_AVAILABLE_BALANCE;
  const formattedBalance = useMemo(
    () => formatCashBalance(availableBalance),
    [availableBalance]
  );

  return {
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
    streamStatus,
    availableBalance,
    formattedBalance,
    fetchPortfolio,
    handleChartPriceChange,
    handleSearchChange,
  };
}
