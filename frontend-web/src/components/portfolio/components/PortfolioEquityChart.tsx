'use client';

// src/components/portfolio/components/PortfolioEquityChart.tsx
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  AreaSeries,
  ColorType,
  UTCTimestamp,
} from 'lightweight-charts';

import { EquityPoint } from '@/lib/api/tradeApi';
import { PortfolioPerformanceBadge } from '@/components/portfolio/components/PortfolioPerformanceBadge';
import { useAppTheme } from '@/theme/ThemeContext';

export interface PortfolioEquityChartProps {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  equityData?: EquityPoint[];
  height?: number;
}

export const PortfolioEquityChart: React.FC<PortfolioEquityChartProps> = ({
  totalValue,
  totalPnL,
  totalPnLPercent,
  equityData = [],
  height = 360,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);

  const isPositive = totalPnL >= 0;
  const lineColor = isPositive ? colors['colors_badge_up'] : colors['colors_badge_down'];
  const topColor = isPositive ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)';

  const formattedTotalValue = useMemo(() => {
    return totalValue.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [totalValue]);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const container = chartContainerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth || 600,
      height: container.clientHeight || height,
      layout: {
        background: { type: ColorType.Solid, color: colors['colors_bg_secondary'] },
        textColor: colors['colors_text_secondary'],
        fontSize: 12,
      },
      grid: {
        vertLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
        horzLines: { color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
      },
      timeScale: {
        borderColor: colors['colors_divider_text'],
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: colors['colors_divider_text'],
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor,
      bottomColor: 'rgba(0, 0, 0, 0.0)',
      lineWidth: 2,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    if (equityData.length > 0) {
      const formatted = equityData
        .map((pt) => ({
          time: Math.floor(new Date(pt.timestamp).getTime() / 1000) as UTCTimestamp,
          value: Number(pt.value),
        }))
        .sort((a, b) => (a.time as number) - (b.time as number));

      const uniqueMap = new Map<number, number>();
      formatted.forEach((item) => uniqueMap.set(item.time as number, item.value));
      const cleanData = Array.from(uniqueMap.entries()).map(([time, value]) => ({
        time: time as UTCTimestamp,
        value,
      }));

      series.setData(cleanData);
      chart.timeScale().fitContent();
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries?.[0] || !chartRef.current) return;
      const { width, height: observedHeight } = entries[0].contentRect;
      if (width > 0 && observedHeight > 0) {
        chartRef.current.applyOptions({ width, height: observedHeight });
      } else if (width > 0) {
        chartRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [equityData, colors, isDark, lineColor, topColor, height]);

  return (
    <View style={styles.container}>
      {/* En-tête : Métriques du portefeuille */}
      <View style={styles.equityHeader}>
        <Text style={[styles.equityLabel, { color: colors['colors_text_secondary'] }]}>
          VALEUR TOTALE DU PORTEFEUILLE
        </Text>
        <View style={styles.equityValueRow}>
          <Text
            style={[
              styles.equityValueText,
              {
                color: colors['colors_text_primary'],
                fontSize: primitives['typography_font size_font-size-32'] ?? 32,
              },
            ]}
          >
            {formattedTotalValue} $
          </Text>
          <PortfolioPerformanceBadge
            amount={totalPnL}
            percentage={totalPnLPercent}
            period="GLOBAL"
          />
        </View>
      </View>

      {/* Conteneur Lightweight Chart */}
      <View style={[styles.chartWrapper, { minHeight: height }]}>
        <div
          ref={chartContainerRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            inset: 0,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2.6,
    justifyContent: 'space-between',
    width: '100%',
  },
  equityHeader: {
    marginBottom: 8,
  },
  equityLabel: {
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  equityValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  equityValueText: {
    fontWeight: '800',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  chartWrapper: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
});

export default PortfolioEquityChart;
