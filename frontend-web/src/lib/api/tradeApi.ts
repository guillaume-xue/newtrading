import { httpClient } from './httpClient';

export interface PlaceOrderPayload {
  assetCode: string;
  orderDirection: 'BUY' | 'SELL';
  quantity: number;
}

export interface TransactionResponse {
  id: string;
  portfolioId: string;
  assetCode: string;
  orderDirection: 'BUY' | 'SELL';
  quantity: number;
  executionPrice: number;
  totalAmount: number;
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
  placeOrder: async (payload: PlaceOrderPayload): Promise<TransactionResponse> => {
    const { data } = await httpClient.post<TransactionResponse>('/trades', payload);
    return data;
  },

  getPnL: async (): Promise<PnLData> => {
    const { data } = await httpClient.get<PnLData>('/trades/pnl');
    return data;
  },

  getOrderHistory: async (page = 0, size = 20): Promise<PageResponse<TransactionResponse>> => {
    const { data } = await httpClient.get<PageResponse<TransactionResponse>>(
      `/trades/history?page=${page}&size=${size}`
    );
    return data;
  },
};
