// components/AppHeader.tsx
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
import BellIcon from '@/assets/icons/bell.svg';
import GearIcon from '@/assets/icons/gear.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import StatsIcon from '@/assets/icons/stats.svg';

import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { MarketCashInfo } from '@/components/features/market/components/MarketCashInfo';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

export type HeaderVariant = 'guest' | 'authenticated' | 'chart';

export interface NavItem {
  id: string;
  label: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'markets', label: 'Marchés' },
  { id: 'trade', label: 'Trade' },
  { id: 'options', label: 'Options' },
  { id: 'news', label: 'Actualités' },
  { id: 'screener', label: 'Screener' },
];

export interface AppHeaderProps {
  /**
   * Mode d'affichage : 'guest' (visiteur), 'authenticated' (connecté), 'chart' (barre d'outils graphique)
   */
  variant?: HeaderVariant;
  /**
   * Onglet de navigation actuellement actif
   */
  activeNavId?: string;
  onSelectNav?: (id: string) => void;
  /**
   * Valeur de la barre de recherche
   */
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  /**
   * Solde liquide pour l'utilisateur connecté (ex: 100000)
   */
  cashAmount?: number | string;
  /**
   * Callbacks d'actions
   */
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
  onNotificationsPress?: () => void;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
  onAlertPress?: () => void;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant = 'guest',
  activeNavId = 'markets',
  onSelectNav,
  searchValue,
  onSearchChange,
  cashAmount = 100000,
  onLoginPress,
  onRegisterPress,
  onNotificationsPress,
  onSettingsPress,
  onProfilePress,
  onAlertPress,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
          borderBottomColor: theme['colors_divider_text'] ?? '#D1D5DB',
        },
        style,
      ]}
    >
      {/* 1. SECTION GAUCHE : Logo & Titre de marque */}
      <View style={styles.leftGroup}>
        <View style={styles.logoRow}>
          <Image src={LogoSvg} width={32} height={32} alt="NewTrading" />
          {variant !== 'chart' && (
            <Text
              style={[
                styles.brandTitle,
                { color: theme['colors_text_primary'] ?? '#0B0F19' },
              ]}
            >
              NewTrading
            </Text>
          )}
        </View>

        {/* Navigation standard pour 'guest' et 'authenticated' */}
        {variant !== 'chart' && (
          <View style={styles.navRow}>
            {DEFAULT_NAV_ITEMS.map((item) => {
              const isActive = item.id === activeNavId;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => onSelectNav?.(item.id)}
                  style={[
                    styles.navItem,
                    isActive && [
                      styles.activeNavItem,
                      { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.navText,
                      isActive ? styles.navTextActive : styles.navTextInactive,
                      {
                        color: theme['colors_text_primary'] ?? '#0B0F19',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Barre d'outils dédiée à la vue Graphique / Chart */}
        {variant === 'chart' && (
        <View style={styles.chartToolsGroup}>
            <View style={styles.chartSearchWrapper}>
            <SearchBar
                size="sm"
                placeholder=""
                showClearIcon={false} // Empêche l'icône de déborder
                value={searchValue}
                onChangeText={onSearchChange}
            />
            </View>

            <View
              style={[
                styles.separator,
                { backgroundColor: theme['colors_divider_text'] ?? '#D1D5DB' },
              ]}
            />

            <Pressable
              style={[
                styles.iconButton,
                { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
              ]}
            >
              <Text style={ styles.chipText }>1D</Text>
            </Pressable>

            <View
              style={[
                styles.separator,
                { backgroundColor: theme['colors_divider_text'] ?? '#D1D5DB' },
              ]}
            />

            {/* Outil Statistiques / Indicateurs */}
            <Pressable
              style={[
                styles.iconButton,
                { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
              ]}
            >
              <Image src={StatsIcon} width={16} height={16} alt="Indicateurs" />
            </Pressable>

            <View
              style={[
                styles.separator,
                { backgroundColor: theme['colors_divider_text'] ?? '#D1D5DB' },
              ]}
            />

            {/* Bouton Alarme */}
            <Pressable
              onPress={onAlertPress}
              style={[
                styles.alarmChip,
                { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
              ]}
            >
              <Image src={BellIcon} width={14} height={14} alt="" />
              <Text
                style={[
                  styles.chipText,
                  { color: theme['colors_text_primary'] ?? '#0B0F19' },
                ]}
              >
                Alarme
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* 2. SECTION CENTRALE : Barre de recherche principale (sauf en vue Chart où elle est intégrée au ruban) */}
      {variant !== 'chart' && (
        <View style={styles.centerSearchWrapper}>
          <SearchBar
            size="md"
            placeholder=""
            value={searchValue}
            onChangeText={onSearchChange}
          />
        </View>
      )}

      {/* 3. SECTION DROITE : Connexion & CTA OU Liquidités & Profil */}
      <View style={styles.rightGroup}>
        {variant === 'guest' ? (
          <View style={styles.guestActionRow}>
            <Pressable onPress={onLoginPress} style={styles.loginLink}>
              <Text
                style={[
                  styles.loginText,
                  { color: theme['colors_text_primary'] ?? '#0B0F19' },
                ]}
              >
                Connexion
              </Text>
            </Pressable>

            <Button
              label="Ouvrir un compte"
              variant="primary"
              shape="rounded"
              size="sm"
              onPress={onRegisterPress}
            />
          </View>
        ) : (
          <View style={styles.authActionRow}>
            <MarketCashInfo
              label="LIQUIDITÉS"
              amount={cashAmount}
            />

            <View style={styles.iconActions}>
              <Pressable onPress={onNotificationsPress} style={styles.actionIconBtn}>
                <Image src={BellIcon} width={20} height={20} alt="Alertes" />
              </Pressable>

              <Pressable onPress={onSettingsPress} style={styles.actionIconBtn}>
                <Image src={GearIcon} width={20} height={20} alt="Paramètres" />
              </Pressable>

              <Pressable onPress={onProfilePress} style={styles.actionIconBtn}>
                <Image src={ProfileIcon} width={20} height={20} alt="Profil" />
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  brandTitle: {
    fontSize: primitives['typography_font size_font-size-18'] ?? 18,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  navItem: {
    paddingVertical: primitives['spacing & layout_padding & margin_space-1'] ?? 6,
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  activeNavItem: {
    // Injecté dynamiquement via le thème
  },
  navText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
  },
  navTextActive: {
    fontWeight: '700',
  },
  navTextInactive: {
    fontWeight: '500',
  },
  chartToolsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
  },
  chartSearchWrapper: {
    width: 190,
    overflow: 'hidden',
  },
  separator: {
    width: 1,
    height: 18,
    marginHorizontal: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  chipButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  chipText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSearchWrapper: {
    flex: 1,
    maxWidth: 260,
    marginHorizontal: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  loginLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  loginText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    fontWeight: '600',
  },
  authActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-4'] ?? 20,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
  },
  actionIconBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
