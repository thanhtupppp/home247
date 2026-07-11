import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { recentTransactions } from '../data/mockData';

export const InvoicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedMonth, setSelectedMonth] = React.useState('10/2026');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedBuilding, setSelectedBuilding] = React.useState('nơ trang long');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const months = ['2026', '09/2026', '10/2026', '11/2026', '12/2026'];
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'paid', label: 'Đã thu tiền' },
    { key: 'unpaid', label: 'Chưa thu đủ' },
  ] as const;

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];

  // Filter invoices based on selected building
  // "nơ trang long" defaults to 0 invoices as in screenshot
  const filteredInvoices = selectedBuilding === 'nơ trang long' ? [] : recentTransactions;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Hoá đơn</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Months Selector */}
      <View style={styles.monthsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScroll}>
          {months.map((month) => {
            const isActive = selectedMonth === month;
            return (
              <Pressable key={month} onPress={() => setSelectedMonth(month)} style={styles.monthItem}>
                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                  {month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Filter Pills */}
      <View style={styles.pillsContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Building Selector Card */}
        <View style={styles.buildingSelectorWrapper}>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.selectorCard}>
            <View style={styles.selectorLeft}>
              <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              <Text style={styles.buildingName}>{selectedBuilding}</Text>
            </View>
            <View style={styles.selectorRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filteredInvoices.length}</Text>
              </View>
              <MaterialIcons name={showBuildingDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={theme.colors.primary} />
            </View>
          </Pressable>

          {showBuildingDropdown && (
            <View style={styles.dropdown}>
              {buildings.map((building) => (
                <Pressable
                  key={building}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedBuilding(building);
                    setShowBuildingDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{building}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Content Area */}
        <View style={styles.content}>
          {filteredInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Không có hoá đơn</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredInvoices.map((tx) => (
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
                        {tx.status === 'success' ? 'Đã thu tiền' : 'Chưa thu đủ'}
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
                      <Text style={styles.amountValue}>{tx.amount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('hoa-don/them', { building: selectedBuilding })}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.actionBtnText}>Tạo hoá đơn</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  monthsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 12,
  },
  monthsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 24,
  },
  monthItem: {
    paddingVertical: 4,
  },
  monthText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  monthTextActive: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: 16,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  buildingSelectorWrapper: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: 16,
    zIndex: 10,
  },
  selectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bce0fd',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buildingName: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  dropdownItemText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: theme.spacing.marginMobile,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    gap: 16,
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
    backgroundColor: '#e6f4ea',
  },
  successText: {
    color: '#137333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overdueBadge: {
    backgroundColor: '#fce8e6',
  },
  overdueText: {
    color: '#c5221f',
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
    color: theme.colors.primary,
  },
  bottomBar: {
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default InvoicesList;
