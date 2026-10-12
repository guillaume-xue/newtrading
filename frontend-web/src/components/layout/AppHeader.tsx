// components/AppHeader.tsx
'use client';

import React, { useState } from 'react';
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
import { CreateAlertModal } from '@/components/features/market/components/CreateAlertModal';

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
  variant?: HeaderVariant;
  activeNavId?: string;
  onSelectNav?: (id: string) => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  cashAmount?: number | string;
  assetCode?: string;
  currentPrice?: number;
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
  assetCode = 'AAPL',
  currentPrice,
  onLoginPress,
  onRegisterPress,
  onSettingsPress,
  onProfilePress,
  onAlertPress,
  style,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleOpenAlert = () => {
    setIsAlertModalOpen(true);
    onAlertPress?.();
  };

  return (
    <>
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
        {/* 1. SECTION GAUCHE : Logo & Navigation */}
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

          {/* Navigation standard */}
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

          {/* Outils vue Graphique */}
          {variant === 'chart' && (
            <View style={styles.chartToolsGroup}>
              <View style={styles.chartSearchWrapper}>
                <SearchBar
                  size="sm"
                  placeholder=""
                  showClearIcon={false}
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
                <Text style={styles.chipText}>1D</Text>
              </Pressable>

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
                <Image src={StatsIcon} width={16} height={16} alt="Indicateurs" />
              </Pressable>

              <View
                style={[
                  styles.separator,
                  { backgroundColor: theme['colors_divider_text'] ?? '#D1D5DB' },
                ]}
              />

              <Pressable
                onPress={handleOpenAlert}
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

        {/* 2. SECTION CENTRALE : Barre de recherche à largeur constante */}
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

        {/* 3. SECTION DROITE : Aligné à droite avec minWidth */}
        <View style={styles.rightGroup}>
          {variant === 'guest' ? (
            <View style={styles.guestActionRow}>
              <Button
                label="Connexion"
                variant="outline"
                shape="rounded"
                size="sm"
                onPress={onLoginPress}
                style={styles.headerActionButton}
              />

              <Button
                label="Ouvrir un compte"
                variant="primary"
                shape="rounded"
                size="sm"
                onPress={onRegisterPress}
                style={styles.headerActionButton}
              />
            </View>
          ) : (
            <View style={styles.authActionRow}>
              <MarketCashInfo
                label="LIQUIDITÉS"
                amount={cashAmount}
              />

              <View style={styles.iconActions}>
                <Pressable onPress={handleOpenAlert} style={styles.actionIconBtn}>
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

      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        assetCode={assetCode}
        currentPrice={currentPrice}
      />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Réduit de 24 à 16 pour éviter tout débordement à droite
    borderBottomWidth: primitives['border width_border-thin'] ?? 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16, // Réduit de 24 à 16 pour compacter la navigation
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
    paddingVertical: 4,
    paddingHorizontal: 8, // Légèrement compacté (8 au lieu de 10)
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  activeNavItem: {},
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
    width: 140,
    overflow: 'hidden',
  },
  separator: {
    width: 1,
    height: 18,
    marginHorizontal: primitives['spacing & layout_padding & margin_space-1'] ?? 4,
  },
  alarmChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  chipText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionButton: {
    minHeight: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  centerSearchWrapper: {
    width: 170, // Réduit de 240 à 170 : tout rentre sans déborder
    marginLeft: 12,
    marginRight: 'auto',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0, // Empêche le bloc utilisateur d'être compressé ou poussé hors de l'écran
  },
  guestActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Compacté de 20 à 12 pour sécuriser l'icône profil
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Compacté de 12 à 8
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
