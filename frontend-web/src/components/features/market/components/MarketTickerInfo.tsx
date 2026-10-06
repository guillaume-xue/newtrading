// components/MarketTickerInfo.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import Bank from '@/assets/icons/bank.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type TickerInfoEmphasis = 'title' | 'subtitle';
export type TickerInfoSize = 'sm' | 'md';

export interface MarketTickerInfoProps {
  /**
   * Texte supérieur ou symbole principal (ex: "ALLEMAGNE" ou "SPX")
   */
  title: string;
  /**
   * Texte inférieur (ex: "DAX 40") - Optionnel en taille 'sm'
   */
  subtitle?: string;
  /**
   * Taille du composant :
   * - 'md' : complet avec boîte encadrée et deux lignes de texte
   * - 'sm' : version compacte en ligne (icône directe + symbole seul)
   */
  size?: TickerInfoSize;
  /**
   * Élément mis en valeur visuellement (en mode 'md') :
   * - 'title' : Titre en avant (noir/blanc gras), sous-titre grisé
   * - 'subtitle' : Sous-titre en avant (noir/blanc gras), titre grisé
   */
  emphasis?: TickerInfoEmphasis;
  /**
   * Icône personnalisée optionnelle (remplace Bank par défaut)
   */
  icon?: React.ReactNode;
  /**
   * Style personnalisé pour le conteneur
   */
  style?: ViewStyle;
  /**
   * Style personnalisé pour la boîte d'icône (en mode 'md')
   */
  iconBoxStyle?: ViewStyle;
}

export const MarketTickerInfo: React.FC<MarketTickerInfoProps> = ({
  title,
  subtitle,
  size = 'md',
  emphasis = 'subtitle',
  icon,
  style,
  iconBoxStyle,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const isTitlePrimary = emphasis === 'title';

  const titleColor = isTitlePrimary || size === 'sm'
    ? theme['colors_text_primary']
    : theme['colors_text_secondary'];

  const subtitleColor = isTitlePrimary
    ? theme['colors_text_secondary']
    : theme['colors_text_primary'];

  // Rendu de la version compacte 'sm' (Watchlist)
  if (size === 'sm') {
    return (
      <View style={[styles.containerSm, style]}>
        <View style={styles.iconWrapperSm}>
          {icon ?? <Image src={Bank} width={16} height={16} alt="" />}
        </View>
        <Text
          style={[
            styles.titleTextSm,
            { color: titleColor },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
    );
  }

  // Rendu de la version standard 'md'
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconBox,
          {
            borderColor: theme['colors_button_outline-border'],
            backgroundColor: theme['colors_bg_secondary'],
          },
          iconBoxStyle,
        ]}
      >
        {icon ?? (
          <Image
            src={Bank}
            width={primitives['typography_line height_line-height-32'] ?? 32}
            height={primitives['typography_line height_line-height-32'] ?? 32}
            alt=""
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.titleText,
            isTitlePrimary ? styles.fontEmphasis : styles.fontMuted,
            { color: titleColor },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.subtitleText,
              !isTitlePrimary ? styles.fontEmphasis : styles.fontMuted,
              { color: subtitleColor },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Version Standard (md) ---
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 10,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  textContainer: {
    justifyContent: 'center',
  },
  titleText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    textTransform: 'uppercase',
  },
  subtitleText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
  },
  fontEmphasis: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  fontMuted: {
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // --- Version Compacte (sm) ---
  containerSm: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  iconWrapperSm: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleTextSm: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
