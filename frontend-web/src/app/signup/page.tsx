'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthSelectionScreen } from '@/screens/AuthSelectionScreen';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <AuthSelectionScreen
      initialModal="signup"
      onModalChange={(modal) => {
        if (modal === 'login') {
          router.push('/login');
        }
      }}
      onAuthSuccess={() => router.push('/')}
      onBack={() => router.push('/')}
    />
  );
}
