'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/lib/stores/useAuthStore';
import { tradeApi, PnLData, SimulatedTransactionResponse } from '@/lib/api/tradeApi';
import { alertApi, AlertResponse } from '@/lib/api/alertApi';

import { PortfolioPerformanceBadge } from '@/components/portfolio/components/PortfolioPerformanceBadge';
import { AssetAllocationCard } from '@/components/portfolio/components/AssetAllocationCard';
import { PortfolioTable } from '@/components/portfolio/components/tables/PortfolioTable';
import { PortfolioPositionRow } from '@/components/portfolio/components/tables/PortfolioPositionRow';
import { InteractiveMarketChart } from '@/components/features/market/components/InteractiveMarketChart';
import { Button } from '@/components/ui/Button';

// Assets visuels
import ProfileIcon from '@/assets/icons/profile.svg';
import EditIcon from '@/assets/icons/fi-rr-pencil.svg';
import BankIcon from '@/assets/icons/bank.svg';
import StatsIcon from '@/assets/icons/stats.svg';
import ChartGrowIcon from '@/assets/icons/chat-arrow-grow.svg';
import ClockIcon from '@/assets/icons/fi-rr-clock.svg';
import LockIcon from '@/assets/icons/fi-rr-lock.svg';
import KeyIcon from '@/assets/icons/fi-rr-key.svg';
import SlidersIcon from '@/assets/icons/fi-rr-settings-sliders.svg';

import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

type TabKey =
  | 'overview'
  | 'positions'
  | 'history'
  | 'security'
  | 'api_keys'
  | 'preferences';

