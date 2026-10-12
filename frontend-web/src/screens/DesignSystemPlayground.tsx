'use client';

// src/screens/DesignSystemPlayground.tsx
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { NumericInput } from '@/components/ui/NumericInput';
import { SelectTrigger } from '@/components/ui/SelectTrigger';
import { Switch } from '@/components/ui/Switch';
import { SearchBar } from '@/components/ui/SearchBar';
import { Checkbox } from '@/components/ui/Checkbox';
import { Divider } from '@/components/ui/Divider';
import { PortfolioPerformanceBadge } from '@/components/portfolio/components/PortfolioPerformanceBadge';
import { PercentageBadge } from '@/components/ui/PercentageBadge';
import { FinancialValue } from '@/components/ui/FinancialValue';
import { MarketTickerItem } from '@/components/features/market/components/MarketTickerItem';
import { HeatmapTile } from '@/components/features/market/components/HeatmapTile';
import { MarketTickerInfo } from '@/components/features/market/components/MarketTickerInfo';
import { MarketIndexCard } from '@/components/features/market/components/MarketIndexCard';
import { MarketCashInfo } from '@/components/features/market/components/MarketCashInfo';
import { AssetAllocationCard } from '@/components/portfolio/components/AssetAllocationCard';
import { AppHeader } from '@/components/layout/AppHeader';
import { TopMarketTickerBar } from '@/components/features/market/components/TopMarketTickerBar';
import { AppFooter } from '@/components/layout/AppFooter';
import { PortfolioTable } from '@/components/portfolio/components/tables/PortfolioTable';
import { PortfolioPositionRow } from '@/components/portfolio/components/tables/PortfolioPositionRow';
import { WatchlistCompactRow } from '@/components/watchlist/components/tables/WatchlistCompactRow';
import { MarketOverviewTable } from '@/components/features/market/components/tables/MarketOverviewTable';
import { MarketOverviewRow } from '@/components/features/market/components/tables/MarketOverviewRow';
import { useState } from 'react';
import { WatchlistHeader } from '@/components/watchlist/components/tables/WatchlistHeader';
import { WidgetHeader } from '@/components/ui/WidgetHeader';
import { primitives } from '@/theme/generated/primitives';
import { ChartToolbar, ChartTool } from '@/components/features/market/components/ChartToolbar';
import { TradingChart } from '@/components/features/market/components/TradingChart';
import { CreateAlertModal } from '@/components/features/market/components/CreateAlertModal';
import { OrderFormPanel } from '@/components/portfolio/components/OrderFormPanel';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignUpModal } from '@/components/auth/SignUpModal';
import type { SimulatedTransactionResponse } from '@/lib/api/tradeApi';

