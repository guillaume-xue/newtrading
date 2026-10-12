
import { httpClient } from './httpClient';

export interface CreateAlertPayload {
  assetCode: string;
  targetPrice: number;
  triggerCondition: 'ABOVE' | 'BELOW';
  notificationChannel: 'EMAIL' | 'PUSH' | 'BOTH';
}

export interface AlertResponse {
  id: string;
  assetCode: string;
  targetPrice: number;
  triggerCondition: 'ABOVE' | 'BELOW';
  notificationChannel: 'EMAIL' | 'PUSH' | 'BOTH';
  isTriggered: boolean;
  createdAt: string;
}

export const alertApi = {
  createAlert: async (payload: CreateAlertPayload): Promise<AlertResponse> => {
    const response = await httpClient.post<AlertResponse>('/alerts', payload);
    return response.data;
  },

  getAlerts: async (): Promise<AlertResponse[]> => {
    const response = await httpClient.get<AlertResponse[]>('/alerts');
    return response.data;
  },

  deleteAlert: async (alertId: string): Promise<void> => {
    await httpClient.delete(`/alerts/${alertId}`);
  },
};
