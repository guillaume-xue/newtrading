// screens/AuthSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  ScrollView,
} from 'react-native';
import Image from 'next/image';

import Logo from '@/assets/icons/Logo.svg';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

export type AuthModalType = 'login' | 'signup' | null;

interface AuthSelectionScreenProps {
  initialModal?: AuthModalType;
  onModalChange: (modal: AuthModalType) => void;
  onAuthSuccess: () => void;
  onBack?: () => void;
}

export const AuthSelectionScreen: React.FC<AuthSelectionScreenProps> = ({
  initialModal = null,
  onModalChange,
  onAuthSuccess,
  onBack,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;
  const [activeModal, setActiveModal] = useState<AuthModalType>(null);

  const closeModal = () => setActiveModal(null);
  const changeAuthMode = (modal: Exclude<AuthModalType, null>) => {
    onModalChange(modal);
  };
  const openModal = (modal: Exclude<AuthModalType, null>) => {
    onModalChange(modal);
    setActiveModal(modal);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme['colors_bg_secondary'] }]}>
      {/* Bouton retour vers la page principale */}
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={12}>
          <Text style={[styles.backButtonText, { color: theme['colors_text_secondary'] }]}>
            ← Retour
          </Text>
        </Pressable>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionLogin}>
          {/* Frame 2 : Formulaire + Logo */}
          <View style={styles.frame2}>
            {/* Section Formulaire */}
            <View style={styles.formSection}>
              <View style={styles.titleFrame}>
                <Text style={[styles.title, { color: theme['colors_text_primary'] }]}>
                  Commencez votre carrière maintenant
                </Text>
              </View>

              {/* Conteneur des boutons */}
              <View style={styles.actionsContainer}>
                <Button
                  label="Continuer avec Apple"
                  variant="outline"
                  shape="pill"
                  size="md"
                  leftIcon="apple"
                  style={styles.buttonItem}
                  onPress={() => {}}
                />

                <Button
                  label="Continuer avec Google"
                  variant="outline"
                  shape="pill"
                  size="md"
                  leftIcon="google"
                  style={styles.buttonItem}
                  onPress={() => {}}
                />

                <Divider label="ou" style={styles.divider} />

                {initialModal === 'signup' ? (<Button
                  label="Créer un compte avec e-mail"
                  variant="primary"
                  shape="pill"
                  size="md"
                  leftIcon="email"
                  style={styles.buttonItem}
                  onPress={() => openModal('signup')}
                />) : (<Button
                  label="Se connecter avec e-mail"
                  variant="primary"
                  shape="pill"
                  size="md"
                  leftIcon="email"
                  style={styles.buttonItem}
                  onPress={() => openModal('login')}
                />)}

                <View style={styles.conditionContainer}>
                  <Text style={[styles.legalNotice, { color: theme['colors_text_secondary'] }]}>
                    En continuant, vous acceptez nos{' '}
                    <Text style={[styles.legalBold, { color: theme['colors_text_primary'] }]}>
                      Conditions d’utilisation
                    </Text>
                    , notre{' '}
                    <Text style={[styles.legalBold, { color: theme['colors_text_primary'] }]}>
                      Politique de confidentialité
                    </Text>{' '}
                    et notre{' '}
                    <Text style={[styles.legalBold, { color: theme['colors_text_primary'] }]}>
                      Utilisation des cookies
                    </Text>
                    .
                  </Text>
                </View>
              </View>
            </View>

            {/* Frame 3 : Logo */}
            <View style={styles.logoFrame}>
              <Image
                src={Logo}
                width={369}
                height={369}
                alt="NewTrading Logo"
                style={styles.logoImage}
                priority
              />
            </View>
          </View>

          {/* Lien Connexion */}
          <View style={styles.textLogin}>
            <Text style={[styles.loginText, { color: theme['colors_text_primary'] }]}>
              Vous avez déjà un compte ?
            </Text>
            {initialModal === 'signup' ? (
              <Pressable onPress={() => changeAuthMode('login')}>
                <Text style={[styles.loginLink, { color: primitives.color_blue_600 }]}>
                  Se connecter
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => changeAuthMode('signup')}>
                <Text style={[styles.loginLink, { color: primitives.color_blue_600 }]}>
                  S'inscrire
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      <SignUpModal
        visible={activeModal === 'signup'}
        onClose={closeModal}
        onSuccess={onAuthSuccess}
        onNavigateToLogin={() => openModal('login')}
      />
      <LoginModal
        visible={activeModal === 'login'}
        onClose={closeModal}
        onSuccess={onAuthSuccess}
        onNavigateToSignUp={() => openModal('signup')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // @ts-ignore
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 32,
    zIndex: 10,
    padding: 8,
  },
  backButtonText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-32'],
    paddingVertical: primitives['spacing & layout_padding & margin_space-8'],
  },
  sectionLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: primitives['spacing & layout_padding & margin_space-20'],
    width: '100%',
    maxWidth: 1184,
  },
  frame2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 967,
    maxWidth: '100%',
    minHeight: 369,
  },
  formSection: {
    width: 598,
    maxWidth: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: primitives['spacing & layout_padding & margin_space-4'],
  },
  titleFrame: {
    width: 598,
    maxWidth: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: primitives['spacing & layout_padding & margin_space-6'],
  },
  title: {
    fontSize: primitives['typography_font size_font-size-32'],
    lineHeight: primitives['typography_line height_line-height-32'],
    fontWeight: '700',
    textAlign: 'center',
  },
  actionsContainer: {
    width: 384,
    maxWidth: '100%',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-4'],
  },
  buttonItem: {
    width: 384,
    height: 48,
  },
  divider: {
    width: 384,
    marginVertical: 0,
  },
  conditionContainer: {
    width: 384,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'],
    paddingTop: primitives['spacing & layout_padding & margin_space-3'],
    alignItems: 'center',
  },
  legalNotice: {
    fontSize: primitives['typography_font size_font-size-10'],
    lineHeight: primitives['typography_line height_line-height-14'],
    textAlign: 'center',
  },
  legalBold: {
    fontWeight: '600',
  },
  logoFrame: {
    width: 369,
    height: 369,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 369,
    height: 369,
    objectFit: 'contain',
  },
  textLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
  },
  loginText: {
    fontSize: primitives['typography_font size_font-size-16'],
    lineHeight: primitives['typography_line height_line-height-20'],
    fontWeight: '400',
  },
  loginLink: {
    fontSize: primitives['typography_font size_font-size-16'],
    lineHeight: 19,
    fontWeight: '600',
  },
});
