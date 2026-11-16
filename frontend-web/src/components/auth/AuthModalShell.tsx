// src/components/auth/AuthModalShell.tsx
'use client';

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';

import { BrandLogo } from '@/components/ui/BrandLogo';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme/ThemeContext';

export interface AuthModalShellProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  error?: string | null;
  errorActionLabel?: string;
  onErrorAction?: () => void;
  leftHeaderSlot?: React.ReactNode;
  footer: React.ReactNode;
  cardStyle?: ViewStyle;
  children: React.ReactNode;
}

/**
 * Coquille modale partagée par LoginModal et SignUpModal[span_10](start_span)[span_10](end_span).
 * Utilise un overlay plein écran RN Web au lieu du portail `Modal` de `react-native-web`
 * pour éviter les conflits d'hydratation et de clics sous Next.js 16.3.5 (Turbopack)[span_11](start_span)[span_11](end_span).
 */
export const AuthModalShell: React.FC<AuthModalShellProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  error,
  errorActionLabel,
  onErrorAction,
  leftHeaderSlot,
  footer,
  cardStyle,
  children,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  // Fermeture au clavier (Échap) sur le web pour l'accessibilité et l'UX
  useEffect(() => {
    if (!visible || Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[styles.overlayRoot, styles.webFixedOverlay]}
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.overlayDismiss}
          onPress={onClose}
          accessibilityLabel="Fermer l'arrière-plan"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors['colors_bg_secondary'],
                borderColor: colors['colors_divider_text'],
                borderRadius:
                  primitives['spacing & layout_border radius_radius-md'] ?? 8,
              },
              cardStyle,
            ]}
          >
            {/* En-tête : slot gauche optionnel, logo NewTrading, bouton fermer[span_12](start_span)[span_12](end_span) */}
            <View style={styles.header}>
              {leftHeaderSlot ?? <View style={styles.headerSlotPlaceholder} />}

              <BrandLogo width={38} height={24} />

              <Button
                closeButton
                variant="ghost"
                onPress={onClose}
                accessibilityLabel="Fermer la fenêtre"
              />
            </View>

            {/* Corps */}
            <View style={styles.body}>
              <View style={styles.contentColumn}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors['colors_text_primary'],
                      fontSize:
                        primitives['typography_font size_font-size-24'] ?? 24,
                    },
                  ]}
                >
                  {title}
                </Text>

                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: colors['colors_text_secondary'],
                      fontSize:
                        primitives['typography_font size_font-size-14'] ?? 14,
                    },
                  ]}
                >
                  {subtitle}
                </Text>

                {error ? (
                  <View
                    accessibilityRole="alert"
                    style={[
                      styles.errorBanner,
                      {
                        backgroundColor: colors['colors_badge_down-bg'],
                        borderColor: colors['colors_badge_down-border'],
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.errorText,
                        { color: colors['colors_badge_down-text'] },
                      ]}
                    >
                      {error}
                    </Text>

                    {errorActionLabel && onErrorAction ? (
                      <Pressable onPress={onErrorAction}>
                        <Text
                          style={[
                            styles.errorActionText,
                            { color: colors['colors_badge_primary-action-bg'] },
                          ]}
                        >
                          {errorActionLabel}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}

                {children}
              </View>
            </View>

            {/* Pied de page */}
            <View style={styles.footer}>{footer}</View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  webFixedOverlay: Platform.select({
    web: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    default: {},
  }) as ViewStyle,
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
  },
  modalCard: {
    width: 520,
    minHeight: 460,
    maxWidth: '100%',
    paddingHorizontal: 40,
    paddingVertical: 32,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)' },
      default: { elevation: 8 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerSlotPlaceholder: {
    width: 28,
    height: 28,
  },
  body: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 16,
  },
  contentColumn: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  errorActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default AuthModalShell;
