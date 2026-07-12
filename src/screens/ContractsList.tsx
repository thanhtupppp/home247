import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  FlatList, ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface Contract {
  id: string;
  tenantName: string;
  phoneNumber: string;
  buildingName: string;
  roomCode: string;
  startDate: string;
  endDate: string;
  depositPrice: string;
  rentPrice: string;
  status: 'active' | 'expired' | 'pending';
}

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang hoạt động' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'expired', label: 'Đã hết hạn' },
] as const;

export const ContractsList: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [contracts, setContracts] = React.useState<Contract[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<'active' | 'all' | 'pending' | 'expired'>('active');

  // ── Fetch Contracts ────────────────────────────────────────────────────────
  const fetchContracts = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const snap = await getDocs(
        query(collection(db, 'contracts'), orderBy('createdAt', 'desc'))
      );
      const list: Contract[] = snap.docs.map((doc) => {
        const data = doc.data();
        let rent = data.rentPrice || '0';
        if (typeof rent === 'number') {
          rent = rent.toLocaleString('vi-VN');
        }
        let dep = data.depositPrice || '0';
        if (typeof dep === 'number') {
          dep = dep.toLocaleString('vi-VN');
        }
        return {
          id: doc.id,
          tenantName: data.tenantName || '',
          phoneNumber: data.phoneNumber || '',
          buildingName: data.buildingName || '',
          roomCode: data.roomCode || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          depositPrice: dep,
          rentPrice: rent,
          status: data.status || 'active',
        };
      });
      setContracts(list);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (isFocused) {
      fetchContracts();
    }
  }, [isFocused]);

  // ── Computed Filtered Contracts ───────────────────────────────────────────
  const filteredContracts = React.useMemo(() => {
    return contracts
      .filter((c) => {
        if (activeFilter === 'all') return true;
        return c.status === activeFilter;
      })
      .filter((c) => {
        if (!searchText.trim()) return true;
        const q = searchText.toLowerCase();
        return (
          c.tenantName.toLowerCase().includes(q) ||
          c.roomCode.toLowerCase().includes(q) ||
          c.buildingName.toLowerCase().includes(q)
        );
      });
  }, [contracts, activeFilter, searchText]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Hợp đồng</Text>
        <Pressable onPress={() => navigation.navigate('hop-dong/moi')} style={styles.createButton}>
          <MaterialIcons name="add" size={16} color={theme.colors.primary} />
          <Text style={styles.createButtonText}>Tạo HĐ</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm hợp đồng..."
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

      {/* Filter Pills */}
      <View style={styles.pillsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
          data={FILTERS}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.key;
            return (
              <Pressable
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveFilter(item.key)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchContracts(true)} />}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách hợp đồng...</Text>
          </View>
        ) : filteredContracts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="description" size={52} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Text style={styles.emptyStateText}>Không có hợp đồng nào</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredContracts.map((c) => (
              <Pressable 
                key={c.id} 
                style={styles.itemCard}
                onPress={() => navigation.navigate('hop-dong/chi-tiet', { contractId: c.id })}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.itemTitle}>Phòng {c.roomCode}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      c.status === 'active' ? styles.successBadge : styles.errorBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        c.status === 'active' ? styles.successText : styles.errorText,
                      ]}
                    >
                      {c.status === 'active' ? 'Đang hiệu lực' : c.status === 'pending' ? 'Chờ duyệt' : 'Hết hạn'}
                    </Text>
                  </View>
                </View>
                <View style={styles.gridData}>
                  <Text style={styles.gridLabel}>
                    Khách thuê: <Text style={styles.gridValue}>{c.tenantName}</Text>
                  </Text>
                  <Text style={styles.gridLabel}>
                    Tiền phòng: <Text style={styles.gridValue}>{c.rentPrice} đ</Text>
                  </Text>
                  <Text style={styles.gridLabel}>
                    Tiền cọc: <Text style={styles.gridValue}>{c.depositPrice} đ</Text>
                  </Text>
                  <Text style={styles.gridLabel}>
                    Thời hạn: <Text style={styles.gridValue}>{c.startDate} - {c.endDate}</Text>
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  createButtonText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 12,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
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
  pillsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  pillsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 10,
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
  scrollContent: {
    padding: theme.spacing.marginMobile,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyStateText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    gap: 12,
  },
  itemCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
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
  errorBadge: {
    backgroundColor: '#fce8e6',
  },
  errorText: {
    color: '#c5221f',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridData: {
    gap: 6,
  },
  gridLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  gridValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
});

export default ContractsList;
