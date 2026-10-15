'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthSelectionScreen } from '@/screens/AuthSelectionScreen';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthSelectionScreen
      initialModal="login"
      onModalChange={(modal) => {
        if (modal === 'signup') {
          router.push('/signup');
        }
      }}
      onAuthSuccess={() => router.push('/')}
      onBack={() => router.push('/')}
    />
  );
}
