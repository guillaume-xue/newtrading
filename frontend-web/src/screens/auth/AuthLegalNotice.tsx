// src/screens/auth/AuthLegalNotice.tsx
'use client';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';

/**
 * Bloc des mentions légales et conditions d'utilisation de NewTrading[span_16](start_span)[span_16](end_span)[span_17](start_span)[span_17](end_span).
 */
export const AuthLegalNotice: React.FC = React.memo(() => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.conditionContainer}>
      <Text
        style={[
          styles.legalNotice,
          { color: colors['colors_text_secondary'] },
        ]}
      >
        En continuant, vous acceptez nos{' '}
        <Text
          style={[
            styles.legalBold,
            { color: colors['colors_text_primary'] },
          ]}
        >
          Conditions d’utilisation
        </Text>
        , notre{' '}
        <Text
          style={[
            styles.legalBold,
            { color: colors['colors_text_primary'] },
          ]}
        >
          Politique de confidentialité
        </Text>{' '}
        et notre{' '}
        <Text
          style={[
            styles.legalBold,
            { color: colors['colors_text_primary'] },
          ]}
        >
          Utilisation des cookies
        </Text>
        .
      </Text>
    </View>
  );
});

AuthLegalNotice.displayName = 'AuthLegalNotice';

const styles = StyleSheet.create({
  conditionContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'center',
  },
  legalNotice: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  legalBold: {
    fontWeight: '600',
  },
});

export default AuthLegalNotice;
