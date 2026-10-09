import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { QuoteModel } from '@/lib/api/marketApi';

interface UseMarketStreamProps {
  symbol: string;
  onPriceUpdate: (quote: QuoteModel) => void;
  enabled?: boolean;
}

export const useMarketStream = ({ symbol, onPriceUpdate, enabled = true }: UseMarketStreamProps) => {
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!enabled || !symbol) return;

    const token = tokenStorage.get();
    if (!token) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        client.subscribe(`/topic/market/${symbol}`, (message) => {
          if (message.body) {
            try {
              const quote: QuoteModel = JSON.parse(message.body);
              onPriceUpdate(quote);
            } catch (err) {
              console.error('Erreur de parsing WebSocket quote :', err);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Erreur STOMP :', frame.headers['message'], frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [symbol, enabled, onPriceUpdate]);
};
