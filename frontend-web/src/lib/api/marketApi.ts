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

export const fetchMarketHistory = async (symbol: string): Promise<CandleModel[]> => {
  const response = await httpClient.get<CandleModel[]>(`/market/history/${symbol}`);
  return response.data;
};

export const fetchMarketQuote = async (symbol: string): Promise<QuoteModel> => {
  const response = await httpClient.get<QuoteModel>(`/market/quote/${symbol}`);
  return response.data;
};
