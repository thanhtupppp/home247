import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import { recentTransactions } from '../data/mockData';
import { theme } from '../theme';

export interface InvoicesListProps {
  readonly className?: string;
}

export const InvoicesList: React.FC<InvoicesListProps> = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TopAppBar />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.subtitle}>TRANG QUẢN TRỊ</Text>
            <Text style={styles.title}>Hóa đơn & Thanh toán</Text>
          </View>
          <Pressable 
            style={styles.actionBtn}
            onPress={() => navigation.navigate('thong-ke')}
            accessibilityRole="button"
            accessibilityLabel="View statistics"
          >
            <MaterialIcons name="trending-up" size={16} color={theme.colors.onSurface} />
            <Text style={styles.actionBtnText}>Xem Thống kê</Text>
          </Pressable>
        </View>

        {/* Invoice List Container */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderCard}>
            <Text style={styles.listHeaderTitle}>Danh sách hóa đơn gần đây</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Create invoice">
              <Text style={styles.createBtnText}>Tạo hóa đơn</Text>
            </Pressable>
          </View>

          {recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.invoiceCard}>
              <View style={styles.cardTop}>
                <View style={styles.roomBadge}>
                  <Text style={styles.roomText}>{tx.roomCode}</Text>
                </View>
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
                    {tx.status === 'success' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMiddle}>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Khách thuê</Text>
                  <Text style={styles.infoValue}>{tx.tenantName}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.infoLabel}>Hạng mục</Text>
                  <Text style={styles.infoValue}>{tx.type}</Text>
                </View>
                <View style={styles.infoColAlignRight}>
                  <Text style={styles.infoLabel}>Số tiền</Text>
                  <Text 
                    style={[
                      styles.amountValue,
                      tx.isExpense ? styles.expenseColor : styles.incomeColor
                    ]}
                  >
                    {tx.amount}
                  </Text>
                </View>
              </View>

              <Pressable 
                style={styles.detailBtn}
                onPress={() => navigation.navigate('hoa-don/id', { id: tx.id })}
                accessibilityRole="button"
                accessibilityLabel={`View invoice details for ${tx.roomCode}`}
              >
                <Text style={styles.detailBtnText}>Xem chi tiết hóa đơn</Text>
                <MaterialIcons name="chevron-right" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 1.2,
  },
  title: {
    ...theme.typography.headlineLgMobile,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  actionBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 16,
  },
  listHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  listHeaderTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  createBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  invoiceCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  roomBadge: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
  },
  roomText: {
    ...theme.typography.numericData,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  successBadge: {
    backgroundColor: '#d1fae5',
  },
  successText: {
    color: '#065f46',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overdueBadge: {
    backgroundColor: '#fee2e2',
  },
  overdueText: {
    color: '#991b1b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  infoCol: {
    flex: 1.2,
    gap: 4,
  },
  infoColAlignRight: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...theme.typography.bodyMd,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  amountValue: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
  },
  incomeColor: {
    color: theme.colors.primary,
  },
  expenseColor: {
    color: theme.colors.error,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  detailBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});

export default InvoicesList;
