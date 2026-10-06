// components/AppFooter.tsx
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  useColorScheme,
} from 'react-native';
import Image from 'next/image';

import LogoSvg from '@/assets/icons/Logo.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const borderColor = theme['colors_divider_text'] ?? '#D1D5DB';
  const textPrimary = theme['colors_text_primary'] ?? '#0B0F19';
  const textMuted = theme['colors_text_secondary'] ?? '#9CA3AF';

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderTopColor: borderColor,
        },
        style,
      ]}
    >
      <View style={styles.innerContainer}>
        {/* 1. Étage Supérieur : Marque + 4 Colonnes de liens */}
        <View style={styles.topSection}>
          {/* Colonne Marque */}
          <View style={styles.brandColumn}>
            <View style={styles.logoRow}>
              <Image src={LogoSvg} width={30} height={30} alt="NewTrading" />
              <Text style={[styles.brandTitle, { color: textPrimary }]}>
                NewTrading
              </Text>
            </View>

            {/* Réseaux sociaux placeholder */}
            <View style={styles.socialRow}>
              <Text style={[styles.socialIcon, { color: textPrimary }]}>􀉣</Text>
              <Text style={[styles.socialIcon, { color: textPrimary }]}>􀌀</Text>
              <Text style={[styles.socialIcon, { color: textPrimary }]}>􀋭</Text>
            </View>

            <Text style={[styles.brandDescription, { color: textMuted }]}>
              Plateforme d’analyse graphique avancée et de simulation boursière en temps réel.
            </Text>

            <Text style={[styles.statusLine, { color: textMuted }]}>
              Statut des serveurs : <Text style={{ color: textPrimary, fontWeight: '600' }}>Tous les systèmes opérationnels</Text>
            </Text>

            <Text style={[styles.versionText, { color: textMuted }]}>
              Version : {version}
            </Text>
          </View>

          {/* Grille des 4 colonnes */}
          <View style={styles.columnsContainer}>
            {FOOTER_COLUMNS.map((col, idx) => (
              <View key={idx} style={styles.linkColumn}>
                <Text style={[styles.columnTitle, { color: textPrimary }]}>
                  {col.title}
                </Text>
                <Text style={[styles.categorySubtitle, { color: textMuted }]}>
                  {col.category}
                </Text>
                <View style={styles.linksList}>
                  {col.links.map((link, linkIdx) => (
                    <Pressable
                      key={linkIdx}
                      onPress={link.onPress}
                      style={styles.linkPressable}
                    >
                      <Text style={[styles.linkText, { color: textMuted }]}>
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
        <View style={[styles.disclaimerSection, { borderTopColor: borderColor }]}>
          <Text style={[styles.disclaimerText, { color: textMuted }]}>
            Avertissement sur les risques : Les informations et outils fournis sur NewTrading sont exclusivement destinés à des fins pédagogiques et de simulation (Paper Trading). Les transactions virtuelles n’impliquent aucun capital réel et ne constituent en aucun cas des conseils en investissement financier. Les performances passées simulées ne préjugent pas des résultats futurs sur les marchés réels.
          </Text>
        </View>

        {/* 3. Étage Inférieur : Copyright & Métadonnées */}
        <View style={[styles.bottomSection, { borderTopColor: borderColor }]}>
          <Text style={[styles.copyrightText, { color: textMuted }]}>
            © 2026 NewTrading Inc. Tous droits réservés.
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: textMuted }]}>
              Langue : <Text style={{ color: textPrimary, fontWeight: '500' }}>Français (FR)</Text>
            </Text>
            <Text style={[styles.metaSeparator, { color: textMuted }]}>|</Text>
            <Text style={[styles.metaText, { color: textMuted }]}>
              Fuseau : <Text style={{ color: textPrimary, fontWeight: '500' }}>UTC+2 (Paris)</Text>
            </Text>
            <Text style={[styles.metaSeparator, { color: textMuted }]}>|</Text>
            <Text style={[styles.metaText, { color: textMuted }]}>
              Thème : <Text style={{ color: textPrimary, fontWeight: '500' }}>{scheme === 'dark' ? 'Sombre' : 'Clair'}</Text>
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
    borderTopWidth: primitives['border width_border-thin'] ?? 1,
    paddingTop: primitives['spacing & layout_padding & margin_space-8'] ?? 48,
    paddingBottom: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 1320,
    marginHorizontal: 'auto',
    gap: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
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
    fontSize: primitives['typography_font size_font-size-18'] ?? 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  socialIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  brandDescription: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: 18,
  },
  statusLine: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: 18,
  },
  versionText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
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
    width: 170,
    gap: 6,
  },
  columnTitle: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  categorySubtitle: {
    fontSize: primitives['typography_font size_font-size-10'] ?? 10,
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
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: 16,
  },
  disclaimerSection: {
    borderTopWidth: primitives['border width_border-thin'] ?? 1,
    paddingTop: 16,
  },
  disclaimerText: {
    fontSize: 11,
    lineHeight: 16,
  },
  bottomSection: {
    borderTopWidth: primitives['border width_border-thin'] ?? 1,
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  copyrightText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
  },
  metaSeparator: {
    fontSize: 12,
    opacity: 0.5,
  },
});
