import { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { CandleModel, QuoteModel } from '@/lib/api/marketApi';

/**
 * Normalise un timestamp (secondes UNIX, millisecondes UNIX ou ISO string)
 * en UTCTimestamp (secondes) requis par Lightweight Charts.
 */
export function parseMarketTimestamp(rawTimestamp: unknown): UTCTimestamp | null {
  if (typeof rawTimestamp === 'number' && Number.isFinite(rawTimestamp)) {
    const seconds = rawTimestamp > 1e11 ? Math.floor(rawTimestamp / 1000) : Math.floor(rawTimestamp);
    return seconds > 0 ? (seconds as UTCTimestamp) : null;
  }

  if (typeof rawTimestamp === 'string' && rawTimestamp.trim().length > 0) {
    const numeric = Number(rawTimestamp);
    if (!Number.isNaN(numeric) && !rawTimestamp.includes('-') && !rawTimestamp.includes('T')) {
      const seconds = numeric > 1e11 ? Math.floor(numeric / 1000) : Math.floor(numeric);
      return seconds > 0 ? (seconds as UTCTimestamp) : null;
    }

    const parsedMs = Date.parse(rawTimestamp);
    if (!Number.isNaN(parsedMs)) {
      return Math.floor(parsedMs / 1000) as UTCTimestamp;
    }
  }

  return null;
}

/**
 * Nettoie, valide, dédoublonne par timestamp et trie chronologiquement
 * les bougies historiques reçues de l'API.
 */
export function normalizeCandles(rawCandles: CandleModel[]): CandlestickData[] {
  if (!Array.isArray(rawCandles) || rawCandles.length === 0) {
    return [];
  }

  const dedupedByTime = new Map<number, CandlestickData>();

  for (const item of rawCandles) {
    const timestamp = parseMarketTimestamp(item?.timestamp);
    const close = Number(item?.close);

    if (timestamp === null || !Number.isFinite(close) || close <= 0) {
      continue;
    }

    const open = Number(item?.open);
    const high = Number(item?.high);
    const low = Number(item?.low);

    dedupedByTime.set(timestamp as number, {
      time: timestamp,
      open: Number.isFinite(open) && open > 0 ? open : close,
      high: Number.isFinite(high) && high > 0 ? high : close,
      low: Number.isFinite(low) && low > 0 ? low : close,
      close,
    });
  }

  return Array.from(dedupedByTime.values()).sort(
    (a, b) => (a.time as number) - (b.time as number)
  );
}

/**
 * Applique un tick temps réel à la série de bougies existante
 * sans mutation destructrice de l'historique précédent.
 */
export function applyLiveQuoteToCandles(
  previousCandles: CandlestickData[],
  quote: QuoteModel
): { nextCandles: CandlestickData[]; updatedCandle: CandlestickData } | null {
  if (previousCandles.length === 0) return null;

  const price = Number(quote?.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  const parsedQuoteTime = parseMarketTimestamp(quote?.timestamp);
  const lastIndex = previousCandles.length - 1;
  const lastCandle = previousCandles[lastIndex];
  const lastTime = lastCandle.time as number;

  const quoteTime =
    parsedQuoteTime !== null && (parsedQuoteTime as number) >= lastTime
      ? parsedQuoteTime
      : lastCandle.time;

  if ((quoteTime as number) > lastTime) {
    const newCandle: CandlestickData = {
      time: quoteTime,
      open: price,
      high: price,
      low: price,
      close: price,
    };
    return {
      nextCandles: [...previousCandles, newCandle],
      updatedCandle: newCandle,
    };
  }

  const updatedCandle: CandlestickData = {
    time: lastCandle.time,
    open: lastCandle.open,
    high: Math.max(lastCandle.high, price),
    low: Math.min(lastCandle.low, price),
    close: price,
  };

  const nextCandles = [...previousCandles];
  nextCandles[lastIndex] = updatedCandle;

  return { nextCandles, updatedCandle };
}

export function formatUsdPrice(value: number, locale = 'en-US'): string {
  if (!Number.isFinite(value) || value <= 0) return '---';
  return value.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCashBalance(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 100000;
  return `${safeValue.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} $`;
}
