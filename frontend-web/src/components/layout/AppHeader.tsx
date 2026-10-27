'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  ScrollView,
} from 'react-native';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

import LogoSvg from '@/assets/icons/Logo.svg';
import BellIcon from '@/assets/icons/bell.svg';
import GearIcon from '@/assets/icons/gear.svg';
import ProfileIcon from '@/assets/icons/profile.svg';
import StatsIcon from '@/assets/icons/stats.svg';
import ChatArrowGrowIcon from '@/assets/icons/chat-arrow-grow.svg';
import BrightnessIcon from '@/assets/icons/brightness.svg';
import MoonIcon from '@/assets/icons/moon.svg';

import { SearchBar } from '@/components/ui/SearchBar';
import { Button } from '@/components/ui/Button';
import { MarketCashInfo } from '@/components/features/market/components/MarketCashInfo';
import { CreateAlertModal } from '@/components/features/market/components/CreateAlertModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignUpModal } from '@/components/auth/SignUpModal';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { alertApi, AlertResponse } from '@/lib/api/alertApi';
import { StreamStatus } from '@/lib/hooks/useMarketStream';
import { useAppTheme } from '@/theme/ThemeContext';
import { TimeRange, TIME_RANGES } from '@/types/timeRange';

export type HeaderVariant = 'guest' | 'authenticated' | 'chart';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'markets', label: 'Marchés', href: '/' },
  { id: 'trade', label: 'Trade', href: '/trade' },
  { id: 'options', label: 'Options', href: '/options' },
  { id: 'news', label: 'Actualités', href: '/news' },
  { id: 'screener', label: 'Screener', href: '/screener' },
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
  streamStatus?: StreamStatus;
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  variant,
  activeNavId,
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
  streamStatus,
  style,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Consommation du thème sémantique global NewTrading
  const { theme, toggleTheme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const { isAuthenticated, isLoading } = useAuthStore();

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');

  // État des notifications reçues
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AlertResponse[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchTriggeredAlerts = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setNotifLoading(true);
      const alerts = await alertApi.getAlerts();
      const triggered = alerts.filter((a) => a.isTriggered);
      setNotifications(triggered);
    } catch {
      // Ignorer si échec temporaire
    } finally {
      setNotifLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchTriggeredAlerts();
      const interval = setInterval(() => {
        void fetchTriggeredAlerts();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, fetchTriggeredAlerts]);

  const computedVariant = useMemo<HeaderVariant>(() => {
    if (variant) return variant;
    return isAuthenticated ? 'authenticated' : 'guest';
  }, [variant, isAuthenticated]);

  const currentNavId = useMemo(() => {
    if (activeNavId) return activeNavId;
    if (pathname === '/options') return 'options';
    if (pathname === '/news') return 'news';
    if (pathname === '/screener') return 'screener';
    if (pathname?.startsWith('/trade')) return 'trade';
    if (pathname?.startsWith('/user')) return 'user';
    if (pathname === '/') return 'markets';
    return null;
  }, [activeNavId, pathname]);

  const handleLogoPress = () => {
    router.push('/');
  };

  const handleNavPress = (item: NavItem) => {
    if (onSelectNav) {
      onSelectNav(item.id);
    } else {
      router.push(item.href);
    }
  };

  const handleSearchSubmit = () => {
    const term = (searchValue ?? internalSearch).trim();
    if (!term) return;
    router.push(`/trade?symbol=${encodeURIComponent(term.toUpperCase())}`);
  };

  const handleOpenAlert = () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsAlertModalOpen(true);
    onAlertPress?.();
  };

  const handleToggleNotifications = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
      return;
    }
    setIsNotifDropdownOpen((prev) => !prev);
    if (!isNotifDropdownOpen) {
      void fetchTriggeredAlerts();
    }
  };

  const handleSelectTimeRange = (range: TimeRange) => {
    onSelectRange?.(range);
    setIsRangeMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (onProfilePress) {
      onProfilePress();
    } else if (isAuthenticated) {
      router.push('/user');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const networkStatusColor = useMemo(() => {
    switch (streamStatus) {
      case 'CONNECTED':
        return '#22C55E';
      case 'CONNECTING':
        return '#F59E0B';
      case 'DISCONNECTED':
        return '#EF4444';
      default:
        return undefined;
    }
  }, [streamStatus]);

  // Filtre SVG adaptatif selon le thème actif
  const iconFilter = useMemo(() => {
    return isDark ? 'brightness(0) invert(1)' : 'brightness(0)';
  }, [isDark]);

  // Filtre logo (inversion en mode sombre, conserve les couleurs d'origine en mode clair)
  const logoFilter = useMemo(() => {
    return isDark ? 'brightness(0) invert(1)' : 'none';
  }, [isDark]);

  return (
    <>
      {/* Bandeau d'alerte réseau */}
      {streamStatus && streamStatus !== 'CONNECTED' && (
        <View style={styles.reconnectBanner}>
          <View style={[styles.networkDot, { backgroundColor: networkStatusColor }]} />
          <Text style={styles.reconnectText}>
            {streamStatus === 'CONNECTING'
              ? 'Reconnexion au flux de marché en cours...'
              : 'Flux temps réel déconnecté. Tentative de rétablissement...'}
          </Text>
        </View>
      )}

      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors['colors_bg_secondary'],
            borderBottomColor: colors['colors_divider_text'],
          },
          style,
        ]}
      >
        {/* 1. SECTION GAUCHE */}
        <View style={styles.leftGroup}>
          <Pressable onPress={handleLogoPress} style={styles.logoRow}>
            <Image
              src={LogoSvg}
              width={32}
              height={32}
              alt="NewTrading"
              priority
              style={{ filter: logoFilter }}
            />
            {computedVariant !== 'chart' && (
              <Text
                style={[
                  styles.brandTitle,
                  { color: colors['colors_text_primary'] },
                ]}
              >
                NewTrading
              </Text>
            )}
            {streamStatus && (
              <View
                style={[
                  styles.networkStatusIndicator,
                  { backgroundColor: networkStatusColor },
                ]}
              />
            )}
          </Pressable>

          {computedVariant !== 'chart' && (
            <View style={styles.navRow}>
              {DEFAULT_NAV_ITEMS.map((item) => {
                const isActive = item.id === currentNavId;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleNavPress(item)}
                    style={[
                      styles.navItem,
                      isActive && [
                        styles.activeNavItem,
                        { backgroundColor: colors['colors_bg_primary'] },
                      ],
                    ]}
                  >
                    <Text
                      style={[
                        styles.navText,
                        isActive ? styles.navTextActive : styles.navTextInactive,
                        { color: colors['colors_text_primary'] },
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
          {computedVariant === 'chart' && (
            <View style={styles.chartToolsGroup}>
              <View style={styles.chartSearchWrapper}>
                <SearchBar
                  size="sm"
                  placeholder="Ticker..."
                  showClearIcon={false}
                  value={searchValue ?? internalSearch}
                  onChangeText={(val) => {
                    setInternalSearch(val);
                    onSearchChange?.(val);
                  }}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                />
              </View>

              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors['colors_divider_text'] },
                ]}
              />

              <View style={styles.rangeSelectorWrapper}>
                <Pressable
                  onPress={() => setIsRangeMenuOpen((prev) => !prev)}
                  style={[
                    styles.rangeButton,
                    { backgroundColor: colors['colors_bg_primary'] },
                  ]}
                >
                  <Text style={[styles.chipText, { color: colors['colors_text_primary'] }]}>
                    {selectedRange}
                  </Text>
                </Pressable>

                {isRangeMenuOpen && (
                  <View
                    style={[
                      styles.rangeDropdown,
                      {
                        backgroundColor: colors['colors_bg_secondary'],
                        borderColor: colors['colors_divider_text'],
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
                              backgroundColor: colors['colors_bg_primary'],
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.rangeDropdownText,
                              {
                                color: isSelected
                                  ? colors['colors_badge_primary-action-bg']
                                  : colors['colors_text_primary'],
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
                  { backgroundColor: colors['colors_divider_text'] },
                ]}
              />

              <Pressable
                onPress={onToggleChartType}
                style={[
                  styles.iconButton,
                  { backgroundColor: colors['colors_bg_primary'] },
                ]}
              >
                <Image
                  src={chartType === 'candlestick' ? ChatArrowGrowIcon : StatsIcon}
                  width={16}
                  height={16}
                  alt={chartType === 'candlestick' ? 'Vue Ligne' : 'Vue Bougies'}
                  style={{ filter: iconFilter }}
                />
              </Pressable>

              <View
                style={[
                  styles.separator,
                  { backgroundColor: colors['colors_divider_text'] },
                ]}
              />

              <Pressable
                onPress={handleOpenAlert}
                style={[
                  styles.alarmChip,
                  { backgroundColor: colors['colors_bg_primary'] },
                ]}
              >
                <Image
                  src={BellIcon}
                  width={14}
                  height={14}
                  alt=""
                  style={{ filter: iconFilter }}
                />
                <Text
                  style={[
                    styles.chipText,
                    { color: colors['colors_text_primary'] },
                  ]}
                >
                  Alarme
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* 2. SECTION CENTRALE */}
        {computedVariant !== 'chart' && (
          <View style={styles.centerSearchWrapper}>
            <SearchBar
              size="md"
              placeholder="Rechercher..."
              value={searchValue ?? internalSearch}
              onChangeText={(val) => {
                setInternalSearch(val);
                onSearchChange?.(val);
              }}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
          </View>
        )}

        {/* 3. SECTION DROITE */}
        <View style={styles.rightGroup}>
          {isLoading ? (
            <View style={styles.authLoadingPlaceholder} />
          ) : computedVariant === 'guest' ? (
            <View style={styles.guestActionRow}>
              {/* Sélecteur de thème pour les visiteurs */}
              <Pressable
                onPress={toggleTheme}
                accessibilityLabel="Changer de thème"
                style={[
                  styles.actionIconBtn,
                  { backgroundColor: colors['colors_bg_primary'], borderRadius: 8 },
                ]}
              >
                <Image
                  src={isDark ? BrightnessIcon : MoonIcon}
                  width={18}
                  height={18}
                  alt={isDark ? 'Mode clair' : 'Mode sombre'}
                  style={{ filter: iconFilter }}
                />
              </Pressable>

              <Button
                label="Connexion"
                variant="outline"
                shape="rounded"
                size="sm"
                onPress={onLoginPress ?? (() => setIsLoginModalOpen(true))}
                style={styles.headerActionButton}
              />
              <Button
                label="Ouvrir un compte"
                variant="primary"
                shape="rounded"
                size="sm"
                onPress={onRegisterPress ?? (() => setIsSignUpModalOpen(true))}
                style={styles.headerActionButton}
              />
            </View>
          ) : (
            <View style={styles.authActionRow}>
              <MarketCashInfo label="LIQUIDITÉS" amount={cashAmount} />

              <View style={styles.iconActions}>
                {/* Sélecteur de thème connecté */}
                <Pressable
                  onPress={toggleTheme}
                  accessibilityLabel="Changer de thème"
                  style={[
                    styles.actionIconBtn,
                    { backgroundColor: colors['colors_bg_primary'], borderRadius: 8 },
                  ]}
                >
                  <Image
                    src={isDark ? BrightnessIcon : MoonIcon}
                    width={18}
                    height={18}
                    alt={isDark ? 'Mode clair' : 'Mode sombre'}
                    style={{ filter: iconFilter }}
                  />
                </Pressable>

                {/* Notifications */}
                <View style={styles.notifWrapper}>
                  <Pressable
                    onPress={handleToggleNotifications}
                    style={styles.actionIconBtn}
                  >
                    <Image
                      src={BellIcon}
                      width={20}
                      height={20}
                      alt="Alertes"
                      style={{ filter: iconFilter }}
                    />
                    {notifications.length > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {notifications.length > 9 ? '9+' : notifications.length}
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  {isNotifDropdownOpen && (
                    <View
                      style={[
                        styles.notifDropdown,
                        {
                          backgroundColor: colors['colors_bg_secondary'],
                          borderColor: colors['colors_divider_text'],
                        },
                      ]}
                    >
                      <View style={[styles.notifHeader, { borderBottomColor: colors['colors_divider_text'] }]}>
                        <Text
                          style={[
                            styles.notifHeaderTitle,
                            { color: colors['colors_text_primary'] },
                          ]}
                        >
                          Notifications ({notifications.length})
                        </Text>
                        <Pressable onPress={() => handleOpenAlert()}>
                          <Text
                            style={[
                              styles.notifActionLink,
                              { color: colors['colors_badge_primary-action-bg'] },
                            ]}
                          >
                            + Créer
                          </Text>
                        </Pressable>
                      </View>

                      <ScrollView style={styles.notifList} showsVerticalScrollIndicator={false}>
                        {notifLoading ? (
                          <Text style={[styles.notifEmptyText, { color: colors['colors_text_secondary'] }]}>
                            Chargement...
                          </Text>
                        ) : notifications.length === 0 ? (
                          <Text style={[styles.notifEmptyText, { color: colors['colors_text_secondary'] }]}>
                            Aucune alerte reçue
                          </Text>
                        ) : (
                          notifications.map((notif) => (
                            <Pressable
                              key={notif.id}
                              style={[
                                styles.notifItem,
                                { borderBottomColor: colors['colors_divider_text'] },
                              ]}
                              onPress={() => {
                                setIsNotifDropdownOpen(false);
                                router.push(`/trade?symbol=${encodeURIComponent(notif.assetCode)}`);
                              }}
                            >
                              <View style={styles.notifItemHeader}>
                                <Text
                                  style={[
                                    styles.notifAsset,
                                    { color: colors['colors_text_primary'] },
                                  ]}
                                >
                                  {notif.assetCode}
                                </Text>
                                <Text
                                  style={[
                                    styles.notifTagTriggered,
                                    {
                                      color: colors['colors_badge_down-text'],
                                      backgroundColor: colors['colors_badge_down-bg'],
                                    },
                                  ]}
                                >
                                  Déclenchée
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.notifDetails,
                                  { color: colors['colors_text_secondary'] },
                                ]}
                              >
                                Seuil {notif.triggerCondition === 'ABOVE' ? '≥' : '≤'}{' '}
                                {notif.targetPrice.toLocaleString('fr-FR', {
                                  minimumFractionDigits: 2,
                                })} $
                              </Text>
                              <Text
                                style={[
                                  styles.notifDate,
                                  { color: colors['colors_text_secondary'] },
                                ]}
                              >
                                {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            </Pressable>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Paramètres */}
                <Pressable onPress={onSettingsPress} style={styles.actionIconBtn}>
                  <Image
                    src={GearIcon}
                    width={20}
                    height={20}
                    alt="Paramètres"
                    style={{ filter: iconFilter }}
                  />
                </Pressable>

                {/* Profil */}
                <Pressable
                  onPress={handleProfileClick}
                  style={[
                    styles.actionIconBtn,
                    pathname?.startsWith('/user') && [
                      styles.activeProfileBtn,
                      { backgroundColor: colors['colors_bg_primary'] },
                    ],
                  ]}
                >
                  <Image
                    src={ProfileIcon}
                    width={20}
                    height={20}
                    alt="Profil"
                    style={{ filter: iconFilter }}
                  />
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
        onAlertCreated={fetchTriggeredAlerts}
      />

      <LoginModal
        visible={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
        onNavigateToSignUp={() => {
          setIsLoginModalOpen(false);
          setIsSignUpModalOpen(true);
        }}
      />

      <SignUpModal
        visible={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSuccess={() => setIsSignUpModalOpen(false)}
        onNavigateToLogin={() => {
          setIsSignUpModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  reconnectBanner: {
    height: 32,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 70,
    gap: 8,
  },
  reconnectText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  networkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  headerContainer: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
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
    gap: 8,
    cursor: 'pointer',
  },
  brandTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeNavItem: {},
  navText: {
    fontSize: 14,
    lineHeight: 20,
  },
  navTextActive: { fontWeight: '700' },
  navTextInactive: { fontWeight: '500' },
  chartToolsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartSearchWrapper: {
    width: 140,
    overflow: 'hidden',
  },
  separator: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
  },
  rangeSelectorWrapper: {
    position: 'relative',
    zIndex: 70,
  },
  rangeButton: {
    minWidth: 38,
    height: 30,
    paddingHorizontal: 6,
    borderRadius: 8,
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
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  iconButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActionButton: {
    minHeight: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  centerSearchWrapper: {
    width: 220,
    marginLeft: 12,
    marginRight: 'auto',
    overflow: 'hidden',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  authLoadingPlaceholder: {
    height: 32,
    minWidth: 160,
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
  notifWrapper: {
    position: 'relative',
    zIndex: 90,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeProfileBtn: {
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  notifDropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 300,
    maxHeight: 380,
    borderRadius: 8,
    borderWidth: 1,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  notifHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  notifActionLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  notifList: {
    maxHeight: 300,
  },
  notifEmptyText: {
    padding: 16,
    fontSize: 12,
    textAlign: 'center',
  },
  notifItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  notifItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifAsset: {
    fontSize: 13,
    fontWeight: '700',
  },
  notifTagTriggered: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notifDetails: {
    fontSize: 12,
    marginBottom: 2,
  },
  notifDate: {
    fontSize: 10,
  },
});

export default AppHeader;
