'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/stores/useAuthStore';
import { tradeApi, PnLData, TransactionResponse, EquityPoint } from '@/lib/api/tradeApi';
import { alertApi, AlertResponse } from '@/lib/api/alertApi';

import { PortfolioEquityChart } from '@/components/portfolio/components/PortfolioEquityChart';
import { AssetAllocationCard } from '@/components/portfolio/components/AssetAllocationCard';
import { PortfolioTable } from '@/components/portfolio/components/tables/PortfolioTable';
import { PortfolioPositionRow } from '@/components/portfolio/components/tables/PortfolioPositionRow';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme/ThemeContext';

import ProfileIcon from '@/assets/icons/profile.svg';
import BankIcon from '@/assets/icons/bank.svg';
import StatsIcon from '@/assets/icons/stats.svg';
import ChartGrowIcon from '@/assets/icons/chat-arrow-grow.svg';
import ClockIcon from '@/assets/icons/fi-rr-clock.svg';
import LockIcon from '@/assets/icons/fi-rr-lock.svg';
import KeyIcon from '@/assets/icons/fi-rr-key.svg';
import SlidersIcon from '@/assets/icons/fi-rr-settings-sliders.svg';

type TabKey =
  | 'overview'
  | 'positions'
  | 'history'
  | 'security'
  | 'api_keys'
  | 'preferences';

