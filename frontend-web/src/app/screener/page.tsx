import type { Metadata } from 'next';
import { ScreenerScreen } from '@/screens/ScreenerScreen';

export const metadata: Metadata = {
  title: 'Screener d\'actifs | NewTrading',
  description: 'Filtre et exploration des actions, indices et cryptomonnaies disponibles pour le paper trading.',
};

export default function ScreenerPage() {
  return <ScreenerScreen />;
}
