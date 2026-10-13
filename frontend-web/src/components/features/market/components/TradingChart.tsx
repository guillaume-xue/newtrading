'use client';

import React, { useEffect, useRef, useState } from 'react';
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

import { fetchMarketHistory, CandleModel } from '@/lib/api/marketApi';
import { ChartTool } from '@/components/features/market/components/ChartToolbar';
import { generateLocalMockCandles } from '@/utils/chartPath';
import { useChartDrawings } from '@/hooks/useChartDrawings';
import { ChartDrawingOverlay } from './ChartDrawingOverlay';
import { TimeRange, getFromTimestampForRange } from '@/types/timeRange';

interface TradingChartProps {
  symbol: string;
  themeMode?: 'dark' | 'light';
  chartType?: 'candlestick' | 'area';
  activeTool?: ChartTool;
  disableZoom?: boolean;
  selectedRange?: TimeRange;
  onDrawingsChange?: (hasDrawings: boolean) => void;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  themeMode = 'light',
  chartType = 'candlestick',
  activeTool = 'crosshair',
  disableZoom = false,
  selectedRange = '1D',
  onDrawingsChange,
}) => {
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
        vertLines: { visible: true, color: themeMode === 'dark' ? '#1F2937' : '#F1F5F9' },
        horzLines: { visible: true, color: themeMode === 'dark' ? '#1F2937' : '#F1F5F9' },
      },
      timeScale: {
        borderColor: themeMode === 'dark' ? '#30363D' : '#E2E8F0',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: themeMode === 'dark' ? '#30363D' : '#E2E8F0',
      },
      handleScroll: !isDrawingActive && !inlineEditor && !disableZoom,
      handleScale: !isDrawingActive && !inlineEditor && !disableZoom,
    });

    const series = isArea
      ? chart.addSeries(AreaSeries, {
          lineColor: '#2563EB',
          topColor: 'rgba(37, 99, 235, 0.2)',
          bottomColor: 'rgba(37, 99, 235, 0.0)',
          lineWidth: 2,
        })
      : chart.addSeries(CandlestickSeries, {
          upColor: '#16A34A',
          downColor: '#DC2626',
          borderUpColor: '#16A34A',
          borderDownColor: '#DC2626',
          wickUpColor: '#16A34A',
          wickDownColor: '#DC2626',
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

  // Synchronisation des verrous de navigation lors des dessins
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      handleScroll: !isDrawingActive && !inlineEditor && !disableZoom,
      handleScale: !isDrawingActive && !inlineEditor && !disableZoom,
    });
  }, [isDrawingActive, inlineEditor, disableZoom]);

  // 2. Récupération des cours
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      let candles: CandlestickData[] = [];

      try {
        const data: CandleModel[] = await fetchMarketHistory(symbol);
        if (Array.isArray(data) && data.length > 0) {
          candles = data
            .map((item) => ({
              time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
              open: Number(item.open),
              high: Number(item.high),
              low: Number(item.low),
              close: Number(item.close),
            }))
            .sort((a, b) => (a.time as number) - (b.time as number));
        } else {
          candles = generateLocalMockCandles();
        }
      } catch {
        candles = generateLocalMockCandles();
      }

      if (!isMounted || !seriesRef.current) return;

      candlesDataRef.current = candles;

      if (chartType === 'area') {
        const areaData = candles.map((c) => ({ time: c.time, value: c.close }));
        (seriesRef.current as ISeriesApi<'Area'>).setData(areaData);
      } else {
        (seriesRef.current as ISeriesApi<'Candlestick'>).setData(candles);
      }

      requestAnimationFrame(() => {
        if (!chartRef.current || candles.length === 0) return;
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
      });

      setLoading(false);
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [symbol, chartType]);

  // 3. Recadrage automatique lors du changement d'intervalle (1D, 5D, 1M, etc.)
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
