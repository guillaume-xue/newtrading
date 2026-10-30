'use client';

// components/layout/AppFooter.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Image from 'next/image';

import LogoSvg from '@/assets/icons/Logo.svg';
import { useAppTheme } from '@/theme/ThemeContext';

interface FooterLink {
  label: string;
  href?: string;
  onPress?: () => void;
}

interface FooterColumn {
  title: string;
  category: string;
  links: FooterLink[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'MARCHÉS & OUTILS',
    category: 'MARCHÉS',
    links: [
      { label: 'Actions & Indices' },
      { label: 'Cryptomonnaies' },
      { label: 'Forex & Matières premières' },
      { label: 'Graphiques interactifs (OHLCV)' },
      { label: 'Outils de tracé & Annotations' },
      { label: 'Screener d’actifs' },
    ],
  },
  {
    title: 'SIMULATION & TRADING',
    category: 'PAPER TRADING',
    links: [
      { label: 'Portefeuille virtuel' },
      { label: 'Passage d’ordres simulés' },
      { label: 'Positions Long / Short' },
      { label: 'Gestion des alertes de prix' },
      { label: 'Historique des transactions' },
    ],
  },
  {
    title: 'RESSOURCES & DÉVELOPPEURS',
    category: 'RESSOURCES',
    links: [
      { label: 'Documentation API REST' },
      { label: 'Académie & Guides de trading' },
      { label: 'Statut du système (WebSockets : Opérationnels)' },
      { label: 'Centre d’aide & Support' },
      { label: 'Notes de mise à jour (Changelog)' },
    ],
  },
  {
    title: 'LÉGAL & CONFORMITÉ',
    category: 'LÉGAL',
    links: [
      { label: 'Conditions Générales d’Utilisation (CGU)' },
      { label: 'Politique de Confidentialité' },
      { label: 'Gestion des Cookies' },
      { label: 'Sécurité des données & Chiffrement' },
      { label: 'Mentions Légales' },
    ],
  },
];

