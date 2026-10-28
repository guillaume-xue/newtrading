'use client';

// components/features/market/components/TradingChart.tsx
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
import { useChartDrawings } from '@/hooks/useChartDrawings';
import { ChartDrawingOverlay } from './ChartDrawingOverlay';
import { TimeRange, getFromTimestampForRange } from '@/types/timeRange';
import { useMarketStream } from '@/lib/hooks/useMarketStream';
import { useAppTheme } from '@/theme/ThemeContext';

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
  themeMode,
  chartType = 'candlestick',
  activeTool = 'crosshair',
  disableZoom = false,
  selectedRange = '1D',
  sparkline = false,
  lineColor,
  topColor,
  bottomColor,
  onDrawingsChange,
  onPriceChange,
}) => {
  const { theme } = useAppTheme();
  const { colors, isDark } = theme;

  const effectiveIsDark = themeMode !== undefined ? themeMode === 'dark' : isDark;

  const resolvedLineColor = lineColor ?? colors['colors_badge_primary-action-bg'];
  const resolvedTopColor = topColor ?? (effectiveIsDark ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.2)');
  const resolvedBottomColor = bottomColor ?? 'rgba(37, 99, 235, 0.0)';

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

  // 1. Initialisation & Canvas
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;
    const isArea = chartType === 'area';

    const chartBg = colors['colors_bg_secondary'];
    const textColor = colors['colors_text_secondary'];
    const gridColor = effectiveIsDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const borderColor = colors['colors_divider_text'];

    const chart = createChart(container, {
      width: container.clientWidth || 900,
      height: container.clientHeight || 650,
      layout: {
        background: {
          type: ColorType.Solid,
          color: chartBg,
        },
        textColor: textColor,
        fontSize: 12,
      },
      grid: {
        vertLines: { visible: !sparkline, color: gridColor },
        horzLines: { visible: !sparkline, color: gridColor },
      },
      timeScale: {
        visible: !sparkline,
        borderColor: borderColor,
        timeVisible: true,
      },
      rightPriceScale: {
        visible: !sparkline,
        borderColor: borderColor,
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
          lineColor: resolvedLineColor,
          topColor: resolvedTopColor,
          bottomColor: resolvedBottomColor,
          lineWidth: 2,
          priceLineVisible: !sparkline,
          lastValueVisible: !sparkline,
        })
      : chart.addSeries(CandlestickSeries, {
          upColor: colors['colors_button_buy'],
          downColor: colors['colors_button_sell'],
          borderUpColor: colors['colors_button_buy'],
          borderDownColor: colors['colors_button_sell'],
          wickUpColor: colors['colors_button_buy'],
          wickDownColor: colors['colors_button_sell'],
          priceLineVisible: !sparkline,
          lastValueVisible: !sparkline,
        });

    chartRef.current = chart;
    seriesRef.current = series;

    if (candlesDataRef.current.length > 0) {
      if (isArea) {
        const areaData = candlesDataRef.current.map((c) => ({ time: c.time, value: c.close }));
        (series as ISeriesApi<'Area'>).setData(areaData);
      } else {
        (series as ISeriesApi<'Candlestick'>).setData(candlesDataRef.current);
      }
    }

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
  }, [
    chartType,
    effectiveIsDark,
    disableZoom,
    sparkline,
    colors,
    resolvedLineColor,
    resolvedTopColor,
    resolvedBottomColor,
  ]);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      handleScroll: !isDrawingActive && !inlineEditor && !disableZoom && !sparkline,
      handleScale: !isDrawingActive && !inlineEditor && !disableZoom && !sparkline,
    });
  }, [isDrawingActive, inlineEditor, disableZoom, sparkline]);

  // 2. Nettoyage, Dédoublonnage et Tri Chronologique Strict
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      let candles: CandlestickData[] = [];

      try {
        const data: CandleModel[] = await fetchMarketHistory(cleanSymbol);

        if (Array.isArray(data) && data.length > 0) {
          // Utilisation d'une Map indexée par timestamp arrondi à la seconde pour éliminer tout doublon
          const uniqueCandlesMap = new Map<number, CandlestickData>();

          data.forEach((item) => {
            const timeInSeconds = Math.floor(new Date(item.timestamp).getTime() / 1000);
            if (!isNaN(timeInSeconds)) {
              uniqueCandlesMap.set(timeInSeconds, {
                time: timeInSeconds as UTCTimestamp,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
              });
            }
          });

          // Tri chronologique ascendant obligatoire
          candles = Array.from(uniqueCandlesMap.values()).sort(
            (a, b) => (a.time as number) - (b.time as number)
          );
        }
      } catch (error) {
        console.error(`[API ERROR] Chargement historique pour ${cleanSymbol} :`, error);
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
  }, [cleanSymbol, chartType]);

  // 3. Réception sécurisée des ticks en direct
  const handleLiveQuote = useCallback(
    (quote: QuoteModel) => {
      if (!seriesRef.current || candlesDataRef.current.length === 0) return;

      const price = Number(quote.price);
      if (isNaN(price)) return;

      onPriceChange?.(price);

      const currentCandles = candlesDataRef.current;
      const lastIndex = currentCandles.length - 1;
      const lastCandle = currentCandles[lastIndex];

      const quoteTime = Math.floor(new Date(quote.timestamp).getTime() / 1000) as UTCTimestamp;

      if (chartType === 'area') {
        const areaUpdate = {
          time: quoteTime >= (lastCandle.time as number) ? quoteTime : lastCandle.time,
          value: price,
        };
        (seriesRef.current as ISeriesApi<'Area'>).update(areaUpdate);
        return;
      }

      // Si le tick appartient à une nouvelle bougie
      if (quoteTime > (lastCandle.time as number)) {
        const newCandle: CandlestickData = {
          time: quoteTime,
          open: price,
          high: price,
          low: price,
          close: price,
        };
        currentCandles.push(newCandle);
        (seriesRef.current as ISeriesApi<'Candlestick'>).update(newCandle);
      } else {
        // Mise à jour de la bougie en cours
        const updatedCandle: CandlestickData = {
          time: lastCandle.time,
          open: lastCandle.open,
          high: Math.max(lastCandle.high, price),
          low: Math.min(lastCandle.low, price),
          close: price,
        };
        currentCandles[lastIndex] = updatedCandle;
        (seriesRef.current as ISeriesApi<'Candlestick'>).update(updatedCandle);
      }
    },
    [chartType, onPriceChange]
  );

  useMarketStream({
    symbol: cleanSymbol,
    onPriceUpdate: handleLiveQuote,
    enabled: !loading && !sparkline,
  });

  // 4. Recadrage lors du changement de période
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
    <View style={[styles.container, { backgroundColor: colors['colors_bg_secondary'] }]}>
      {loading && (
        <View
          style={[
            styles.overlay,
            {
              backgroundColor: effectiveIsDark
                ? 'rgba(11, 15, 25, 0.7)'
                : 'rgba(255, 255, 255, 0.7)',
            },
          ]}
        >
          <ActivityIndicator size="large" color={colors['colors_badge_primary-action-bg']} />
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
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TradingChart;
