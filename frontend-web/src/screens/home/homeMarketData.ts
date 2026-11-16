// src/screens/home/homeMarketData.ts
// Données de référence et utilitaires de sélection pour la vue HomeScreen.

export interface MarketAssetItem {
  countryOrCategory: string;
  indexName: string;
  symbol: string;
  points: number;
  equivalentAmount: string;
  changePercent: number;
}

export const INDICES_DATA: readonly MarketAssetItem[] = [
  {
    countryOrCategory: 'ÉTATS-UNIS',
    indexName: 'S&P 500 ETF',
    symbol: 'SPY',
    points: 580.4,
    equivalentAmount: '580,40$',
    changePercent: 0.43,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NASDAQ 100 ETF',
    symbol: 'QQQ',
    points: 495.2,
    equivalentAmount: '495,20$',
    changePercent: 0.85,
  },
  {
    countryOrCategory: 'INDUSTRIE',
    indexName: 'DOW JONES ETF',
    symbol: 'DIA',
    points: 425.1,
    equivalentAmount: '425,10$',
    changePercent: -0.28,
  },
  {
    countryOrCategory: 'PETITES CAP.',
    indexName: 'RUSSELL 2000 ETF',
    symbol: 'IWM',
    points: 220.5,
    equivalentAmount: '220,50$',
    changePercent: 0.62,
  },
  {
    countryOrCategory: 'ÉMERGENTS',
    indexName: 'MSCI EMERGING ETF',
    symbol: 'EEM',
    points: 44.5,
    equivalentAmount: '44,50$',
    changePercent: -0.35,
  },
  {
    countryOrCategory: 'EUROPE',
    indexName: 'FTSE EUROPE ETF',
    symbol: 'VGK',
    points: 70.15,
    equivalentAmount: '70,15$',
    changePercent: 0.18,
  },
  {
    countryOrCategory: 'JAPON',
    indexName: 'MSCI JAPAN ETF',
    symbol: 'EWJ',
    points: 72.3,
    equivalentAmount: '72,30$',
    changePercent: 0.54,
  },
  {
    countryOrCategory: 'VOLATILITÉ',
    indexName: 'VIX SHORT-TERM',
    symbol: 'VIXY',
    points: 13.5,
    equivalentAmount: '13,50$',
    changePercent: -1.82,
  },
  {
    countryOrCategory: 'MATIÈRES PREM.',
    indexName: 'GOLD SHARES ETF',
    symbol: 'GLD',
    points: 250.2,
    equivalentAmount: '250,20$',
    changePercent: 0.38,
  },
  {
    countryOrCategory: 'OBLIGATIONS',
    indexName: 'TREASURY 20+ YR',
    symbol: 'TLT',
    points: 93.1,
    equivalentAmount: '93,10$',
    changePercent: -0.15,
  },
] as const;

export const STOCKS_DATA: readonly MarketAssetItem[] = [
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'APPLE',
    symbol: 'AAPL',
    points: 230.15,
    equivalentAmount: '230,15$',
    changePercent: 1.15,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'NVIDIA',
    symbol: 'NVDA',
    points: 140.25,
    equivalentAmount: '140,25$',
    changePercent: 3.42,
  },
  {
    countryOrCategory: 'TECHNOLOGIE',
    indexName: 'MICROSOFT',
    symbol: 'MSFT',
    points: 430.5,
    equivalentAmount: '430,50$',
    changePercent: -0.64,
  },
  {
    countryOrCategory: 'CONSOMMATION',
    indexName: 'AMAZON',
    symbol: 'AMZN',
    points: 190.8,
    equivalentAmount: '190,80$',
    changePercent: 0.72,
  },
  {
    countryOrCategory: 'COMMUNICATION',
    indexName: 'ALPHABET (GOOGLE)',
    symbol: 'GOOGL',
    points: 170.4,
    equivalentAmount: '170,40$',
    changePercent: 0.45,
  },
  {
    countryOrCategory: 'COMMUNICATION',
    indexName: 'META PLATFORMS',
    symbol: 'META',
    points: 585.3,
    equivalentAmount: '585,30$',
    changePercent: 1.88,
  },
  {
    countryOrCategory: 'AUTOMOBILE',
    indexName: 'TESLA',
    symbol: 'TSLA',
    points: 220.6,
    equivalentAmount: '220,60$',
    changePercent: -1.24,
  },
  {
    countryOrCategory: 'FINANCE',
    indexName: 'BERKSHIRE HATHAWAY',
    symbol: 'BRK.B',
    points: 450.1,
    equivalentAmount: '450,10$',
    changePercent: 0.22,
  },
  {
    countryOrCategory: 'SEMICONDUCTEURS',
    indexName: 'BROADCOM',
    symbol: 'AVGO',
    points: 180.35,
    equivalentAmount: '180,35$',
    changePercent: 2.1,
  },
  {
    countryOrCategory: 'FINANCE',
    indexName: 'JPMORGAN CHASE',
    symbol: 'JPM',
    points: 225.4,
    equivalentAmount: '225,40$',
    changePercent: 0.58,
  },
] as const;

export const CRYPTOS_DATA: readonly MarketAssetItem[] = [
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'BITCOIN',
    symbol: 'BTCUSDT',
    points: 65000.0,
    equivalentAmount: '65 000,00$',
    changePercent: 2.14,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'ETHEREUM',
    symbol: 'ETHUSDT',
    points: 3500.0,
    equivalentAmount: '3 500,00$',
    changePercent: -1.35,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'SOLANA',
    symbol: 'SOLUSDT',
    points: 145.0,
    equivalentAmount: '145,00$',
    changePercent: 4.8,
  },
  {
    countryOrCategory: 'CRYPTO',
    indexName: 'BINANCE COIN',
    symbol: 'BNBUSDT',
    points: 580.0,
    equivalentAmount: '580,00$',
    changePercent: 1.25,
  },
] as const;

/**
 * Résout l'actif sélectionné dans une liste donnée, avec repli sur le premier élément.
 */
export function findSelectedAsset(
  items: readonly MarketAssetItem[],
  symbol: string
): MarketAssetItem {
  return items.find((item) => item.symbol === symbol) ?? items[0];
}
