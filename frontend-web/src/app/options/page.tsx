'use client';

import React from 'react';
import { FeatureComingSoon } from '@/components/layout/FeatureComingSoon';

export default function OptionsPage() {
  return (
    <FeatureComingSoon
      title="Trading d'Options & Dérivés"
      description="Le carnet d'ordres sur les contrats d'options (Calls, Puts et stratégies grecques) sera disponible dès la version V1.1."
      activeNavId="options"
    />
  );
}
