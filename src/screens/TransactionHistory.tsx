import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  SectionList,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  roomCode: string;
  buildingId: string;
  buildingName: string;
  tenantName: string;
  type: string;
  amount: number;
  amountFormatted: string;
  status: 'success' | 'pending' | 'overdue';
  month: string;
  paidAt?: string; // formatted date string
  createdAt?: any;
}

interface Building {
  id: string;
  name: string;
}

interface MonthSection {
  title: string;           // e.g. "07/2026"
  totalAmount: number;
  data: Transaction[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatVND = (n: number) => n.toLocaleString('vi-VN') + ' đ';

const getMonthLabel = (monthStr: string) => {
  const [mm, yyyy] = monthStr.split('/');
  return `Tháng ${mm}/${yyyy}`;
};

const getStatusColor = (status: Transaction['status']) => {
  if (status === 'success') return { bg: '#e6f4ea', text: '#137333' };
  if (status === 'overdue') return { bg: '#fce8e6', text: '#c5221f' };
  return { bg: '#fff8e6', text: '#b45309' };
};

const getStatusLabel = (status: Transaction['status']) => {
  if (status === 'success') return 'Đã thu';
  if (status === 'overdue') return 'Quá hạn';
  return 'Chưa thu';
};

// ── Main Component ────────────────────────────────────────────────────────────

const TransactionHistory: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = React.useState<string | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'all' | 'success' | 'pending' | 'overdue'>('all');

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = React.useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // 1. Buildings
      const bSnap = await getDocs(
        query(collection(db, 'buildings'), where('ownerId', '==', uid))
      );
      const bList: Building[] = bSnap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      bList.sort((a, b) => a.name.localeCompare(b.name));
      setBuildings(bList);
      if (!selectedBuildingId && bList.length > 0) {
        setSelectedBuildingId(bList[0].id);
      }

      // 2. Invoices (all statuses to show full history)
      const invSnap = await getDocs(
        query(collection(db, 'invoices'), where('ownerId', '==', uid))
      );
      const list: Transaction[] = invSnap.docs.map((doc) => {
        const data = doc.data();
        const rawAmt = typeof data.amount === 'number' ? data.amount : parseInt((data.amount || '0').replace(/\D/g, ''), 10) || 0;
        return {
          id: doc.id,
          roomCode: data.roomCode || '',
          buildingId: data.buildingId || '',
          buildingName: data.buildingName || '',
          tenantName: data.tenantName || '',
          type: data.type || 'Tiền phòng',
          amount: rawAmt,
          amountFormatted: rawAmt.toLocaleString('vi-VN'),
          status: data.status || 'pending',
          month: data.month || '',
          createdAt: data.createdAt,
        };
      });

      // Sort by createdAt desc
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setTransactions(list);
    } catch (err) {
      console.error('TransactionHistory fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBuildingId]);

  React.useEffect(() => {
    if (isFocused) fetchData();
  }, [isFocused]);

  // ── Derived: filtered list ────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return transactions.filter((tx) => {
      if (selectedBuildingId && tx.buildingId !== selectedBuildingId) return false;
      if (activeTab !== 'all' && tx.status !== activeTab) return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        if (
          !tx.tenantName.toLowerCase().includes(q) &&
          !tx.roomCode.toLowerCase().includes(q) &&
          !tx.type.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [transactions, selectedBuildingId, activeTab, searchText]);

  // ── Derived: grouped by month ─────────────────────────────────────────────
  const sections: MonthSection[] = React.useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.forEach((tx) => {
      const key = tx.month || 'Không rõ';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tx);
    });
    // Sort months descending
    const keys = Array.from(map.keys()).sort((a, b) => {
      const parse = (s: string) => {
        const [mm, yyyy] = s.split('/').map(Number);
        return (yyyy || 0) * 100 + (mm || 0);
      };
      return parse(b) - parse(a);
    });
    return keys.map((k) => {
      const data = map.get(k)!;
      const total = data.reduce((s, t) => s + t.amount, 0);
      return { title: k, totalAmount: total, data };
    });
  }, [filtered]);

  // ── Summary stats ─────────────────────────────────────────────────────────
  const totalCollected = filtered
    .filter((t) => t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);
  const totalPending = filtered
    .filter((t) => t.status !== 'success')
    .reduce((s, t) => s + t.amount, 0);

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  // ── Render helpers ────────────────────────────────────────────────────────
  const TAB_OPTIONS = [
    { key: 'all',     label: 'Tất cả' },
    { key: 'success', label: 'Đã thu' },
    { key: 'pending', label: 'Chưa thu' },
    { key: 'overdue', label: 'Quá hạn' },
  ] as const;

  return (
    <View style={styles.root}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Lịch sử Giao dịch</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Building Selector ── */}
      {buildings.length > 0 && (
        <View style={styles.buildingSelectorWrapper}>
          <Pressable
            onPress={() => setShowBuildingDropdown(!showBuildingDropdown)}
            style={styles.buildingSelector}
          >
            <MaterialIcons name="apartment" size={18} color={theme.colors.primary} />
            <Text style={styles.buildingName} numberOfLines={1}>
              {selectedBuilding?.name ?? 'Chọn toà nhà'}
            </Text>
            <MaterialIcons
              name={showBuildingDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={22}
              color={theme.colors.primary}
            />
          </Pressable>

          {showBuildingDropdown && (
            <View style={styles.dropdown}>
              {buildings.map((b) => (
                <Pressable
                  key={b.id}
                  style={[
                    styles.dropdownItem,
                    b.id === selectedBuildingId && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedBuildingId(b.id);
                    setShowBuildingDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    b.id === selectedBuildingId && styles.dropdownItemTextActive,
                  ]}>
                    {b.name}
                  </Text>
                  {b.id === selectedBuildingId && (
                    <MaterialIcons name="check" size={16} color={theme.colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Search Bar ── */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm khách thuê, phòng, hạng mục..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Status Tabs ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
        style={styles.tabsContainer}
      >
        {TAB_OPTIONS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải lịch sử giao dịch...</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
          }
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            /* ── Summary Cards ── */
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: '#e6f4ea' }]}>
                <MaterialIcons name="check-circle" size={20} color="#137333" />
                <View style={styles.summaryTexts}>
                  <Text style={styles.summaryLabel}>Đã thu</Text>
                  <Text style={[styles.summaryAmount, { color: '#137333' }]}>
                    {formatVND(totalCollected)}
                  </Text>
                </View>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#fce8e6' }]}>
                <MaterialIcons name="pending" size={20} color="#c5221f" />
                <View style={styles.summaryTexts}>
                  <Text style={styles.summaryLabel}>Còn lại</Text>
                  <Text style={[styles.summaryAmount, { color: '#c5221f' }]}>
                    {formatVND(totalPending)}
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={52} color="#cbd5e1" />
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
              <Text style={styles.emptySubText}>Các hoá đơn sẽ xuất hiện tại đây</Text>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{getMonthLabel(section.title)}</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{section.data.length} giao dịch</Text>
              </View>
              <Text style={styles.sectionTotal}>{formatVND(section.totalAmount)}</Text>
            </View>
          )}
          renderItem={({ item: tx }) => {
            const statusColor = getStatusColor(tx.status);
            return (
              <Pressable
                style={styles.txCard}
                onPress={() => navigation.navigate('hoa-don/id', { id: tx.id })}
              >
                {/* Left accent bar */}
                <View style={[styles.accentBar, { backgroundColor: statusColor.text }]} />

                <View style={styles.txBody}>
                  <View style={styles.txTopRow}>
                    <View style={styles.roomPill}>
                      <MaterialIcons name="meeting-room" size={13} color={theme.colors.primary} />
                      <Text style={styles.roomText}>{tx.roomCode}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: statusColor.bg }]}>
                      <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {getStatusLabel(tx.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.txMiddleRow}>
                    <View style={styles.txInfo}>
                      <Text style={styles.txType} numberOfLines={1}>{tx.type}</Text>
                      <Text style={styles.txTenant} numberOfLines={1}>
                        {tx.tenantName || 'Phòng trống'}
                      </Text>
                    </View>
                    <Text style={styles.txAmount}>
                      {tx.amountFormatted} đ
                    </Text>
                  </View>
                </View>

                <MaterialIcons name="chevron-right" size={20} color={theme.colors.outlineVariant} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  backBtn: {
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
  // Building Selector
  buildingSelectorWrapper: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: theme.colors.surfaceContainerLowest,
    zIndex: 20,
  },
  buildingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bce0fd',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  buildingName: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  dropdownItemActive: {
    backgroundColor: '#eff4ff',
  },
  dropdownItemText: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  dropdownItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  // Search
  searchSection: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    padding: 0,
  },
  // Tabs
  tabsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    maxHeight: 52,
  },
  tabsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  // Loading / Empty
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
  },
  emptySubText: {
    ...theme.typography.bodyMd,
    color: theme.colors.outlineVariant,
  },
  // List
  listContent: {
    paddingBottom: 40,
  },
  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: theme.borderRadius.xl,
  },
  summaryTexts: {
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#444',
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    gap: 8,
  },
  sectionTitle: {
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  sectionBadge: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  sectionBadgeText: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  sectionTotal: {
    flex: 1,
    textAlign: 'right',
    ...theme.typography.bodyMd,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  // Transaction card
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginHorizontal: theme.spacing.marginMobile,
    marginTop: 10,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  txBody: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  txTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.lg,
  },
  roomText: {
    ...theme.typography.numericData,
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  txMiddleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txType: {
    ...theme.typography.bodyMd,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  txTenant: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  txAmount: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default TransactionHistory;
