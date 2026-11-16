// src/hooks/useClientMounted.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Indique si le composant est monté côté client après l'hydratation SSR.
 * Utilisé pour différer le montage des portails/animations natifs (`Modal`)
 * qui injectent des nœuds DOM différents entre le serveur et le client.
 */
export function useClientMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

export default useClientMounted;
