'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  UTCTimestamp,
  CandlestickData,
  AreaData,
  ColorType,
  CandlestickSeries,
  AreaSeries,
  LineStyle,
} from 'lightweight-charts';

import { fetchMarketHistory, CandleModel, QuoteModel } from '@/lib/api/marketApi';
import { useMarketStream } from '@/lib/hooks/useMarketStream';
import { ChartTool } from '@/components/features/market/components/ChartToolbar';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';

export interface PositionIndicator {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  takeProfit?: number;
  stopLoss?: number;
}

export interface TrendLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface TradingChartProps {
  symbol: string;
  themeMode?: 'dark' | 'light';
  chartType?: 'candlestick' | 'area'; // Nouvelle variante
  activeTool?: ChartTool;
  disableZoom?: boolean;
  showPositions?: boolean;
  positions?: PositionIndicator[];
  onDrawingsChange?: (hasDrawings: boolean) => void;
}

const generateLocalMockCandles = (): CandlestickData[] => {
  const candles: CandlestickData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 86400;
  let price = 182.5;

  for (let i = 60; i >= 0; i--) {
    const time = (now - i * oneDay) as UTCTimestamp;
    const variation = (Math.random() - 0.48) * 3;
    const open = price;
    const close = price + variation;
    const high = Math.max(open, close) + Math.random() * 1.5;
    const low = Math.min(open, close) - Math.random() * 1.5;

    candles.push({
      time,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
    });

    price = close;
  }

  return candles;
};

