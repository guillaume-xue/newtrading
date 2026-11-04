'use client';

import { type ReactNode } from 'react';

export function MSWProvider({ children }: { children: ReactNode }) {
  // Désactivation complète de MSW pour laisser passer les appels réels vers Spring Boot et Docker
  return <>{children}</>;
}
