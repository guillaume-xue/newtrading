// src/components/auth/AuthRoutePage.tsx
'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  AuthSelectionScreen,
  AuthModalType,
} from '@/screens/AuthSelectionScreen';

export type AuthRouteMode = 'login' | 'signup';

export interface AuthRoutePageProps {
  mode: AuthRouteMode;
}

/**
 * Orchestre la navigation App Router entre `/login`, `/signup` et `/`[span_20](start_span)[span_20](end_span).
 */
export const AuthRoutePage: React.FC<AuthRoutePageProps> = ({ mode }) => {
  const router = useRouter();

  const handleModalChange = useCallback(
    (modal: AuthModalType) => {
      if (modal === 'login' && mode !== 'login') {
        router.push('/login');
      } else if (modal === 'signup' && mode !== 'signup') {
        router.push('/signup');
      }
    },
    [mode, router]
  );

  const handleNavigateHome = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <AuthSelectionScreen
      initialModal={mode}
      onModalChange={handleModalChange}
      onAuthSuccess={handleNavigateHome}
      onBack={handleNavigateHome}
    />
  );
};

export default AuthRoutePage;