export const TradingChart: React.FC<TradingChartProps> = ({
  symbol,
  themeMode = 'dark',
  chartType = 'candlestick',
  activeTool = 'crosshair',
  disableZoom = false,
  showPositions = true,
  positions = [],
  onDrawingsChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const currentCandleRef = useRef<CandlestickData | null>(null);
  const areaBaselinePriceRef = useRef<number | null>(null);
  const activePriceLinesRef = useRef<IPriceLine[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [lines, setLines] = useState<TrendLine[]>([]);
  const [currentDraftLine, setCurrentDraftLine] = useState<TrendLine | null>(null);

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  // 1. Initialisation du graphique
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const isArea = chartType === 'area';

    const chart = createChart(container, {
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      layout: {
        background: {
          type: ColorType.Solid,
          color: isArea ? '#FFFFFF' : colors.colors_bg_secondary,
        },
        textColor: colors.colors_text_secondary,
        fontSize: isArea ? 10 : 12,
      },
      grid: {
        vertLines: { visible: !isArea, color: '#1f2937' },
        horzLines: { visible: !isArea, color: '#1f2937' },
      },
      timeScale: {
        borderColor: isArea ? 'transparent' : colors.colors_divider_text,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        visible: !isArea,
        borderColor: isArea ? 'transparent' : colors.colors_divider_text,
      },
      ...(disableZoom && {
        handleScale: {
          mouseWheel: false,
          pinch: false,
          axisPressedMouseMove: false,
        },
        handleScroll: {
          mouseWheel: false,
          pressedMouseMove: false,
          horzTouchDrag: false,
          vertTouchDrag: false,
        },
      }),
    });

    let series: ISeriesApi<'Candlestick'> | ISeriesApi<'Area'>;

    if (isArea) {
      series = chart.addSeries(AreaSeries, {
        lineColor: '#000000',
        topColor: 'rgba(255, 255, 255, 1)',
        bottomColor: 'rgba(255, 255, 255, 1)',
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
    } else {
      series = chart.addSeries(CandlestickSeries, {
        upColor: colors.colors_button_buy,
        downColor: colors.colors_button_sell,
        borderUpColor: colors.colors_button_buy,
        borderDownColor: colors.colors_button_sell,
        wickUpColor: colors.colors_button_buy,
        wickDownColor: colors.colors_button_sell,
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chartRef.current.applyOptions({ width, height });
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
    colors.colors_bg_secondary,
    colors.colors_button_buy,
    colors.colors_button_sell,
    colors.colors_divider_text,
    colors.colors_text_secondary,
    disableZoom,
    themeMode,
  ]);

  // 2. Gestion des positions
  useEffect(() => {
    if (!seriesRef.current) return;

    activePriceLinesRef.current.forEach((line) => {
      try {
        seriesRef.current?.removePriceLine(line);
      } catch {
        // Ignorer
      }
    });
    activePriceLinesRef.current = [];

    if (!showPositions || positions.length === 0) return;

    const currentPositions = positions.filter((p) => p.symbol === symbol);

    currentPositions.forEach((pos) => {
      const isBuy = pos.direction === 'BUY';
      const mainColor = isBuy ? colors.colors_button_buy : colors.colors_button_sell;

      const entryLine = seriesRef.current!.createPriceLine({
        price: pos.entryPrice,
        color: mainColor,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `${pos.direction} @ ${pos.entryPrice.toFixed(2)}`,
      });
      activePriceLinesRef.current.push(entryLine);

      if (pos.takeProfit) {
        const tpLine = seriesRef.current!.createPriceLine({
          price: pos.takeProfit,
          color: colors.colors_button_buy,
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: `TP @ ${pos.takeProfit.toFixed(2)}`,
        });
        activePriceLinesRef.current.push(tpLine);
      }

      if (pos.stopLoss) {
        const slLine = seriesRef.current!.createPriceLine({
          price: pos.stopLoss,
          color: colors.colors_button_sell,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: `SL @ ${pos.stopLoss.toFixed(2)}`,
        });
        activePriceLinesRef.current.push(slLine);
      }
    });
  }, [
    colors.colors_button_buy,
    colors.colors_button_sell,
    positions,
    showPositions,
    symbol,
  ]);

  // 3. Données et Ligne de base en pointillé
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        let formattedData: CandlestickData[] = [];

        try {
          const data: CandleModel[] = await fetchMarketHistory(symbol);
          if (Array.isArray(data) && data.length > 0) {
            formattedData = data
              .map((item) => ({
                time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
              }))
              .sort((a, b) => (a.time as number) - (b.time as number));
          } else {
            formattedData = generateLocalMockCandles();
          }
        } catch {
          formattedData = generateLocalMockCandles();
        }

        if (!isMounted) return;

        if (seriesRef.current && formattedData.length > 0) {
          if (chartType === 'area') {
            const areaData: AreaData[] = formattedData.map((d) => ({
              time: d.time,
              value: d.close,
            }));
            const baselinePrice = areaData[0].value;
            const lastPrice = areaData[areaData.length - 1].value;
            const areaColor = lastPrice >= baselinePrice ? '#059669' : '#DC2626';
            const areaSeries = seriesRef.current as ISeriesApi<'Area'>;

            areaBaselinePriceRef.current = baselinePrice;
            areaSeries.applyOptions({ lineColor: areaColor });
            areaSeries.setData(areaData);

            // Ligne de référence du cours initial
            seriesRef.current.createPriceLine({
              price: baselinePrice,
              color: '#000000',
              lineWidth: 1,
              lineStyle: LineStyle.Dotted,
              axisLabelVisible: false,
            });
          } else {
            (seriesRef.current as ISeriesApi<'Candlestick'>).setData(formattedData);
          }

          currentCandleRef.current = formattedData[formattedData.length - 1];
          requestAnimationFrame(() => {
            chartRef.current?.timeScale().fitContent();
          });
        }
      } catch {
        if (isMounted) {
          setError('Erreur inattendue lors de l’affichage du cours.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [symbol, chartType]);

  // 4. WebSocket
  const handlePriceUpdate = useCallback(
    (quote: QuoteModel) => {
      if (!seriesRef.current || !currentCandleRef.current) return;

      const lastCandle = currentCandleRef.current;
      const price = Number(quote.price);

      if (chartType === 'area') {
        const areaSeries = seriesRef.current as ISeriesApi<'Area'>;
        const baselinePrice = areaBaselinePriceRef.current;

        areaSeries.update({
          time: lastCandle.time,
          value: price,
        });
        if (baselinePrice !== null) {
          areaSeries.applyOptions({
            lineColor: price >= baselinePrice ? '#059669' : '#DC2626',
          });
        }
      } else {
        const updatedCandle: CandlestickData = {
          ...lastCandle,
          close: price,
          high: Math.max(lastCandle.high, price),
          low: Math.min(lastCandle.low, price),
        };
        (seriesRef.current as ISeriesApi<'Candlestick'>).update(updatedCandle);
        currentCandleRef.current = updatedCandle;
      }
    },
    [chartType]
  );

  useMarketStream({
    symbol,
    onPriceUpdate: handlePriceUpdate,
    enabled: !loading && !error,
  });

  // 5. Annotations
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'trendline') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentDraftLine({
      id: `draft-${Date.now()}`,
      x1: e.clientX - rect.left,
      y1: e.clientY - rect.top,
      x2: e.clientX - rect.left,
      y2: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentDraftLine || activeTool !== 'trendline') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCurrentDraftLine((prev) =>
      prev ? { ...prev, x2: e.clientX - rect.left, y2: e.clientY - rect.top } : null
    );
  };

  const handleMouseUp = () => {
    if (currentDraftLine && activeTool === 'trendline') {
      const distance = Math.hypot(
        currentDraftLine.x2 - currentDraftLine.x1,
        currentDraftLine.y2 - currentDraftLine.y1
      );
      if (distance > 5) {
        setLines((prev) => [...prev, { ...currentDraftLine, id: `line-${Date.now()}` }]);
        onDrawingsChange?.(true);
      }
      setCurrentDraftLine(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: chartType === 'area' ? '#FFFFFF' : colors.colors_bg_secondary },
      ]}
    >
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={[styles.statusText, { color: colors.colors_text_secondary }]}>
            Chargement des cours...
          </Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.overlay}>
          <Text style={[styles.errorText, { color: colors.colors_button_sell }]}>
            {error}
          </Text>
        </View>
      )}

      <div
        ref={chartContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 15,
          cursor: activeTool === 'trendline' ? 'crosshair' : 'default',
          pointerEvents: activeTool === 'trendline' ? 'all' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }}>
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="#A78BFA"
              strokeWidth={2}
            />
          ))}
          {currentDraftLine && (
            <line
              x1={currentDraftLine.x1}
              y1={currentDraftLine.y1}
              x2={currentDraftLine.x2}
              y2={currentDraftLine.y2}
              stroke="#C4B5FD"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}
        </svg>
      </div>
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TradingChart;