export interface AppFooterProps {
  version?: string;
  style?: ViewStyle;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  version = 'v1.0.0-beta',
  style,
}) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  useEffect(() => {
    setMounted(true);
  }, []);

  const borderColor = colors['colors_divider_text'];
  const textPrimary = colors['colors_text_primary'];
  const textMuted = colors['colors_text_secondary'];

  const logoFilter = useMemo(() => {
    return isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
  }, [isDark]);

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderTopColor: borderColor,
          borderTopWidth: primitives['border width_border-thin'] ?? 1,
          padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.innerContainer,
          {
            gap: primitives['spacing & layout_padding & margin_space-8'] ?? 24,
          },
        ]}
      >
        {/* 1. Étage Supérieur : Marque + 4 Colonnes de liens */}
        <View style={styles.topSection}>
          {/* Colonne Marque */}
          <View style={styles.brandColumn}>
            <View style={styles.logoRow}>
              <Image
                src={LogoSvg}
                width={30}
                height={30}
                alt="NewTrading"
                style={{ filter: logoFilter }}
              />
              <Text
                style={[
                  styles.brandTitle,
                  {
                    color: textPrimary,
                    fontSize: primitives['typography_font size_font-size-18'] ?? 18,
                  },
                ]}
              >
                NewTrading
              </Text>
            </View>

            <Text
              style={[
                styles.brandDescription,
                {
                  color: textMuted,
                  fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                },
              ]}
            >
              Plateforme d’analyse graphique avancée et de simulation boursière en temps réel.
            </Text>

            <Text
              style={[
                styles.statusLine,
                {
                  color: textMuted,
                  fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                },
              ]}
            >
              Statut des serveurs :{' '}
              <Text style={{ color: textPrimary, fontWeight: '600' }}>
                Tous les systèmes opérationnels
              </Text>
            </Text>

            <Text
              style={[
                styles.versionText,
                {
                  color: textMuted,
                  fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                },
              ]}
            >
              Version : {version}
            </Text>
          </View>

          {/* Grille des 4 colonnes */}
          <View style={styles.columnsContainer}>
            {FOOTER_COLUMNS.map((col, idx) => (
              <View key={idx} style={styles.linkColumn}>
                <Text
                  style={[
                    styles.columnTitle,
                    {
                      color: textPrimary,
                      fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                    },
                  ]}
                >
                  {col.title}
                </Text>
                <Text
                  style={[
                    styles.categorySubtitle,
                    {
                      color: textMuted,
                      fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                    },
                  ]}
                >
                  {col.category}
                </Text>
                <View style={styles.linksList}>
                  {col.links.map((link, linkIdx) => (
                    <Pressable
                      key={linkIdx}
                      onPress={link.onPress}
                      style={styles.linkPressable}
                    >
                      <Text
                        style={[
                          styles.linkText,
                          {
                            color: textMuted,
                            fontSize: primitives['typography_font size_font-size-13'] ?? 13,
                          },
                        ]}
                      >
                        {link.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 2. Étage Médian : Avertissement sur les risques */}
        <View
          style={[
            styles.disclaimerSection,
            {
              borderTopColor: borderColor,
              borderTopWidth: primitives['border width_border-thin'] ?? 1,
            },
          ]}
        >
          <Text
            style={[
              styles.disclaimerText,
              {
                color: textMuted,
                fontSize: primitives['typography_font size_font-size-12'] ?? 12,
              },
            ]}
          >
            Avertissement sur les risques : Les informations et outils fournis sur NewTrading sont exclusivement destinés à des fins pédagogiques et de simulation (Paper Trading). Les transactions virtuelles n’impliquent aucun capital réel et ne constituent en aucun cas des conseils en investissement financier[span_4](start_span)[span_4](end_span). Les performances passées simulées ne préjugent pas des résultats futurs sur les marchés réels[span_5](start_span)[span_5](end_span).
          </Text>
        </View>

        {/* 3. Étage Inférieur : Copyright & Métadonnées */}
        <View
          style={[
            styles.bottomSection,
            {
              borderTopColor: borderColor,
              borderTopWidth: primitives['border width_border-thin'] ?? 1,
            },
          ]}
        >
          <Text
            style={[
              styles.copyrightText,
              {
                color: textMuted,
                fontSize: primitives['typography_font size_font-size-12'] ?? 12,
              },
            ]}
          >
            © 2026 NewTrading Inc. Tous droits réservés.
          </Text>

          <View style={styles.metaRow}>
            <Text
              style={[
                styles.metaText,
                {
                  color: textMuted,
                  fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                },
              ]}
            >
              Langue :{' '}
              <Text style={{ color: textPrimary, fontWeight: '500' }}>
                Français (FR)
              </Text>
            </Text>
            <Text style={[styles.metaSeparator, { color: textMuted }]}>|</Text>
            <Text
              style={[
                styles.metaText,
                {
                  color: textMuted,
                  fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                },
              ]}
            >
              Fuseau :{' '}
              <Text style={{ color: textPrimary, fontWeight: '500' }}>
                UTC+2 (Paris)
              </Text>
            </Text>
            <Text style={[styles.metaSeparator, { color: textMuted }]}>|</Text>
            <Text
              style={[
                styles.metaText,
                {
                  color: textMuted,
                  fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                },
              ]}
            >
              Thème :{' '}
              <Text
                suppressHydrationWarning
                style={{ color: textPrimary, fontWeight: '500' }}
              >
                {mounted ? (isDark ? 'Sombre' : 'Clair') : 'Sombre'}
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    width: '100%',
  },
  innerContainer: {
    width: '100%',
    marginHorizontal: 'auto',
  },
  topSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 32,
  },
  brandColumn: {
    width: 260,
    gap: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  brandDescription: {
    lineHeight: 18,
  },
  statusLine: {
    lineHeight: 18,
  },
  versionText: {
    fontWeight: '600',
    marginTop: 4,
  },
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 24,
    minWidth: 600,
  },
  linkColumn: {
    width: 256,
    gap: 6,
  },
  columnTitle: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  categorySubtitle: {
    fontWeight: '700',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  linksList: {
    gap: 8,
  },
  linkPressable: {
    paddingVertical: 2,
  },
  linkText: {
    lineHeight: 18,
  },
  disclaimerSection: {
    paddingTop: 16,
  },
  disclaimerText: {
    lineHeight: 18,
  },
  bottomSection: {
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  copyrightText: {},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {},
  metaSeparator: {
    opacity: 0.5,
  },
});

export default AppFooter;
