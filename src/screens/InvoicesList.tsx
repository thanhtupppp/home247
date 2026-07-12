import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Invoice {
  id: string;
  roomCode: string;
  roomId: string;
  buildingId: string;
  buildingName: string;
  tenantName: string;
  type: string;
  amount: string; // e.g. "5.500.000"
  status: 'success' | 'pending' | 'overdue';
  month: string; // e.g. "10/2026"
}

interface Building {
  id: string;
  name: string;
}

const MONTHS = ['05/2026', '06/2026', '07/2026', '08/2026', '09/2026', '10/2026', '11/2026', '12/2026'];
const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'paid', label: 'Đã thu tiền' },
  { key: 'unpaid', label: 'Chưa thanh toán' },
] as const;

export const InvoicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Default month: Current Month
  const currentMonthStr = React.useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${mm}/${now.getFullYear()}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = React.useState(currentMonthStr);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'paid' | 'unpaid'>('all');

  // Ensure default month is in the MONTHS array
  const finalMonths = React.useMemo(() => {
    if (!MONTHS.includes(selectedMonth)) {
      return [...MONTHS, selectedMonth].sort((a, b) => {
        const [mA, yA] = a.split('/').map(Number);
        const [mB, yB] = b.split('/').map(Number);
        return yA !== yB ? yA - yB : mA - mB;
      });
    }
    return MONTHS;
  }, [selectedMonth]);

  // ── Fetch Buildings ────────────────────────────────────────────────────────
  const fetchBuildingsAndInvoices = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      
      // 1. Get buildings
      const bSnap = await getDocs(query(collection(db, 'buildings'), orderBy('name')));
      const bList = bSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setBuildings(bList);

      let currentB = selectedBuilding;
      if (bList.length > 0 && !selectedBuilding) {
        currentB = bList[0];
        setSelectedBuilding(bList[0]);
      }

      // 2. Fetch invoices
      const invSnap = await getDocs(query(collection(db, 'invoices'), orderBy('createdAt', 'desc')));
      const invList: Invoice[] = invSnap.docs.map(doc => {
        const data = doc.data();
        // format amount
        let amt = data.amount || '0';
        if (typeof amt === 'number') {
          amt = amt.toLocaleString('vi-VN');
        }
        return {
          id: doc.id,
          roomCode: data.roomCode || '',
          roomId: data.roomId || '',
          buildingId: data.buildingId || '',
          buildingName: data.buildingName || '',
          tenantName: data.tenantName || '',
          type: data.type || 'Tiền điện nước',
          amount: amt,
          status: data.status || 'pending',
          month: data.month || '',
        };
      });
      setInvoices(invList);
    } catch (err) {
      console.error('Error fetching invoices/buildings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (isFocused) {
      fetchBuildingsAndInvoices();
    }
  }, [isFocused]);

  // ── Computed Filtered Invoices ─────────────────────────────────────────────
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Filter by Building
      if (selectedBuilding && inv.buildingId !== selectedBuilding.id) return false;
      // 2. Filter by Month
      if (inv.month !== selectedMonth) return false;
      // 3. Filter by Status Tab
      if (activeFilter === 'paid' && inv.status !== 'success') return false;
      if (activeFilter === 'unpaid' && inv.status === 'success') return false;
      return true;
    });
  }, [invoices, selectedBuilding, selectedMonth, activeFilter]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Hóa đơn</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Months Selector */}
      <View style={styles.monthsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScroll}>
          {finalMonths.map((month) => {
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
        {FILTERS.map((filter) => {
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchBuildingsAndInvoices(true)} />}
      >
        {/* Building Selector Card */}
        {buildings.length > 0 && selectedBuilding && (
          <View style={styles.buildingSelectorWrapper}>
            <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.selectorCard}>
              <View style={styles.selectorLeft}>
                <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
                <Text style={styles.buildingName}>{selectedBuilding.name}</Text>
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
                {buildings.map((b) => (
                  <Pressable
                    key={b.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedBuilding(b);
                      setShowBuildingDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{b.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Content Area */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Đang tải danh sách hóa đơn...</Text>
            </View>
          ) : filteredInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={48} color="#cbd5e1" style={{ marginBottom: 8 }} />
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
                        {tx.status === 'success' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardMiddle}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Khách thuê</Text>
                      <Text style={styles.infoValue}>{tx.tenantName || 'Trống'}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Hạng mục</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>{tx.type}</Text>
                    </View>
                    <View style={styles.infoColAlignRight}>
                      <Text style={styles.infoLabel}>Số tiền</Text>
                      <Text style={styles.amountValue}>{tx.amount} đ</Text>
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
          onPress={() => navigation.navigate('hoa-don/them', { buildingId: selectedBuilding?.id })}
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
    paddingVertical: 80,
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
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
  },
});

export default InvoicesList;
