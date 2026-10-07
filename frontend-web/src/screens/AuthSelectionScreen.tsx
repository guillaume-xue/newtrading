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
import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

interface AuthSelectionScreenProps {
  onLoginPress: () => void;
  onAuthSuccess: () => void;
}

export const AuthSelectionScreen: React.FC<AuthSelectionScreenProps> = ({
  onLoginPress,
  onAuthSuccess,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme['colors_bg_secondary'] }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionLogin}>
          {/* Frame 2 : Formulaire + Logo (967px x 369px) */}
          <View style={styles.frame2}>
            {/* Section Formulaire (598px) */}
            <View style={styles.formSection}>
              {/* Frame 1 : Titre */}
              <View style={styles.titleFrame}>
                <Text style={[styles.title, { color: theme['colors_text_primary'] }]}>
                  Commencer votre carrière maintenant
                </Text>
              </View>

              {/* Conteneur des boutons (384px) */}
              <View style={styles.actionsContainer}>
                <Button
                  label="Continue avec Apple"
                  variant="outline"
                  shape="pill"
                  size="md"
                  leftIcon="apple"
                  style={styles.buttonItem}
                  onPress={() => {}}
                />

                <Button
                  label="Continue avec Google"
                  variant="outline"
                  shape="pill"
                  size="md"
                  leftIcon="google"
                  style={styles.buttonItem}
                  onPress={() => {}}
                />

                <Divider label="ou" style={styles.divider} />

                <Button
                  label="Se connecter avec e-mail"
                  variant="primary"
                  shape="pill"
                  size="md"
                  leftIcon="email"
                  style={styles.buttonItem}
                  onPress={() => setModalVisible(true)}
                />

                {/* Condition */}
                <View style={styles.conditionContainer}>
                  <Text style={[styles.legalNotice, { color: theme['colors_text_primary'] }]}>
                    En vous continuant, vous acceptez nos Conditions d’utilisation, notre Politique de confidentialité et notre Utilisation des cookies.
                  </Text>
                </View>
              </View>
            </View>

            {/* Frame 3 : Logo (369px x 369px) */}
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

          {/* text-login : Already have an account? Login */}
          <View style={styles.textLogin}>
            <Text style={[styles.loginText, { color: theme['colors_text_primary'] }]}>
              Already have an account?
            </Text>
            <Pressable onPress={onLoginPress}>
              <Text style={[styles.loginLink, { color: primitives.color_blue_600 }]}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <SignUpModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          onAuthSuccess();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // @ts-ignore : permet de couvrir toute la hauteur sous le web
    minHeight: '100vh',
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-32'], // 128px
    paddingVertical: primitives['spacing & layout_padding & margin_space-8'],    // 32px
  },
  sectionLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: primitives['spacing & layout_padding & margin_space-20'], // 80px
    width: '100%',
    maxWidth: 1184,
  },

  // Frame 2 (width: 967px, height: 369px)
  frame2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 967,
    maxWidth: '100%',
    minHeight: 369,
  },

  // section - login (width: 598px, height: 369px)
  formSection: {
    width: 598,
    maxWidth: '100%',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: primitives['spacing & layout_padding & margin_space-4'], // 16px
  },

  // Frame 1 (height: 80px, padding: 24px 0px)
  titleFrame: {
    width: 598,
    maxWidth: '100%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: primitives['spacing & layout_padding & margin_space-6'], // 24px
  },
  title: {
    fontSize: primitives['typography_font size_font-size-32'],           // 32px
    lineHeight: primitives['typography_line height_line-height-32'],     // 32px
    fontWeight: '700',
    textAlign: 'center',
  },

  // Conteneur boutons (width: 384px)
  actionsContainer: {
    width: 384,
    maxWidth: '100%',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-4'], // 16px
  },
  buttonItem: {
    width: 384,
    height: 48,
  },
  divider: {
    width: 384,
    marginVertical: 0,
  },

  // Condition
  conditionContainer: {
    width: 384,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-4'], // 16px
    paddingTop: primitives['spacing & layout_padding & margin_space-3'],        // 12px
    alignItems: 'center',
  },
  legalNotice: {
    fontSize: primitives['typography_font size_font-size-10'],       // 10px
    lineHeight: primitives['typography_line height_line-height-14'], // 14px
    textAlign: 'center',
  },

  // Frame 3 : Logo (width: 369px, height: 369px)
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

  // text-login (gap: 10px, font: 16px)
  textLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
  },
  loginText: {
    fontSize: primitives['typography_font size_font-size-16'],       // 16px
    lineHeight: primitives['typography_line height_line-height-20'], // 20px
    fontWeight: '400',
  },
  loginLink: {
    fontSize: primitives['typography_font size_font-size-16'], // 16px
    lineHeight: 19,
    fontWeight: '400',
  },
});
