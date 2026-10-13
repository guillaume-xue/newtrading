import { UTCTimestamp, CandlestickData } from 'lightweight-charts';

export const FIBO_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

export const createSmoothSvgPath = (points: { x: number; y: number }[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;
    path += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
};

export const generateLocalMockCandles = (): CandlestickData[] => {
  const candles: CandlestickData[] = [];
  const now = Math.floor(Date.now() / 1000);
  const oneDay = 86400;
  let price = 63400.0;

  for (let i = 80; i >= 0; i--) {
    const time = (now - i * oneDay) as UTCTimestamp;
    const variation = (Math.random() - 0.49) * 450;
    const open = price;
    const close = price + variation;
    const high = Math.max(open, close) + Math.random() * 200;
    const low = Math.min(open, close) - Math.random() * 200;

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