export const DesignSystemPlayground = () => {
  const [appNotification, setAppNotification] = useState(true);
  const [numericValue, setNumericValue] = useState('1234.50');
  const [switchValue, setSwitchValue] = useState<'left' | 'right'>('left');
  const [selectedPrice, setSelectedPrice] = useState('last');
  const [activeChartTool, setActiveChartTool] = useState<ChartTool>('crosshair');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const demoTransactions: SimulatedTransactionResponse[] = [
    {
      id: 'demo-1',
      assetCode: 'DAX 40',
      orderDirection: 'BUY',
      quantity: 2,
      executionPrice: 18321.12,
      executedAt: '2026-10-12T09:30:00.000Z',
    },
    {
      id: 'demo-2',
      assetCode: 'S&P 500',
      orderDirection: 'SELL',
      quantity: 1,
      executionPrice: 5349.10,
      executedAt: '2026-10-12T11:45:00.000Z',
    },
  ];
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>NEWTRADING · DESIGN SYSTEM</Text>
        <Text style={styles.heroTitle}>Bibliothèque de composants</Text>
        <Text style={styles.heroDescription}>
          Une vue d’ensemble des briques UI utilisées dans l’expérience de trading.
          Chaque carte présente les variantes et les états disponibles.
        </Text>
        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>Composants interactifs</Text>
          <View style={styles.metaDot} />
          <Text style={styles.heroMetaText}>États positifs et négatifs</Text>
          <View style={styles.metaDot} />
          <Text style={styles.heroMetaText}>Responsive</Text>
        </View>
      </View>

      <Text style={styles.title}>Actions & navigation</Text>
      <Text style={styles.sectionDescription}>
        Boutons, contrôles de saisie et composants de navigation.
      </Text>

      {/* Rangée 1 : Boutons Pilules */}
      <View style={styles.row}>
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="outline"
          leftIcon={'google'}
          shape="pill"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="primary"
          leftIcon={'email'}
          shape="pill"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="secondary"
          shape="pill"
          onPress={() => console.log('Connexion Google')}
        />
      </View>

      {/* Rangée 2 : Boutons Pilules */}
      <View style={styles.row}>
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="outline"
          leftIcon={'apple'}
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="secondary"
          leftIcon={'apple'}
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
      </View>

      {/* Rangée 3 : Boutons Pilules */}
      <View style={styles.row}>
        <Button
          size="md"
          label="Button"
          variant="inverse"
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          size="md"
          label="Button"
          variant="primary"
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          size="md"
          label="Button"
          variant="secondary"
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
      </View>

      {/* Rangée 4 : Boutons Trading avec prix */}
      <View style={styles.row}>
        <Button
          size="lg"
          label="Acheter"
          subtitle="123,23"
          variant="buy"
          shape="rounded"
          roundedSide="left"
          style={{ flex: 1 }}
        />
        <Button
          size="lg"
          label="Vendre"
          subtitle="123,23"
          variant="sell"
          shape="rounded"
          roundedSide="right"
          style={{ flex: 1 }}
        />
      </View>

      {/* Rangée 5 : Boutons Trading avec prix */}
      <View style={styles.row}>
        <Button
          size="lg"
          label="Acheter"
          subtitle="123,23"
          disabled={true}
          variant="buy"
          shape="rounded"
          roundedSide="left"
          style={{ flex: 1 }}
        />
        <Button
          size="lg"
          label="Vendre"
          subtitle="123,23"
          disabled={true}
          variant="sell"
          shape="rounded"
          roundedSide="right"
          style={{ flex: 1 }}
        />
      </View>

      {/* Rangée 6 : Boutons compacts / Chips */}
      <View style={styles.row}>
        <Button
          label="Tout"
          variant="secondary"
          shape="rounded"
          size="sm"
          onPress={() => console.log('Connexion Google')}
        />
      </View>
      <Text style={styles.title}>Champs & contrôles</Text>
      <Text style={styles.sectionDescription}>
        Variantes par défaut, en erreur, compactes et orientées trading.
      </Text>
      <View style={styles.row}>
        <InputField
          placeholder="Text field"
        />
        <InputField
          placeholder="Text field"
          error={true}
        />
        <InputField
          value="63,321.50"
          suffix="Limite"
          keyboardType="decimal-pad"
        />
        <NumericInput
          label="Montant"
          value={numericValue}
          onChangeText={setNumericValue}
          suffix="$"
          placeholder="0.00"
        />
      </View>

      <Text style={styles.title}>Sélection & recherche</Text>

      <View style={[styles.row, { zIndex: 20 }]}>
        <SelectTrigger
          label="Prix"
          variant="boxed"
          direction="down"
          value={selectedPrice}
          options={[
            { label: 'Dernier prix', value: 'last' },
            { label: 'Prix d’ouverture', value: 'open' },
            { label: 'Prix de clôture', value: 'close' },
          ]}
          onValueChange={setSelectedPrice}
        />
      </View>
      <View style={[styles.row, { zIndex: 10 }]}>
        <SelectTrigger
          label="Prix"
          variant="ghost"
          direction="right"
        />
      </View>
      <View style={styles.row}>
        <Switch
          value={switchValue}
          onChange={setSwitchValue}
        />
      </View>

      <View style={styles.row}>
        <SearchBar
          placeholder="Rechercher"
          size="md"
        />
      </View>
      <View style={styles.row}>
        <SearchBar
          placeholder="Rechercher"
          size="sm"
        />
      </View>

      <View style={styles.row}>
        <Checkbox
        checked={appNotification}
        onChange={setAppNotification}
        label="Notification par l’application"
      />
      </View>

      <Text style={styles.title}>États & indicateurs</Text>
      <Text style={styles.sectionDescription}>
        Feedback visuel, performances et valeurs financières.
      </Text>

      <View style={styles.row}>
        <Divider label="Ou" />
      </View>

      <View style={styles.row}>
        <PortfolioPerformanceBadge
          direction="up"
          label="+18 420,50 $ (+14,81% YTD)"
        />

        <PortfolioPerformanceBadge
          direction="down"
          label="-420,50 $ (-4,81% YTD)"
        />
      </View>

      <View style={styles.row}>
        <PercentageBadge value={0.43} />
        <PercentageBadge value={-0.43} />
      </View>

      {/* Ligne 1 : Montants en devise */}
      <View style={styles.row}>
        <FinancialValue value={3123} type="amount" currency="$" />
        <FinancialValue value={-123} type="amount" currency="$" />
      </View>

      {/* Ligne 2 : Pourcentages avec indicateurs triangulaires */}
      <View style={styles.row}>
        <FinancialValue value={0.43} type="percent" />
        <FinancialValue value={-0.43} type="percent" />
      </View>

      <Text style={styles.title}>Marchés & données</Text>
      <Text style={styles.sectionDescription}>
        Tickers, heatmaps et cartes de marché dans leurs principales variantes.
      </Text>

      <View style={styles.row}>
        <MarketTickerItem
          name="S&P 500"
          price={5349.10}
          changePercent={-0.43}
        />
      </View>
      {/* Rangée 1 : Disposition superposée (stacked) */}
      <View style={styles.row}>
        <HeatmapTile
          symbol="NVDA"
          sector="Tech"
          changePercent={3.23}
          price="893,40$"
          bottomLayout="stacked"
        />
        <HeatmapTile
          symbol="NVDA"
          sector="Tech"
          changePercent={3.23}
          direction="down"
          price="893,40$"
          bottomLayout="stacked"
        />
      </View>

      {/* Rangée 2 : Disposition écartée (split) */}
      <View style={styles.row}>
        <HeatmapTile
          symbol="NVDA"
          sector="Tech"
          changePercent={-3.23}
          direction="up"
          price="893,40$"
          bottomLayout="split"
        />
        <HeatmapTile
          symbol="NVDA"
          sector="Tech"
          changePercent={-3.23}
          price="893,40$"
          bottomLayout="split"
        />
      </View>

      <View style={styles.row}>
        {/* Variante 1 : Sous-titre en valeur (à gauche dans Figma) */}
        <MarketTickerInfo
          title="ALLEMAGNE"
          subtitle="DAX 40"
          emphasis="subtitle"
        />

        {/* Variante 2 : Titre en valeur (à droite dans Figma) */}
        <MarketTickerInfo
          title="ALLEMAGNE"
          subtitle="DAX 40"
          emphasis="title"
        />
        {/* Variante 3 : Titre en valeur (à droite dans Figma) */}
        <MarketTickerInfo
          size="sm"
          title="SPX"
        />
      </View>

      <View style={styles.row}>
        <MarketIndexCard
          countryOrCategory="ALLEMAGNE"
          indexName="DAX 40"
          points={18321.12}
          equivalentAmount="2 283,10$"
          changePercent={0.43}
          cardType="index"
        />
        <MarketIndexCard
          countryOrCategory="ALLEMAGNE"
          indexName="DAX 40"
          points={18321.12}
          equivalentAmount="2 283,10$"
          changePercent={0.43}
          cardType="stock"
        />
        <MarketIndexCard
          countryOrCategory="ALLEMAGNE"
          indexName="DAX 40"
          points={18321.12}
          equivalentAmount="2 283,10$"
          changePercent={0.43}
          cardType="crypto"
        />
      </View>
      <View style={styles.row}>
        <MarketCashInfo
          label="LIQUIDITÉS"
          amount={100000}
        />
      </View>

      <Text style={styles.title}>Portfolio & structure</Text>
      <Text style={styles.sectionDescription}>
        Allocation, en-têtes et navigation de l’espace portefeuille.
      </Text>
      <View style={styles.row}>
        {/* 1. Variante Crypto (Orange) */}
        <AssetAllocationCard
          variant="crypto"
          label="Crypto"
          amount="85 710,00$"
          percentage={60.0}
        />

        {/* 2. Variante Action (Bleu) */}
        <AssetAllocationCard
          variant="action"
          label="Action"
          amount="85 710,00$"
          percentage={60.0}
        />

        {/* 3. Variante ETF (Vert) */}
        <AssetAllocationCard
          variant="etf"
          label="ETF"
          amount="85 710,00$"
          percentage={60.0}
        />

        {/* Variante 1 : Visiteur non connecté */}
        <AppHeader
          variant="guest"
          activeNavId="markets"
          onLoginPress={() => console.log('Login')}
          onRegisterPress={() => console.log('Register')}
        />

        {/* Variante 2 : Utilisateur connecté (Vue Marchés / Dashboard) */}
        <AppHeader
          variant="authenticated"
          activeNavId="markets"
          cashAmount={100000}
        />

        {/* Variante 3 : Vue Graphique / Analyse Technique */}
        <AppHeader
          variant="chart"
          cashAmount={100000}
          onAlertPress={() => console.log('Ouvrir dialogue alerte')}
        />
      </View>

      <Text style={styles.title}>Trading & authentification</Text>
      <Text style={styles.sectionDescription}>
        Graphique, passage d’ordre, alertes et parcours de connexion.
      </Text>
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.chartSymbol}>DAX 40</Text>
            <Text style={styles.chartSubLabel}>Graphique chandelier · démonstration</Text>
          </View>
          <Button
            label="Créer une alerte"
            variant="secondary"
            size="sm"
            onPress={() => setIsAlertModalOpen(true)}
          />
        </View>
        <View style={styles.chartViewport}>
          <TradingChart
            symbol="DAX40"
            chartType="candlestick"
            themeMode="light"
            activeTool={activeChartTool}
            positions={[
              {
                id: 'demo-position',
                symbol: 'DAX40',
                direction: 'BUY',
                entryPrice: 18280,
                takeProfit: 18500,
                stopLoss: 18100,
              },
            ]}
          />
          <ChartToolbar
            activeTool={activeChartTool}
            onSelectTool={setActiveChartTool}
          />
        </View>
        <View style={styles.chartViewport}>
          <TradingChart
            symbol="DAX40"
            chartType="area"
            themeMode="light"
            activeTool={activeChartTool}
            positions={[
              {
                id: 'demo-position',
                symbol: 'DAX40',
                direction: 'BUY',
                entryPrice: 18280,
                takeProfit: 18500,
                stopLoss: 18100,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.row}>
        <OrderFormPanel
          assetCode="DAX40"
          currentPrice={18321.12}
          availableBalance={100000}
          initialHistory={demoTransactions}
          onOrderSuccess={() => console.log('Ordre de démonstration exécuté')}
        />
      </View>
      <View style={styles.row}>
        <Button
          label="Ouvrir la connexion"
          variant="primary"
          size="md"
          onPress={() => setIsLoginModalOpen(true)}
        />
        <Button
          label="Créer un compte"
          variant="outline"
          size="md"
          onPress={() => setIsSignUpModalOpen(true)}
        />
      </View>
      <CreateAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        assetCode="DAX40"
        currentPrice={18321.12}
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

      <Text style={styles.title}>Layout & tableaux</Text>
      <Text style={styles.sectionDescription}>
        Éléments structurants des écrans de marché et de portefeuille.
      </Text>
      <View style={styles.fullWidthCard}>
        <TopMarketTickerBar />
      </View>
      <View style={styles.fullWidthCard}>
        <AppFooter version="v1.0.0-beta" />
      </View>

      {/* Tableau de portefeuille */}
      <View style={styles.fullWidthCard}>
        <PortfolioTable>
          <PortfolioPositionRow
            countryOrCategory="ALLEMAGNE"
            name="DAX 40"
            averagePrice={743.43}
            currentPrice={843.50}
            valuation={32980.00}
            quantity={40.0}
            unrealizedPnLAmount={3123.00}
            unrealizedPnLPercent={0.43}
            onManagePress={() => console.log('Gérer DAX 40')}
          />
          <PortfolioPositionRow
            countryOrCategory="ALLEMAGNE"
            name="DAX 40"
            averagePrice={743.43}
            currentPrice={843.50}
            valuation={32980.00}
            quantity={40.0}
            unrealizedPnLAmount={-123.00}
            unrealizedPnLPercent={-0.43}
            onManagePress={() => console.log('Gérer DAX 40')}
          />
        </PortfolioTable>
      </View>

      <View style={styles.fullWidthCard}>
        <WatchlistHeader />
        <WatchlistCompactRow
          symbol="SPX"
          lastPrice={7630.49}
          changeAmount={65.32}
          changePercent={0.4}
        />
        <WatchlistCompactRow
          symbol="SPX"
          lastPrice={7630.49}
          changeAmount={-65.32}
          changePercent={-0.4}
        />
      </View>
      <View style={styles.fullWidthCard}>
        <MarketOverviewTable>
          <MarketOverviewRow
            countryOrCategory="ALLEMAGNE"
            name="DAX 40"
            symbol="DAX40"
            price="63 343,50 $"
            changePercent={0.43}
            volume24h="28,4 Mds $"
          />
          <MarketOverviewRow
            countryOrCategory="ALLEMAGNE"
            name="DAX 40"
            symbol="DAX40"
            price="63 343,50 $"
            changePercent={-0.43}
            volume24h="28,4 Mds $"
          />
        </MarketOverviewTable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: primitives.color_neutral_50,
    gap: 12,
    minHeight: '100%',
  },
  hero: {
    width: '100%',
    maxWidth: 1100,
    padding: 32,
    marginBottom: 28,
    borderRadius: 16,
    backgroundColor: primitives.color_neutral_950,
    boxShadow: `0px 10px 24px rgba(11, 15, 25, 0.12)`,
    elevation: 4,
  },
  eyebrow: {
    marginBottom: 12,
    color: primitives.color_blue_400,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: primitives.color_neutral_0,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  heroDescription: {
    maxWidth: 620,
    marginTop: 10,
    color: primitives.color_neutral_300,
    fontSize: 15,
    lineHeight: 22,
  },
  heroMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  heroMetaText: {
    color: primitives.color_neutral_400,
    fontSize: 12,
    fontWeight: '600',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 9999,
    backgroundColor: primitives.color_blue_400,
  },
  title: {
    width: '100%',
    maxWidth: 1100,
    marginTop: 28,
    marginBottom: 0,
    color: primitives.color_neutral_950,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  sectionDescription: {
    width: '100%',
    maxWidth: 1100,
    marginBottom: 8,
    color: primitives.color_neutral_500,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 24,
    marginBottom: 4,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: primitives.color_neutral_200,
    borderRadius: 12,
    backgroundColor: primitives.color_neutral_0,
    boxShadow: `0px 2px 8px rgba(17, 24, 39, 0.04)`,
    elevation: 1,
  },
  selectRow: {
    zIndex: 100,
    elevation: 100,
    overflow: 'visible',
  },
  fullWidthCard: {
    width: '100%',
    maxWidth: 1100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: primitives.color_neutral_200,
    borderRadius: 12,
    backgroundColor: primitives.color_neutral_0,
    boxShadow: `0px 2px 8px rgba(17, 24, 39, 0.04)`,
    elevation: 1,
  },
  widgetCard: {
    width: 320,
    borderWidth: 1,
    borderColor: primitives.color_neutral_200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  chartCard: {
    width: '100%',
    maxWidth: 1100,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: primitives.color_neutral_200,
    borderRadius: 12,
    backgroundColor: primitives.color_neutral_950,
    boxShadow: '0px 2px 8px rgba(17, 24, 39, 0.04)',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: primitives.color_neutral_800,
  },
  chartSymbol: {
    color: primitives.color_neutral_0,
    fontSize: 16,
    fontWeight: '700',
  },
  chartSubLabel: {
    marginTop: 4,
    color: primitives.color_neutral_400,
    fontSize: 12,
  },
  chartViewport: {
    position: 'relative',
    width: '100%',
    height: 420,
  },
  transactionCard: {
    flex: 1,
    minWidth: 420,
    overflow: 'hidden',
    borderRadius: 12,
  },
});
