import { httpClient } from '@/lib/api/httpClient';

export interface CandleModel {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface QuoteModel {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface ScreenerModel {
  id: string;
  name: string;
  symbol: string;
  category: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
}

export const fetchMarketHistory = async (symbol: string): Promise<CandleModel[]> => {
  const response = await httpClient.get<CandleModel[]>(`/market/history/${symbol}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
    params: {
      _t: Date.now(), // Cache-busting systématique
    },
  });
  return response.data;
};

export const fetchMarketQuote = async (symbol: string): Promise<QuoteModel> => {
  const response = await httpClient.get<QuoteModel>(`/market/quote/${symbol}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
    params: {
      _t: Date.now(),
    },
  });
  return response.data;
};

export const fetchScreenerData = async (): Promise<ScreenerModel[]> => {
  const response = await httpClient.get<ScreenerModel[]>('/market/screener', {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
    params: {
      _t: Date.now(),
    },
  });
  return response.data;
};
