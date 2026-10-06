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

export const DesignSystemPlayground = () => {
    const [appNotification, setAppNotification] = useState(true);
  const [numericValue, setNumericValue] = useState('1234.50');
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Playground Composants Button</Text>

      {/* Rangée 1 : Boutons Pilules */}
      <View style={styles.row}>
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="outline"
          leftIcon={true}
          shape="pill"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="primary"
          leftIcon={true}
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
          leftIcon={true}
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          bordered={true}
          size="lg"
          label="Button"
          variant="secondary"
          leftIcon={true}
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
          leftIcon={true}
          shape="rounded"
          onPress={() => console.log('Connexion Google')}
        />
        <Button
          size="md"
          label="Button"
          variant="secondary"
          leftIcon={true}
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
      <Text style={styles.title}>Playground Composants Input</Text>
      <View style={styles.row}>
        <InputField
          label="Text field"
          value="Contenue"
        />
        <InputField
          label="Text field"
          value="Contenue"
          error={true}
        />
        <InputField
          value="63,321.50"
          suffix="Limite"
          keyboardType="decimal-pad"
        />
        <InputField
          placeholder="Text field"
        />
        <NumericInput
          label="Montant"
          value={numericValue}
          onChangeText={setNumericValue}
          suffix="$"
          placeholder="0.00"
        />
      </View>

      <Text style={styles.title}>Playground Composants Select</Text>

      <View style={styles.row}>
        <SelectTrigger
          label="Prix"
          variant="boxed"
          direction="right"
          onPress={() => console.log('Prix sélectionné')}
        />
      </View>
      <View style={styles.row}>
        <SelectTrigger
          label="Prix"
          variant="ghost"
          direction="right"
        />
      </View>
      <Text style={styles.title}>Playground Composants Switch</Text>
      <View style={styles.row}>
        <Switch
          value="left"
          onChange={(value) => console.log('Switch value:', value)}
        />
      </View>

      <Text style={styles.title}>Playground Composants SearchBar</Text>
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

      <Text style={styles.title}>Playground Composants Checkbox</Text>
      <View style={styles.row}>
        <Checkbox
        checked={appNotification}
        onChange={setAppNotification}
        label="Notification par l’application"
      />
      </View>

      <Text style={styles.title}>Playground Composants Divider</Text>

      <View style={styles.row}>
        <Divider label="Ou" />
      </View>

      <Text style={styles.title}>Playground Composants PortfolioPerformanceBadge</Text>
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

      <Text style={styles.title}>Playground Composants PercentageBadge</Text>
      <View style={styles.row}>
        <PercentageBadge value={0.43} />
        <PercentageBadge value={-0.43} />
      </View>

      <Text style={styles.title}>Playground Composants FinancialValue</Text>
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

      <Text style={styles.title}>Playground Composants MarketTickerItem</Text>

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

      <Text style={styles.title}>Playground Composants MarketTickerInfo</Text>
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

      <Text style={styles.title}>Playground Composants MarketIndexCard</Text>
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
      <Text style={styles.title}>Playground Composants MarketCashInfo</Text>
      <View style={styles.row}>
        <MarketCashInfo
          label="LIQUIDITÉS"
          amount={100000}
        />
      </View>

      <Text style={styles.title}>Playground Composants AssetAllocationCard</Text>
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

        <Text style={styles.title}>Playground Composants Header </Text>
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

      <Text style={styles.title}>Playground Composants TopMarketTickerBar </Text>

      <TopMarketTickerBar />
      <Text style={styles.title}>Playground Composants Footer </Text>
      <AppFooter version="v1.0.0-beta" />

      <Text style={styles.title}>Playground Composants Table </Text>
      {/* Tableau de portefeuille */}
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

      <Text style={styles.title}>Playground Watchlist</Text>
      <View
        style={{
          width: 280,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          overflow: 'hidden',
        }}
      >
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
      <Text style={styles.title}>Playground Market Overview Table</Text>
      <View style={{ width: '100%', maxWidth: 760 }}>
        <MarketOverviewTable>
          <MarketOverviewRow
            countryOrCategory="ALLEMAGNE"
            name="DAX 40"
            price="63 343,50 $"
            changePercent={0.43}
            volume24h="28,4 Mds $"
          />
          <MarketOverviewRow
            countryOrCategory="ALLEMAGNE"
            name="DAX 40"
            price="63 343,50 $"
            changePercent={-0.43}
            volume24h="28,4 Mds $"
          />
        </MarketOverviewTable>

        <Text style={styles.title}>Playground WidgetHeader</Text>
        <View style={{ width: 320, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 }}>
          <WidgetHeader
            title="ORDER ENTRY"
            onMenuPress={() => console.log('Menu cliqué')}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    gap: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131722',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
});
