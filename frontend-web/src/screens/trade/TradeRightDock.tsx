'use client';

import React, { memo, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Image from 'next/image';

import walletIcon from '@/assets/icons/money-bill-transfer 1.svg';
import alarmClockIcon from '@/assets/icons/alarm-clock.svg';

import { AlertPanel } from '@/components/features/market/components/AlertPanel';
import { OrderFormPanel } from '@/components/portfolio/components/OrderFormPanel';
import { RightWorkspaceTab } from '@/hooks/useTradeWorkspace';
import { useAppTheme } from '@/theme/ThemeContext';

interface TradeRightDockProps {
  symbol: string;
  currentPrice: number;
  availableBalance: number;
  activeTab: RightWorkspaceTab;
  alertRefreshToken: number;
  onToggleTab: (tab: Exclude<RightWorkspaceTab, null>) => void;
  onOrderSuccess: () => Promise<void> | void;
  onOpenCreateAlertModal: () => void;
}

/**
 * Colonne droite du trading desk : panneau actif (Ordre ou Alertes)
 * et rail vertical de bascule rapide.
 */
export const TradeRightDock: React.FC<TradeRightDockProps> = memo(
  ({
    symbol,
    currentPrice,
    availableBalance,
    activeTab,
    alertRefreshToken,
    onToggleTab,
    onOrderSuccess,
    onOpenCreateAlertModal,
  }) => {
    const { theme } = useAppTheme();
    const { colors, primitives, isDark } = theme;

    const iconFilter = useMemo(
      () => (isDark ? 'brightness(0) invert(1) opacity(0.85)' : 'brightness(0) opacity(0.75)'),
      [isDark]
    );

    const borderColor = colors['colors_divider_text'];
    const surfaceColor = colors['colors_bg_secondary'];
    const activeBgColor = colors['colors_bg_primary'];
    const radiusSm = primitives['spacing & layout_border radius_radius-sm'] ?? 6;
    const borderThin = primitives['border width_border-thin'] ?? 1;

    return (
      <>
        {activeTab !== null && (
          <View
            style={[
              styles.panelColumn,
              {
                backgroundColor: surfaceColor,
                borderRightColor: borderColor,
                borderRightWidth: borderThin,
              },
            ]}
          >
            {activeTab === 'order' ? (
              <OrderFormPanel
                assetCode={symbol}
                currentPrice={currentPrice}
                availableBalance={availableBalance}
                onOrderSuccess={onOrderSuccess}
              />
            ) : (
              <AlertPanel
                assetCode={symbol}
                refreshToken={alertRefreshToken}
                onAddPress={onOpenCreateAlertModal}
              />
            )}
          </View>
        )}

        <View style={[styles.iconSidebar, { backgroundColor: surfaceColor }]}>
          <Pressable
            onPress={() => onToggleTab('order')}
            accessibilityRole="button"
            accessibilityLabel="Panneau d'ordre"
            accessibilityState={{ selected: activeTab === 'order' }}
            style={[
              styles.sidebarBtn,
              { borderRadius: radiusSm },
              activeTab === 'order' && { backgroundColor: activeBgColor },
            ]}
          >
            <Image
              src={walletIcon}
              width={20}
              height={20}
              alt="Ordre"
              style={{ filter: iconFilter }}
            />
          </Pressable>

          <Pressable
            onPress={() => onToggleTab('alerts')}
            accessibilityRole="button"
            accessibilityLabel="Panneau d'alertes"
            accessibilityState={{ selected: activeTab === 'alerts' }}
            style={[
              styles.sidebarBtn,
              { borderRadius: radiusSm },
              activeTab === 'alerts' && { backgroundColor: activeBgColor },
            ]}
          >
            <Image
              src={alarmClockIcon}
              width={20}
              height={20}
              alt="Alertes"
              style={{ filter: iconFilter }}
            />
          </Pressable>
        </View>
      </>
    );
  }
);

TradeRightDock.displayName = 'TradeRightDock';

const styles = StyleSheet.create({
  panelColumn: {
    width: 400,
    height: '100%',
  },
  iconSidebar: {
    width: 44,
    alignItems: 'center',
    paddingTop: 12,
    gap: 16,
  },
  sidebarBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