export const UserScreen: React.FC = () => {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? darkColors : lightColors;

  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabKey>('positions');
  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [history, setHistory] = useState<SimulatedTransactionResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        setIsLoading(true);
        const [pnlRes, historyRes, alertsRes] = await Promise.allSettled([
          tradeApi.getPnL(),
          tradeApi.getOrderHistory(0, 20),
          alertApi.getAlerts(),
        ]);

        if (pnlRes.status === 'fulfilled') setPnlData(pnlRes.value);
        if (historyRes.status === 'fulfilled') setHistory(historyRes.value.content);
        if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, []);

  const totalValue = pnlData?.totalPortfolioValue ?? 123456.0;
  const totalPnL = pnlData?.totalUnrealizedPnL ?? 18420.5;
  const totalPnLPercent = pnlData?.totalPnLPercentage ?? 14.81;

  const defaultPositions = [
    {
      countryOrCategory: 'ALLEMAGNE',
      name: 'DAX 40',
      averagePrice: 743.43,
      currentPrice: 843.5,
      valuation: 32980.0,
      quantity: 40.0,
      quantityUnit: 'Actions',
      unrealizedPnLAmount: 3123.0,
      unrealizedPnLPercent: 0.43,
      ticker: 'DAX40',
    },
    {
      countryOrCategory: 'ALLEMAGNE',
      name: 'DAX 40',
      averagePrice: 743.43,
      currentPrice: 843.5,
      valuation: 32980.0,
      quantity: 40.0,
      quantityUnit: 'Actions',
      unrealizedPnLAmount: 3123.0,
      unrealizedPnLPercent: 0.43,
      ticker: 'DAX40',
    },
    {
      countryOrCategory: 'ALLEMAGNE',
      name: 'DAX 40',
      averagePrice: 743.43,
      currentPrice: 843.5,
      valuation: 32980.0,
      quantity: 40.0,
      quantityUnit: 'Actions',
      unrealizedPnLAmount: 3123.0,
      unrealizedPnLPercent: 0.43,
      ticker: 'DAX40',
    },
    {
      countryOrCategory: 'ALLEMAGNE',
      name: 'DAX 40',
      averagePrice: 743.43,
      currentPrice: 843.5,
      valuation: 32980.0,
      quantity: 40.0,
      quantityUnit: 'Actions',
      unrealizedPnLAmount: 3123.0,
      unrealizedPnLPercent: 0.43,
      ticker: 'DAX40',
    },
    {
      countryOrCategory: 'ALLEMAGNE',
      name: 'DAX 40',
      averagePrice: 743.43,
      currentPrice: 843.5,
      valuation: 32980.0,
      quantity: 40.0,
      quantityUnit: 'Actions',
      unrealizedPnLAmount: 3123.0,
      unrealizedPnLPercent: 0.43,
      ticker: 'DAX40',
    },
    {
      countryOrCategory: 'ALLEMAGNE',
      name: 'DAX 40',
      averagePrice: 743.43,
      currentPrice: 843.5,
      valuation: 32980.0,
      quantity: 40.0,
      quantityUnit: 'Actions',
      unrealizedPnLAmount: 3123.0,
      unrealizedPnLPercent: 0.43,
      ticker: 'DAX40',
    },
  ];

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'overview', label: 'Vue générale', icon: StatsIcon },
    { key: 'positions', label: 'Positions ouvertes', icon: ChartGrowIcon },
    { key: 'history', label: 'Historique des transactions', icon: ClockIcon },
    { key: 'security', label: 'Sécurité & 2FA', icon: LockIcon },
    { key: 'api_keys', label: 'Clé API & Webhooks', icon: KeyIcon },
    { key: 'preferences', label: 'Préférences & Notifications', icon: SlidersIcon },
  ];

  const formattedTotalValue = totalValue.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme['colors_bg_primary'] ?? '#F8FAFC' },
      ]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.maxWidthWrapper}>
        {/* 1. Header Profil Utilisateur */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
              borderColor: theme['colors_button_outline-border'] ?? '#E2E8F0',
            },
          ]}
        >
          <View style={styles.profileLeft}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: theme['colors_bg_primary'] ?? '#F1F5F9' },
              ]}
            >
              <Image
                src={ProfileIcon}
                width={36}
                height={36}
                alt="Avatar"
              />
            </View>
            <View style={styles.profileDetails}>
              <Text
                style={[
                  styles.usernameText,
                  { color: theme['colors_text_primary'] ?? '#0F172A' },
                ]}
              >
                {user?.email?.split('@')[0] || 'Username'}
              </Text>
              <Text
                style={[
                  styles.profileSubText,
                  { color: theme['colors_text_secondary'] ?? '#64748B' },
                ]}
              >
                Compte : #{user?.id ? user.id.slice(0, 8).toUpperCase() : 'NT-000001'} &bull; Devise de référence : USD ($)
              </Text>
              <Text
                style={[
                  styles.memberSinceText,
                  { color: theme['colors_text_secondary'] ?? '#64748B' },
                ]}
              >
                Membre depuis : {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Janvier 2027'}
              </Text>
            </View>
          </View>

          <Button
            label="Modifier le profil"
            variant="outline"
            size="sm"
            shape="rounded"
            onPress={() => {}}
          />
        </View>

        {/* 2. Bloc Équité & Allocation */}
        <View style={styles.dashboardGrid}>
          {/* Bloc Gauche : Performance & Graphique */}
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
                borderColor: theme['colors_button_outline-border'] ?? '#E2E8F0',
              },
            ]}
          >
            <View style={styles.equityHeader}>
              <Text
                style={[
                  styles.equityLabel,
                  { color: theme['colors_text_secondary'] ?? '#64748B' },
                ]}
              >
                VALEUR TOTALE DU PORTEFEUILLE
              </Text>
              <View style={styles.equityValueRow}>
                <Text
                  style={[
                    styles.equityValueText,
                    { color: theme['colors_text_primary'] ?? '#0F172A' },
                  ]}
                >
                  {formattedTotalValue} $
                </Text>
                <PortfolioPerformanceBadge
                  amount={totalPnL}
                  percentage={totalPnLPercent}
                  period="YTD"
                />
              </View>
            </View>

            <View style={styles.chartContainer}>
              <InteractiveMarketChart symbol="PORTFOLIO" changePercent={totalPnLPercent} />
            </View>
          </View>

          {/* Bloc Droit : Allocation des Actifs */}
          <View
            style={[
              styles.allocationCardWrapper,
              {
                backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
                borderColor: theme['colors_button_outline-border'] ?? '#E2E8F0',
              },
            ]}
          >
            <Text
              style={[
                styles.allocationTitle,
                { color: theme['colors_text_primary'] ?? '#0F172A' },
              ]}
            >
              Allocation des Actifs
            </Text>

            <View style={styles.allocationCardsList}>
              <AssetAllocationCard
                variant="crypto"
                label="Crypto"
                percentage={60.0}
                amount={85710.0}
              />
              <AssetAllocationCard
                variant="action"
                label="Actions"
                percentage={25.0}
                amount={35712.5}
              />
              <AssetAllocationCard
                variant="etf"
                label="ETF"
                percentage={15.0}
                amount={21427.5}
              />
            </View>

            <Button
              label="Détail complet de l'exposition"
              variant="secondary"
              shape="rounded"
              size="md"
              onPress={() => {}}
              style={styles.detailButton}
            />
          </View>
        </View>

        {/* 3. Navigation par Onglets */}
        <View
          style={[
            styles.tabsContainer,
            { borderBottomColor: theme['colors_button_outline-border'] ?? '#E2E8F0' },
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
                    borderBottomColor: theme['colors_text_primary'] ?? '#0F172A',
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Image
                  src={tab.icon}
                  width={16}
                  height={16}
                  alt={tab.label}
                  style={{
                    filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)',
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive
                        ? theme['colors_text_primary'] ?? '#0F172A'
                        : theme['colors_text_secondary'] ?? '#64748B',
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 4. Tableaux & Contenu dynamique */}
        <View style={styles.tabContentSection}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 48 }} />
          ) : activeTab === 'positions' || activeTab === 'overview' ? (
            <View>
              <Text
                style={[
                  styles.tableSectionTitle,
                  { color: theme['colors_text_primary'] ?? '#0F172A' },
                ]}
              >
                Positions Ouvertes
              </Text>

              <PortfolioTable>
                {defaultPositions.map((item, index) => (
                  <PortfolioPositionRow
                    key={`${item.ticker}-${index}`}
                    countryOrCategory={item.countryOrCategory}
                    name={item.name}
                    icon={
                      <Image
                        src={BankIcon}
                        width={18}
                        height={18}
                        alt="Actif"
                        style={{
                          filter: isDark ? 'brightness(0) invert(1)' : 'brightness(0)',
                        }}
                      />
                    }
                    averagePrice={item.averagePrice}
                    currentPrice={item.currentPrice}
                    valuation={item.valuation}
                    quantity={item.quantity}
                    quantityUnit={item.quantityUnit}
                    unrealizedPnLAmount={item.unrealizedPnLAmount}
                    unrealizedPnLPercent={item.unrealizedPnLPercent}
                    onManagePress={() => router.push(`/trade?symbol=${item.ticker}`)}
                  />
                ))}
              </PortfolioTable>

              <Text
                style={[
                  styles.tableFooterNote,
                  { color: theme['colors_text_secondary'] ?? '#64748B' },
                ]}
              >
                Affichage de {defaultPositions.length} positions sur {defaultPositions.length} ouvertes
              </Text>
            </View>
          ) : activeTab === 'history' ? (
            <View>
              <Text
                style={[
                  styles.tableSectionTitle,
                  { color: theme['colors_text_primary'] ?? '#0F172A' },
                ]}
              >
                Historique des Transactions
              </Text>

              {history.length === 0 ? (
                <View
                  style={[
                    styles.emptyContainer,
                    {
                      backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
                      borderColor: theme['colors_button_outline-border'] ?? '#E2E8F0',
                    },
                  ]}
                >
                  <Text style={{ color: theme['colors_text_secondary'] ?? '#64748B' }}>
                    Aucune transaction enregistrée dans le journal.
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
                      valuation={tx.executionPrice * tx.quantity}
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
                  backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
                  borderColor: theme['colors_button_outline-border'] ?? '#E2E8F0',
                },
              ]}
            >
              <Text style={{ color: theme['colors_text_secondary'] ?? '#64748B', fontSize: 14 }}>
                Module « {tabs.find((t) => t.key === activeTab)?.label} » planifié pour la mise à jour V1.1.
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
    backgroundColor: lightColors['colors_bg_primary'] ?? '#f8fafc',
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
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
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
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    fontWeight: '400',
  },
  dashboardGrid: {
    flexDirection: 'row',
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    gap: 16,
    minHeight: 460,
  },
  chartCard: {
    flex: 2.6,
    justifyContent: 'space-between',
  },
  equityHeader: {
    marginBottom: 8,
  },
  equityLabel: {
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  equityValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  equityValueText: {
    fontSize: primitives['typography_font size_font-size-32'] ?? 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
  chartContainer: {
    flex: 1,
    minHeight: 320,
  },
  allocationCardWrapper: {
    flex: 1.1,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    padding: primitives['spacing & layout_padding & margin_space-8'] ?? 32,
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
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    paddingHorizontal: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 4,
    cursor: 'pointer',
  },
  tabLabel: {
    fontSize: primitives['typography_font size_font-size-14'] ?? 14,
  },
  tabContentSection: {
    gap: 16,
    flex: 1,
    backgroundColor: lightColors['colors_bg_secondary'] ?? '#ffffff',
    padding: primitives['spacing & layout_padding & margin_space-16'] ?? 64,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
  },
  tableSectionTitle: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  tableFooterNote: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    marginTop: 10,
    paddingLeft: 4,
  },
  emptyContainer: {
    padding: 48,
    borderRadius: primitives['spacing & layout_border radius_radius-lg'] ?? 16,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserScreen;
