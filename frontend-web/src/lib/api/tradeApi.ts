import { httpClient } from './httpClient';

export interface PlaceOrderPayload {
  assetCode: string;
  orderDirection: 'BUY' | 'SELL';
  quantity: number;
}

export interface SimulatedTransactionResponse {
  id: string;
  assetCode: string;
  orderDirection: 'BUY' | 'SELL';
  quantity: number;
  executionPrice: number;
  executedAt: string;
}

export interface PnLData {
  portfolioId: string;
  currentBalance: number;
  totalPortfolioValue: number;
  totalUnrealizedPnL: number;
  totalPnLPercentage: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const tradeApi = {
  placeOrder: async (payload: PlaceOrderPayload): Promise<SimulatedTransactionResponse> => {
    const { data } = await httpClient.post<SimulatedTransactionResponse>('/api/v1/trades', payload);
    return data;
  },

  getPnL: async (): Promise<PnLData> => {
    const { data } = await httpClient.get<PnLData>('/api/v1/trades/pnl');
    return data;
  },

  getOrderHistory: async (page = 0, size = 20): Promise<PageResponse<SimulatedTransactionResponse>> => {
    const { data } = await httpClient.get<PageResponse<SimulatedTransactionResponse>>(
      `/api/v1/trades/history?page=${page}&size=${size}`
    );
    return data;
  },
};
