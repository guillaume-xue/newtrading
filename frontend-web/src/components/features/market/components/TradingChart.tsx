'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  CandlestickData,
  ColorType,
  CandlestickSeries,
  AreaSeries,
} from 'lightweight-charts';

import { fetchMarketHistory, CandleModel, QuoteModel } from '@/lib/api/marketApi';
import { ChartTool } from '@/components/features/market/components/ChartToolbar';
import { generateLocalMockCandles } from '@/utils/chartPath';
import { useChartDrawings } from '@/hooks/useChartDrawings';
import { ChartDrawingOverlay } from './ChartDrawingOverlay';
import { TimeRange, getFromTimestampForRange } from '@/types/timeRange';
import { useMarketStream } from '@/lib/hooks/useMarketStream';

interface TradingChartProps {
  symbol: string;
  themeMode?: 'dark' | 'light';
  chartType?: 'candlestick' | 'area';
  activeTool?: ChartTool;
  disableZoom?: boolean;
  selectedRange?: TimeRange;
  sparkline?: boolean;
  lineColor?: string;
  topColor?: string;
  bottomColor?: string;
  onDrawingsChange?: (hasDrawings: boolean) => void;
  onPriceChange?: (price: number, basePrice?: number) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  themeMode = 'light',
  chartType = 'candlestick',
  activeTool = 'crosshair',
  disableZoom = false,
  selectedRange = '1D',
  sparkline = false,
  lineColor = '#2563EB',
  topColor = 'rgba(37, 99, 235, 0.2)',
  bottomColor = 'rgba(37, 99, 235, 0.0)',
  onDrawingsChange,
  onPriceChange,
}) => {
  // Normalisation du ticker pour le routage REST et le topic STOMP
  const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const candlesDataRef = useRef<CandlestickData[]>([]);

  const [loading, setLoading] = useState(true);
  const [, setViewportTick] = useState(0);

  const isDrawingActive = activeTool !== 'crosshair';

  const {
    drawings,
    currentScreenDraft,
    inlineEditor,
    livePencilPathRef,
    setInlineEditor,
    commitInlineText,
    getScreenCoordinates,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useChartDrawings({
    chartRef,
    seriesRef,
    activeTool,
    onDrawingsChange,
  });

  // 1. Initialisation de la carte
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;
    const isArea = chartType === 'area';

    const chart = createChart(container, {
      width: container.clientWidth || 900,
      height: container.clientHeight || 650,
      layout: {
        background: {
          type: ColorType.Solid,
          color: themeMode === 'dark' ? '#0D1117' : '#FFFFFF',
        },
        textColor: themeMode === 'dark' ? '#8B949E' : '#64748B',
        fontSize: 12,
      },
      grid: {
        vertLines: { visible: !sparkline, color: themeMode === 'dark' ? '#1F2937' : '#F1F5F9' },
        horzLines: { visible: !sparkline, color: themeMode === 'dark' ? '#1F2937' : '#F1F5F9' },
      },
      timeScale: {
        visible: !sparkline,
        borderColor: themeMode === 'dark' ? '#30363D' : '#E2E8F0',
        timeVisible: true,
      },
      rightPriceScale: {
        visible: !sparkline,
        borderColor: themeMode === 'dark' ? '#30363D' : '#E2E8F0',
      },
      crosshair: {
        vertLine: { visible: !sparkline },
        horzLine: { visible: !sparkline },
      },
      handleScroll: !isDrawingActive && !inlineEditor && !disableZoom && !sparkline,
      handleScale: !isDrawingActive && !inlineEditor && !disableZoom && !sparkline,
    });

    const series = isArea
      ? chart.addSeries(AreaSeries, {
          lineColor: lineColor,
          topColor: topColor,
          bottomColor: bottomColor,
          lineWidth: 2,
          priceLineVisible: !sparkline,
          lastValueVisible: !sparkline,
        })
      : chart.addSeries(CandlestickSeries, {
          upColor: '#16A34A',
          downColor: '#DC2626',
          borderUpColor: '#16A34A',
          borderDownColor: '#DC2626',
          wickUpColor: '#16A34A',
          wickDownColor: '#DC2626',
          priceLineVisible: !sparkline,
          lastValueVisible: !sparkline,
        });

    chartRef.current = chart;
    seriesRef.current = series;

    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      setViewportTick((tick) => tick + 1);
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries?.[0] || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });
        setViewportTick((tick) => tick + 1);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartType, themeMode, disableZoom]);

  // Synchronisation des verrous de navigation lors des tracés
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      handleScroll: !isDrawingActive && !inlineEditor && !disableZoom,
      handleScale: !isDrawingActive && !inlineEditor && !disableZoom,
    });
  }, [isDrawingActive, inlineEditor, disableZoom]);

    // 2. Récupération des cours historiques
  const lastFetchedSymbolRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      let candles: CandlestickData[] = [];

      try {
        console.log(`[API CALL] Récupération de l'historique pour : ${cleanSymbol}`);
        const data: CandleModel[] = await fetchMarketHistory(cleanSymbol);

        if (Array.isArray(data) && data.length > 0) {
          console.log(`[API RESPONSE] Reçu pour ${cleanSymbol} :`, data.length, 'bougies réelles');
          candles = data
            .map((item) => ({
              time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
              open: Number(item.open),
              high: Number(item.high),
              low: Number(item.low),
              close: Number(item.close),
            }))
            .sort((a, b) => (a.time as number) - (b.time as number));
        }
      } catch (error) {
        console.error(`[API ERROR] Impossible de charger l'historique réel pour ${cleanSymbol} :`, error);
      }

      if (!isMounted || !seriesRef.current || candles.length === 0) {
        setLoading(false);
        return;
      }

      candlesDataRef.current = candles;

      if (chartType === 'area') {
        const areaData = candles.map((c) => ({ time: c.time, value: c.close }));
        (seriesRef.current as ISeriesApi<'Area'>).setData(areaData);
      } else {
        (seriesRef.current as ISeriesApi<'Candlestick'>).setData(candles);
      }

      const latestCandle = candles[candles.length - 1];
      const firstCandle = candles[0];
      onPriceChange?.(latestCandle.close, firstCandle.open);

      requestAnimationFrame(() => {
        if (!chartRef.current || candles.length === 0) return;
        chartRef.current.timeScale().fitContent();
        setViewportTick((t) => t + 1);
      });

      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [cleanSymbol, chartType]); // <-- Retrait de onPriceChange et selectedRange

  // 3. Réception et injection des ticks WebSocket en direct
  const handleLiveQuote = useCallback(
    (quote: QuoteModel) => {
      if (!seriesRef.current || candlesDataRef.current.length === 0) return;

      const price = Number(quote.price);
      if (isNaN(price)) return;

      // Remonte le prix tick-by-tick vers TradeScreen
      onPriceChange?.(price);

      const currentCandles = candlesDataRef.current;
      const lastIndex = currentCandles.length - 1;
      const lastCandle = currentCandles[lastIndex];

      if (chartType === 'area') {
        const quoteTime = Math.floor(new Date(quote.timestamp).getTime() / 1000) as UTCTimestamp;
        const areaUpdate = {
          time: quoteTime >= (lastCandle.time as number) ? quoteTime : lastCandle.time,
          value: price,
        };
        (seriesRef.current as ISeriesApi<'Area'>).update(areaUpdate);
        return;
      }

      // Mise à jour de la bougie active
      const updatedCandle: CandlestickData = {
        time: lastCandle.time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, price),
        low: Math.min(lastCandle.low, price),
        close: price,
      };

      currentCandles[lastIndex] = updatedCandle;
      (seriesRef.current as ISeriesApi<'Candlestick'>).update(updatedCandle);
    },
    [chartType, onPriceChange]
  );

  useMarketStream({
    symbol: cleanSymbol,
    onPriceUpdate: handleLiveQuote,
    enabled: !loading && !sparkline,
  });

  // 4. Recadrage automatique lors du changement d'intervalle
  useEffect(() => {
    if (!chartRef.current || candlesDataRef.current.length === 0) return;

    const candles = candlesDataRef.current;
    const latestTimestamp = candles[candles.length - 1].time as number;

    if (selectedRange === 'ALL') {
      chartRef.current.timeScale().fitContent();
    } else {
      const fromTimestamp = getFromTimestampForRange(selectedRange, latestTimestamp);
      chartRef.current.timeScale().setVisibleRange({
        from: fromTimestamp as UTCTimestamp,
        to: latestTimestamp as UTCTimestamp,
      });
    }

    setViewportTick((t) => t + 1);
  }, [selectedRange]);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      )}

      <div
        ref={chartContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <ChartDrawingOverlay
        isDrawingActive={isDrawingActive}
        drawings={drawings}
        currentScreenDraft={currentScreenDraft}
        inlineEditor={inlineEditor}
        livePencilPathRef={livePencilPathRef}
        getScreenCoordinates={getScreenCoordinates}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onInlineTextChange={(text) =>
          setInlineEditor((prev) => (prev ? { ...prev, text } : null))
        }
        onCommitInlineText={commitInlineText}
        onCancelInlineText={() => setInlineEditor(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default TradingChart;
