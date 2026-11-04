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

export interface PositionData {
  assetCode: string;
  category: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  valuation: number;
  unrealizedPnL: number;
  unrealizedPnLPercentage: number;
}

export interface AllocationData {
  category: string;
  amount: number;
  percentage: number;
}

export interface PnLData {
  portfolioId: string;
  currentBalance: number;
  totalPortfolioValue: number;
  totalUnrealizedPnL: number;
  totalPnLPercentage: number;
  positions?: PositionData[];
  allocations?: AllocationData[];
}

export interface EquityPoint {
  timestamp: string;
  value: number;
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

  getEquityHistory: async (): Promise<EquityPoint[]> => {
    const { data } = await httpClient.get<EquityPoint[]>('/trades/equity-history');
    return data;
  },

  getOrderHistory: async (page = 0, size = 20): Promise<PageResponse<TransactionResponse>> => {
    const { data } = await httpClient.get<PageResponse<TransactionResponse>>(
      `/trades/history?page=${page}&size=${size}`
    );
    return data;
  },
};
