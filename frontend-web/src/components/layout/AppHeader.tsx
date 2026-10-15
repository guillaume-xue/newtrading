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
import { useRouter } from 'next/navigation';

import LogoSvg from '@/assets/icons/Logo.svg';
import BellIcon from '@/assets/icons/bell.svg';
import GearIcon from '@/assets/icons/gear.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import StatsIcon from '@/assets/icons/stats.svg';
import ChatArrowGrowIcon from '@/assets/icons/chat-arrow-grow.svg';

import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { MarketCashInfo } from '@/components/features/market/components/MarketCashInfo';
import { CreateAlertModal } from '@/components/features/market/components/CreateAlertModal';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';
import { TimeRange, TIME_RANGES } from '@/types/timeRange';

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
  selectedRange?: TimeRange;
  onSelectRange?: (range: TimeRange) => void;
  chartType?: 'candlestick' | 'area';
  onToggleChartType?: () => void;
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
  selectedRange = '1D',
  onSelectRange,
  chartType = 'candlestick',
  onToggleChartType,
  onLoginPress,
  onRegisterPress,
  onNotificationsPress,
  onSettingsPress,
  onProfilePress,
  onAlertPress,
  style,
}) => {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);

  const handleLogoPress = () => {
    router.push('/');
  };

  const handleOpenAlert = () => {
    setIsAlertModalOpen(true);
    onAlertPress?.();
  };

  const handleSelectTimeRange = (range: TimeRange) => {
    onSelectRange?.(range);
    setIsRangeMenuOpen(false);
  };

  const handleNotificationsPress = () => {
    onNotificationsPress?.();
  };

  const handleSettingsPress = () => {
    onSettingsPress?.();
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
        {/* 1. SECTION GAUCHE */}
        <View style={styles.leftGroup}>
          <Pressable onPress={handleLogoPress} style={styles.logoRow}>
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
          </Pressable>

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
                        { color: theme['colors_text_primary'] ?? '#0B0F19' },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Outils vue Graphique avec sélecteur d'intervalle */}
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

              {/* Bouton d'intervalle temporel avec dropdown */}
              <View style={styles.rangeSelectorWrapper}>
                <Pressable
                  onPress={() => setIsRangeMenuOpen((prev) => !prev)}
                  style={[
                    styles.rangeButton,
                    { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
                  ]}
                >
                  <Text style={[styles.chipText, { color: theme['colors_text_primary'] ?? '#0B0F19' }]}>
                    {selectedRange}
                  </Text>
                </Pressable>

                {isRangeMenuOpen && (
                  <View
                    style={[
                      styles.rangeDropdown,
                      {
                        backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
                        borderColor: theme['colors_divider_text'] ?? '#E5E7EB',
                      },
                    ]}
                  >
                    {TIME_RANGES.map((range) => {
                      const isSelected = range === selectedRange;
                      return (
                        <Pressable
                          key={range}
                          onPress={() => handleSelectTimeRange(range)}
                          style={[
                            styles.rangeDropdownItem,
                            isSelected && {
                              backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rangeDropdownText,
                              {
                                color: isSelected
                                  ? '#2563EB'
                                  : (theme['colors_text_primary'] ?? '#0B0F19'),
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {range}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.separator,
                  { backgroundColor: theme['colors_divider_text'] ?? '#D1D5DB' },
                ]}
              />

              {/* Bascule Candlestick / Line (Area) */}
              <Pressable
                onPress={onToggleChartType}
                style={[
                  styles.iconButton,
                  { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
                ]}
              >
                <Image
                  src={chartType === 'candlestick' ? ChatArrowGrowIcon : StatsIcon}
                  width={16}
                  height={16}
                  alt={chartType === 'candlestick' ? 'Vue Ligne' : 'Vue Bougies'}
                />
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

        {/* 2. SECTION CENTRALE */}
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

        {/* 3. SECTION DROITE */}
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
              <MarketCashInfo label="LIQUIDITÉS" amount={cashAmount} />
              <View style={styles.iconActions}>
                <Pressable onPress={handleNotificationsPress} style={styles.actionIconBtn}>
                  <Image src={BellIcon} width={20} height={20} alt="Alertes" />
                </Pressable>
                <Pressable onPress={handleSettingsPress} style={styles.actionIconBtn}>
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
    paddingHorizontal: 16,
    zIndex: 60,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    cursor: 'pointer',
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
    paddingHorizontal: 8,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  activeNavItem: {},
  navText: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
    lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
  },
  navTextActive: { fontWeight: '700' },
  navTextInactive: { fontWeight: '500' },
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
  rangeSelectorWrapper: {
    position: 'relative',
    zIndex: 70,
  },
  rangeButton: {
    minWidth: 38,
    height: 30,
    paddingHorizontal: 6,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeDropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    minWidth: 64,
    borderRadius: 8,
    borderWidth: 1,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
    paddingVertical: 4,
    zIndex: 80,
  },
  rangeDropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  rangeDropdownText: {
    fontSize: 12,
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
    width: 170,
    marginLeft: 12,
    marginRight: 'auto',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  guestActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppHeader;
