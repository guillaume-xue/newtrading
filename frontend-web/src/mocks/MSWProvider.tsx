'use client';

import { useEffect, useState, type ReactNode } from 'react';

const isMockingEnabled = process.env.NEXT_PUBLIC_API_MOCKING === 'true';

export function MSWProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(!isMockingEnabled);

  useEffect(() => {
    if (!isMockingEnabled) return;

    // Assure l'exécution stricte dans le contexte navigateur
    if (typeof window !== 'undefined') {
      import('./browser')
        .then(({ worker }) =>
          worker.start({})
        )
        .then(() => setIsReady(true))
        .catch((error) => {
          console.error('Erreur lors du démarrage de MSW :', error);
          setIsReady(true);
        });
    }
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
