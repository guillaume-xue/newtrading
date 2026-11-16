'use client';

import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Image from 'next/image';

import Logo from '@/assets/icons/Logo.svg';
import { useAppTheme } from '@/theme/ThemeContext';

export interface BrandLogoProps {
  /** Largeur en pixels (défaut : 38 pour header modale, 369 pour écran d'accueil auth). */
  width?: number;
  /** Hauteur en pixels. */
  height?: number;
  /** Applique le filtre noir/blanc selon le thème actif (utile sur Logo.svg sombre). */
  adaptToTheme?: boolean;
  /** Priorité de chargement Next.js (à activer uniquement above-the-fold). */
  priority?: boolean;
  style?: ViewStyle;
}

export const BrandLogo: React.FC<BrandLogoProps> = React.memo(
  ({
    width = 38,
    height = 24,
    adaptToTheme = false,
    priority = false,
    style,
  }) => {
    const { theme } = useAppTheme();

    // En dark mode, un logo sombre (#0b0f19) doit être inversé pour rester lisible[span_41](start_span)[span_41](end_span)[span_42](start_span)[span_42](end_span).
    const imageFilter = useMemo(() => {
      if (!adaptToTheme) return undefined;
      return theme.isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
    }, [adaptToTheme, theme.isDark]);

    return (
      <View style={[styles.wrapper, { width, height }, style]}>
        <Image
          src={Logo}
          width={width}
          height={height}
          alt="NewTrading Logo"
          priority={priority}
          style={{
            width,
            height,
            objectFit: 'contain',
            ...(imageFilter ? { filter: imageFilter } : {}),
          }}
        />
      </View>
    );
  }
);

BrandLogo.displayName = 'BrandLogo';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BrandLogo;
