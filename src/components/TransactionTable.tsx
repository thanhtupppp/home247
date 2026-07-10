import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import type { Transaction } from '../data/mockData';
import { theme } from '../theme';

export interface TransactionTableProps {
  readonly transactions: readonly Transaction[];
  readonly className?: string;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Giao dịch gần đây</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Export report">
          <Text style={styles.exportText}>Xuất báo cáo</Text>
        </Pressable>
      </View>
      
      <View style={styles.list}>
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.row}>
            <View style={styles.rowInfo}>
              <View style={styles.roomBadge}>
                <Text style={styles.roomText}>{tx.roomCode}</Text>
              </View>
              <View style={styles.tenantDetails}>
                <Text style={styles.tenantName}>{tx.tenantName}</Text>
                <Text style={styles.txType}>{tx.type}</Text>
              </View>
            </View>
            
            <View style={styles.rowStatus}>
              <Text 
                style={[
                  styles.amount,
                  tx.isExpense ? styles.expenseAmount : styles.incomeAmount
                ]}
              >
                {tx.amount}
              </Text>
              <View 
                style={[
                  styles.statusBadge,
                  tx.status === 'success' ? styles.successBadge : styles.overdueBadge
                ]}
              >
                <Text 
                  style={[
                    styles.statusText,
                    tx.status === 'success' ? styles.successText : styles.overdueText
                  ]}
                >
                  {tx.status === 'success' ? 'Thành công' : 'Trễ hạn'}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  exportText: {
    ...theme.typography.labelMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomBadge: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomText: {
    ...theme.typography.numericData,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  tenantDetails: {
    gap: 2,
  },
  tenantName: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  txType: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  rowStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    ...theme.typography.numericData,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: theme.colors.primary,
  },
  expenseAmount: {
    color: theme.colors.error,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  successBadge: {
    backgroundColor: '#d1fae5', // Light green
  },
  overdueBadge: {
    backgroundColor: '#fee2e2', // Light red
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  successText: {
    color: '#065f46',
  },
  overdueText: {
    color: '#991b1b',
  },
});

export default TransactionTable;
