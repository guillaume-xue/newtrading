'use client';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { SimulatedTransactionResponse } from '@/lib/api/tradeApi';

interface TransactionHistoryTableProps {
  transactions: SimulatedTransactionResponse[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  transactions,
  page,
  totalPages,
  onPageChange,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors_bg_secondary ?? '#111827',
          borderColor: theme['colors_button_outline-border'] ?? '#374151',
        },
      ]}
    >
      <View style={[styles.headerRow, { borderBottomColor: theme['colors_divider_text'] ?? '#374151' }]}>
        <Text style={[styles.headerCell, { flex: 1.5, color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>DATE</Text>
        <Text style={[styles.headerCell, { flex: 1.2, color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>ACTIF</Text>
        <Text style={[styles.headerCell, { flex: 1, color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>TYPE</Text>
        <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'right', color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>QUANTITÉ</Text>
        <Text style={[styles.headerCell, { flex: 1.5, textAlign: 'right', color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>PRIX EXEC.</Text>
      </View>

      {transactions.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme['colors_text_secondary'] ?? '#9CA3AF' }]}>
          Aucune transaction exécutée
        </Text>
      ) : (
        transactions.map((t) => (
          <View key={t.id} style={[styles.dataRow, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
            <Text style={[styles.cellText, { flex: 1.5, color: theme.colors_text_primary ?? '#FFF' }]}>
              {new Date(t.executedAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <Text style={[styles.cellText, { flex: 1.2, fontWeight: '700', color: theme.colors_text_primary ?? '#FFF' }]}>
              {t.assetCode}
            </Text>
            <Text
              style={[
                styles.cellText,
                { flex: 1, fontWeight: '700', color: t.orderDirection === 'BUY' ? '#10B981' : '#EF4444' },
              ]}
            >
              {t.orderDirection}
            </Text>
            <Text style={[styles.cellText, { flex: 1.5, textAlign: 'right', color: theme.colors_text_primary ?? '#FFF' }]}>
              {t.quantity}
            </Text>
            <Text style={[styles.cellText, { flex: 1.5, textAlign: 'right', color: theme.colors_text_primary ?? '#FFF' }]}>
              {t.executionPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} $
            </Text>
          </View>
        ))
      )}

      {/* Contrôles de pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationRow}>
          <TouchableOpacity
            disabled={page === 0}
            onPress={() => onPageChange(page - 1)}
            style={[styles.pageBtn, page === 0 && styles.disabledBtn]}
          >
            <Text style={styles.pageBtnText}>Précédent</Text>
          </TouchableOpacity>

          <Text style={{ color: theme['colors_text_secondary'] ?? '#9CA3AF', fontSize: 12 }}>
            Page {page + 1} sur {totalPages}
          </Text>

          <TouchableOpacity
            disabled={page + 1 >= totalPages}
            onPress={() => onPageChange(page + 1)}
            style={[styles.pageBtn, page + 1 >= totalPages && styles.disabledBtn]}
          >
            <Text style={styles.pageBtnText}>Suivant</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
  },
  dataRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 12,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
    fontSize: 12,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
  },
  disabledBtn: {
    opacity: 0.3,
  },
  pageBtnText: {
    color: '#FFF',
    fontSize: 12,
  },
});
