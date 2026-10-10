// components/features/market/components/TradingChart.tsx
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
  ColorType,
  CandlestickSeries,
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
  activeTool?: ChartTool;
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
  activeTool = 'cursor',
  showPositions = true,
  positions = [],
  onDrawingsChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const currentCandleRef = useRef<CandlestickData | null>(null);
  const activePriceLinesRef = useRef<IPriceLine[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // État local pour les tracés de lignes de tendance
  const [lines, setLines] = useState<TrendLine[]>([]);
  const [currentDraftLine, setCurrentDraftLine] = useState<TrendLine | null>(null);

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  // 1. Initialisation du graphique Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth || 800,
      height: container.clientHeight || 600,
      layout: {
        background: {
          type: ColorType.Solid,
          color: colors.colors_bg_secondary,
        },
        textColor: colors.colors_text_secondary,
      },
      grid: {
        vertLines: { color: themeMode === 'dark' ? '#1f2937' : '#e5e7eb' },
        horzLines: { color: themeMode === 'dark' ? '#1f2937' : '#e5e7eb' },
      },
      timeScale: {
        borderColor: colors.colors_divider_text,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: colors.colors_divider_text,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: colors.colors_button_buy,
      downColor: colors.colors_button_sell,
      borderUpColor: colors.colors_button_buy,
      borderDownColor: colors.colors_button_sell,
      wickUpColor: colors.colors_button_buy,
      wickDownColor: colors.colors_button_sell,
    });

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
  }, [themeMode]);

  // 2. Gestion et affichage des lignes de position (Entry, TP, SL)
  useEffect(() => {
    if (!seriesRef.current) return;

    // Nettoyage des anciennes lignes
    activePriceLinesRef.current.forEach((line) => {
      try {
        seriesRef.current?.removePriceLine(line);
      } catch (e) {
        // Ignorer si la série a été détruite
      }
    });
    activePriceLinesRef.current = [];

    if (!showPositions || positions.length === 0) return;

    // Filtrer les positions correspondant à l'actif courant
    const currentPositions = positions.filter((p) => p.symbol === symbol);

    currentPositions.forEach((pos) => {
      const isBuy = pos.direction === 'BUY';
      const mainColor = isBuy ? colors.colors_button_buy : colors.colors_button_sell;

      // Ligne d'entrée de position
      const entryLine = seriesRef.current!.createPriceLine({
        price: pos.entryPrice,
        color: mainColor,
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        axisLabelVisible: true,
        title: `${pos.direction} @ ${pos.entryPrice.toFixed(2)}`,
      });
      activePriceLinesRef.current.push(entryLine);

      // Ligne Take Profit (TP)
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

      // Ligne Stop Loss (SL)
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
  }, [positions, showPositions, symbol, themeMode]);

  // 3. Chargement de l'historique des chandeliers
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
        } catch (fetchErr) {
          formattedData = generateLocalMockCandles();
        }

        if (!isMounted) return;

        if (seriesRef.current && formattedData.length > 0) {
          seriesRef.current.setData(formattedData);
          currentCandleRef.current = formattedData[formattedData.length - 1];
          requestAnimationFrame(() => {
            chartRef.current?.timeScale().fitContent();
          });
        }
      } catch (err: any) {
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
  }, [symbol]);

  // 4. WebSocket pour mise à jour du cours en direct
  const handlePriceUpdate = useCallback((quote: QuoteModel) => {
    if (!seriesRef.current || !currentCandleRef.current) return;

    const lastCandle = currentCandleRef.current;
    const price = Number(quote.price);

    const updatedCandle: CandlestickData = {
      ...lastCandle,
      close: price,
      high: Math.max(lastCandle.high, price),
      low: Math.min(lastCandle.low, price),
    };

    seriesRef.current.update(updatedCandle);
    currentCandleRef.current = updatedCandle;
  }, []);

  useMarketStream({
    symbol,
    onPriceUpdate: handlePriceUpdate,
    enabled: !loading && !error,
  });

  // 5. Gestion interactive du tracé de lignes de tendance
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'trendline') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDraftLine({
      id: `draft-${Date.now()}`,
      x1: x,
      y1: y,
      x2: x,
      y2: y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentDraftLine || activeTool !== 'trendline') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentDraftLine((prev) => (prev ? { ...prev, x2: x, y2: y } : null));
  };

  const handleMouseUp = () => {
    if (currentDraftLine && activeTool === 'trendline') {
      const distance = Math.hypot(
        currentDraftLine.x2 - currentDraftLine.x1,
        currentDraftLine.y2 - currentDraftLine.y1
      );

      // Si le tracé fait plus de 5px, on l'enregistre
      if (distance > 5) {
        const nextLines = [...lines, { ...currentDraftLine, id: `line-${Date.now()}` }];
        setLines(nextLines);
        onDrawingsChange?.(true);
      }
      setCurrentDraftLine(null);
    }
  };

  // Permet de vider les lignes depuis l'extérieur si déclenché
  useEffect(() => {
    onDrawingsChange?.(lines.length > 0);
  }, [lines, onDrawingsChange]);

  return (
    <View style={[styles.container, { backgroundColor: colors.colors_bg_secondary }]}>
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.colors_button_buy} />
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

      {/* Conteneur Lightweight Charts */}
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

      {/* Overlay SVG d'annotation superposé */}
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
        <svg
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        >
          {/* Lignes de tendance confirmées */}
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={themeMode === 'dark' ? '#60a5fa' : '#2563eb'}
              strokeWidth={2}
            />
          ))}

          {/* Ligne en cours de tracé */}
          {currentDraftLine && (
            <line
              x1={currentDraftLine.x1}
              y1={currentDraftLine.y1}
              x2={currentDraftLine.x2}
              y2={currentDraftLine.y2}
              stroke={themeMode === 'dark' ? '#93c5fd' : '#3b82f6'}
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