export const UserScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabKey>('positions');
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [history, setHistory] = useState<TransactionResponse[]>([]);
  const [, setAlerts] = useState<AlertResponse[]>([]);
  const [equityData, setEquityData] = useState<EquityPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true);
        const [pnlRes, historyRes, alertsRes, equityRes] = await Promise.allSettled([
          tradeApi.getPnL(),
          tradeApi.getOrderHistory(0, 50),
          alertApi.getAlerts(),
          tradeApi.getEquityHistory(),
        ]);

        if (pnlRes.status === 'fulfilled') setPnlData(pnlRes.value);
        if (historyRes.status === 'fulfilled') setHistory(historyRes.value.content);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);
        if (equityRes.status === 'fulfilled') setEquityData(equityRes.value);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  const totalValue = pnlData?.totalPortfolioValue ?? 100000;
  const totalPnL = pnlData?.totalUnrealizedPnL ?? 0;
  const totalPnLPercent = pnlData?.totalPnLPercentage ?? 0;
  const positions = pnlData?.positions ?? [];
  const allocations = pnlData?.allocations ?? [];

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'overview', label: 'Vue générale', icon: StatsIcon },
    { key: 'positions', label: 'Positions ouvertes', icon: ChartGrowIcon },
    { key: 'history', label: 'Historique des transactions', icon: ClockIcon },
    { key: 'security', label: 'Sécurité & 2FA', icon: LockIcon },
    { key: 'api_keys', label: 'Clé API & Webhooks', icon: KeyIcon },
    { key: 'preferences', label: 'Préférences & Notifications', icon: SlidersIcon },
  ];

  const iconFilter = useMemo(
    () => (isDark ? 'brightness(0) invert(1)' : 'brightness(0)'),
    [isDark]
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors['colors_bg_primary'] }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.maxWidthWrapper}>
        {/* 1. Header Profil Utilisateur */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: colors['colors_bg_secondary'],
              borderColor: colors['colors_divider_text'],
              padding: primitives['spacing & layout_padding & margin_space-16'] ?? 24,
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            },
          ]}
        >
          <View style={styles.profileLeft}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors['colors_bg_primary'] },
              ]}
            >
              <Image
                src={ProfileIcon}
                width={58}
                height={58}
                alt="Avatar"
              />
            </View>
            <View style={styles.profileDetails}>
              <Text style={[styles.usernameText, { color: colors['colors_text_primary'] }]}>
                {user?.email?.split('@')[0] || 'Trader'}
              </Text>
              <Text style={[styles.profileSubText, { color: colors['colors_text_secondary'] }]}>
                Compte : #{user?.id ? user.id.slice(0, 8).toUpperCase() : 'PORTFOLIO'} &bull; Devise : USD ($)
              </Text>
              <Text
                style={[
                  styles.memberSinceText,
                  {
                    color: colors['colors_text_secondary'],
                    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                  },
                ]}
              >
                Liquidités disponibles : {pnlData ? pnlData.currentBalance.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) : '0,00'} $
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Bloc Équité & Allocation */}
        <View
          style={[
            styles.dashboardGrid,
            {
              backgroundColor: colors['colors_bg_secondary'],
              padding: primitives['spacing & layout_padding & margin_space-16'] ?? 24,
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            },
          ]}
        >
          <PortfolioEquityChart
            totalValue={totalValue}
            totalPnL={totalPnL}
            totalPnLPercent={totalPnLPercent}
            equityData={equityData}
            height={380}
          />

          <View
            style={[
              styles.allocationCardWrapper,
              {
                backgroundColor: colors['colors_bg_secondary'],
                borderColor: colors['colors_divider_text'],
                borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                borderWidth: primitives['border width_border-thin'] ?? 1,
                padding: primitives['spacing & layout_padding & margin_space-8'] ?? 16,
              },
            ]}
          >
            <Text style={[styles.allocationTitle, { color: colors['colors_text_primary'] }]}>
              Allocation des Actifs
            </Text>

            <View style={styles.allocationCardsList}>
              {allocations.length === 0 ? (
                <Text style={{ color: colors['colors_text_secondary'], fontSize: 13, paddingVertical: 12 }}>
                  100 % Liquidités (Aucune position ouverte)
                </Text>
              ) : (
                allocations.map((alloc) => (
                  <AssetAllocationCard
                    key={alloc.category}
                    variant={
                      alloc.category.toLowerCase() === 'crypto'
                        ? 'crypto'
                        : alloc.category.toLowerCase() === 'etf'
                        ? 'etf'
                        : 'action'
                    }
                    label={alloc.category}
                    percentage={alloc.percentage}
                    amount={alloc.amount}
                  />
                ))
              )}
            </View>

            <Button
              label="Voir les ordres"
              variant="outline"
              shape="rounded"
              size="md"
              onPress={() => setActiveTab('history')}
              labelStyle={{
                color: colors['colors_text_primary'],
                fontWeight: '600',
              }}
              style={[
                styles.detailButton,
                {
                  borderColor: colors['colors_button_outline-border'],
                  backgroundColor: colors['colors_button_ghost'],
                },
              ]}
            />
          </View>
        </View>

        {/* 3. Navigation par Onglets */}
        <View
          style={[
            styles.tabsContainer,
            {
              backgroundColor: colors['colors_bg_secondary'],
              paddingHorizontal: primitives['spacing & layout_padding & margin_space-16'] ?? 16,
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            },
          ]}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.tabItem,
                  isActive && {
                    borderBottomColor: colors['colors_text_primary'],
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Image
                  src={tab.icon}
                  width={20}
                  height={20}
                  alt={tab.label}
                  style={{
                    filter: iconFilter,
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors['colors_text_primary'] : colors['colors_text_secondary'],
                      fontWeight: isActive ? '700' : '500',
                      fontSize: primitives['typography_font size_font-size-16'] ?? 16,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 4. Tableaux des Positions & Historique */}
        <View
          style={[
            styles.tabContentSection,
            {
              backgroundColor: colors['colors_bg_secondary'],
              padding: primitives['spacing & layout_padding & margin_space-16'] ?? 24,
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors['colors_badge_primary-action-bg']}
              style={{ marginVertical: 48 }}
            />
          ) : activeTab === 'positions' || activeTab === 'overview' ? (
            <View>
              <Text
                style={[
                  styles.tableSectionTitle,
                  {
                    color: colors['colors_text_primary'],
                    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
                  },
                ]}
              >
                Positions Ouvertes ({positions.length})
              </Text>

              {positions.length === 0 ? (
                <View
                  style={[
                    styles.emptyContainer,
                    {
                      backgroundColor: colors['colors_bg_secondary'],
                      borderColor: colors['colors_divider_text'],
                      borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
                      borderWidth: primitives['border width_border-thin'] ?? 1,
                    },
                  ]}
                >
                  <Text style={{ color: colors['colors_text_secondary'] }}>
                    Aucune position ouverte actuellement. Passe un ordre sur la page Trade pour constituer ton portefeuille.
                  </Text>
                </View>
              ) : (
                <PortfolioTable>
                  {positions.map((pos) => (
                    <PortfolioPositionRow
                      key={pos.assetCode}
                      countryOrCategory={pos.category}
                      name={pos.assetCode}
                      icon={
                        <Image
                          src={BankIcon}
                          width={18}
                          height={18}
                          alt="Actif"
                          style={{ filter: iconFilter }}
                        />
                      }
                      averagePrice={pos.averagePrice}
                      currentPrice={pos.currentPrice}
                      valuation={pos.valuation}
                      quantity={pos.quantity}
                      quantityUnit="Unités"
                      unrealizedPnLAmount={pos.unrealizedPnL}
                      unrealizedPnLPercent={pos.unrealizedPnLPercentage}
                      onManagePress={() => router.push(`/trade?symbol=${pos.assetCode}`)}
                    />
                  ))}
                </PortfolioTable>
              )}
            </View>
          ) : activeTab === 'history' ? (
            <View>
              <Text
                style={[
                  styles.tableSectionTitle,
                  {
                    color: colors['colors_text_primary'],
                    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
                  },
                ]}
              >
                Historique des Transactions ({history.length})
              </Text>

              {history.length === 0 ? (
                <View
                  style={[
                    styles.emptyContainer,
                    {
                      backgroundColor: colors['colors_bg_secondary'],
                      borderColor: colors['colors_divider_text'],
                      borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
                      borderWidth: primitives['border width_border-thin'] ?? 1,
                    },
                  ]}
                >
                  <Text style={{ color: colors['colors_text_secondary'] }}>
                    Aucune transaction enregistrée.
                  </Text>
                </View>
              ) : (
                <PortfolioTable>
                  {history.map((tx) => (
                    <PortfolioPositionRow
                      key={tx.id}
                      countryOrCategory={tx.orderDirection === 'BUY' ? 'ACHAT' : 'VENTE'}
                      name={tx.assetCode}
                      averagePrice={tx.executionPrice}
                      currentPrice={tx.executionPrice}
                      valuation={tx.totalAmount || tx.executionPrice * tx.quantity}
                      quantity={tx.quantity}
                      quantityUnit="Unités"
                      unrealizedPnLAmount={0}
                      unrealizedPnLPercent={0}
                      onManagePress={() => router.push(`/trade?symbol=${tx.assetCode}`)}
                    />
                  ))}
                </PortfolioTable>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.emptyContainer,
                {
                  backgroundColor: colors['colors_bg_secondary'],
                  borderColor: colors['colors_divider_text'],
                  borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
                  borderWidth: primitives['border width_border-thin'] ?? 1,
                },
              ]}
            >
              <Text style={{ color: colors['colors_text_secondary'], fontSize: 14 }}>
                Module « {tabs.find((t) => t.key === activeTab)?.label} » disponible prochainement.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 4,
    alignItems: 'center',
    flexGrow: 1,
  },
  maxWidthWrapper: {
    width: '100%',
    flex: 1,
    gap: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    gap: 3,
  },
  usernameText: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileSubText: {
    fontWeight: '500',
  },
  memberSinceText: {
    fontWeight: '400',
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 460,
  },
  allocationCardWrapper: {
    flex: 1.1,
    justifyContent: 'space-between',
    gap: 14,
  },
  allocationTitle: {
    fontWeight: '700',
  },
  allocationCardsList: {
    gap: 10,
  },
  detailButton: {
    marginTop: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  tabLabel: {},
  tabContentSection: {
    gap: 16,
    flex: 1,
  },
  tableSectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserScreen;
