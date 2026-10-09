// components/features/market/components/TradingChart.tsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  CandlestickData,
  ColorType,
  CandlestickSeries,
} from 'lightweight-charts';

import { fetchMarketHistory, CandleModel, QuoteModel } from '@/lib/api/marketApi';
import { useMarketStream } from '@/lib/hooks/useMarketStream';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';

interface TradingChartProps {
  symbol: string;
  themeMode?: 'dark' | 'light';
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
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const currentCandleRef = useRef<CandlestickData | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const colors = themeMode === 'dark' ? darkColors : lightColors;

  // 1. Initialisation dynamique et écoute de la taille du conteneur
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

    // ResizeObserver pour adapter largeur ET hauteur au pixel près
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

  // 2. Chargement de l'historique
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
            // Si l'API renvoie un tableau vide
            formattedData = generateLocalMockCandles();
          }
        } catch (fetchErr) {
          // Fallback immédiat : quota atteint, backend hors ligne ou erreur réseau
          console.warn('Erreur API ou quota atteint. Utilisation des données de simulation locales :', fetchErr);
          formattedData = generateLocalMockCandles();
        }

        if (!isMounted) return;

        if (seriesRef.current && formattedData.length > 0) {
          seriesRef.current.setData(formattedData);
          currentCandleRef.current = formattedData[formattedData.length - 1];
          // Laisse le temps au layout de poser les dimensions avant d'ajuster l'échelle
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


  // 3. Mise à jour temps réel via WebSocket
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

      {/* Conteneur DOM étiré aux quatre coins du parent */}
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
    zIndex: 10,
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
