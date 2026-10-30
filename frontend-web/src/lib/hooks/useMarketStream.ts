import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { QuoteModel } from '@/lib/api/marketApi';

export type StreamStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

interface UseMarketStreamProps {
  symbol: string;
  onPriceUpdate: (quote: QuoteModel) => void;
  enabled?: boolean;
}

export const useMarketStream = ({
  symbol,
  onPriceUpdate,
  enabled = true,
}: UseMarketStreamProps) => {
  const stompClientRef = useRef<Client | null>(null);
  const [status, setStatus] = useState<StreamStatus>('DISCONNECTED');
  const onPriceUpdateRef = useRef(onPriceUpdate);

  // Maintient la référence à jour sans forcer la réinstanciation du WebSocket
  useEffect(() => {
    onPriceUpdateRef.current = onPriceUpdate;
  }, [onPriceUpdate]);

  useEffect(() => {
    if (!enabled || !symbol) {
      setStatus('DISCONNECTED');
      return;
    }

    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const token = tokenStorage.get();

    // Résolution dynamique de l'hôte pour éviter le blocage cross-origin de Safari
    const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${host}:8080/ws`;

    setStatus('CONNECTING');

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const client = new Client({
      brokerURL: wsUrl,
      connectHeaders: headers,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      beforeConnect: () => {
        setStatus('CONNECTING');
      },
      onConnect: () => {
        setStatus('CONNECTED');
        client.subscribe(`/topic/market/${cleanSymbol}`, (message) => {
          if (message.body) {
            try {
              const quote: QuoteModel = JSON.parse(message.body);
              onPriceUpdateRef.current(quote);
            } catch (err) {
              console.error('Erreur de parsing WebSocket quote :', err);
            }
          }
        });
      },
      onDisconnect: () => {
        setStatus('DISCONNECTED');
      },
      onWebSocketClose: () => {
        setStatus('DISCONNECTED');
      },
      onStompError: (frame) => {
        setStatus('DISCONNECTED');
        console.error('Erreur STOMP :', frame.headers['message'], frame.body);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
      setStatus('DISCONNECTED');
    };
  }, [symbol, enabled]);

  return { status };
};
