'use client';

import React from 'react';
import { FeatureComingSoon } from '@/components/layout/FeatureComingSoon';

export default function NewsPage() {
  return (
    <FeatureComingSoon
      title="Actualités & Flux Financiers"
      description="Le flux d'actualités boursières en temps réel et l'agrégateur de dépêches économiques arriveront dans la mise à jour V1.1."
      activeNavId="news"
    />
  );
}
