import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, RefreshControl
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

interface Tenant {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  buildingName: string;
  roomCode: string;
  moveInDate: string;
  status: string; // 'active' | 'expiring' | 'expired'
  gender: string;
}

// Utility: check if a dd/mm/yyyy date string is within the next N days
const isWithinDays = (dateStr: string, days: number): boolean => {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const [dd, mm, yyyy] = parts;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  const diff = (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= days;
};

const isExpired = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  const [dd, mm, yyyy] = parts;
  const date = new Date(`${yyyy}-${mm}-${dd}`);
  if (isNaN(date.getTime())) return false;
  return date < new Date();
};

// Derive status from moveInDate (contract end date placeholder)
// TODO: replace with actual contractEndDate when contracts are linked
const deriveStatus = (tenant: any): 'active' | 'expiring' | 'expired' => {
  const endDate = tenant.contractEndDate || '';
  if (endDate && isExpired(endDate)) return 'expired';
  if (endDate && isWithinDays(endDate, 30)) return 'expiring';
  return 'active';
};

const tabs = [
  { key: 'active', label: 'Đang ở' },
  { key: 'expiring', label: 'Sắp hết hợp đồng' },
  { key: 'expired', label: 'Đã hết hợp đồng' },
] as const;

// ── Render helpers ────────────────────────────────────────────────────────────
const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

const avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

export const TenantsList: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'active' | 'expiring' | 'expired'>('active');

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchTenants = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const snap = await getDocs(
        query(collection(db, 'tenants'), orderBy('fullName'))
      );
      const list: Tenant[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          buildingName: data.buildingName || '',
          roomCode: data.roomCode || '',
          moveInDate: data.moveInDate || '',
          status: deriveStatus(data),
          gender: data.gender || '',
        };
      });
      setTenants(list);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    if (isFocused) fetchTenants();
  }, [isFocused]);

  // ── Computed ─────────────────────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return tenants.filter((t) => {
      if (t.status !== activeTab) return false;
      if (!searchText.trim()) return true;
      const q = searchText.toLowerCase();
      return (
        t.fullName.toLowerCase().includes(q) ||
        t.phoneNumber.includes(q) ||
        t.roomCode.toLowerCase().includes(q) ||
        t.buildingName.toLowerCase().includes(q)
      );
    });
  }, [tenants, activeTab, searchText]);

  const expiringCount = React.useMemo(
    () => tenants.filter((t) => t.status === 'expiring').length,
    [tenants]
  );



  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Danh sách cư dân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTenants(true)} />}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cư dân..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={18} color="#94a3b8" />
            </Pressable>
          )}
        </View>

        {/* Expiring Banner — only shown if there are expiring contracts */}
        {expiringCount > 0 && (
          <Pressable style={styles.banner} onPress={() => setActiveTab('expiring')}>
            <View style={styles.bannerLeft}>
              <View style={styles.bellCircle}>
                <MaterialIcons name="notifications-none" size={22} color="#3b82f6" />
              </View>
              <View style={styles.bannerTextContainer}>
                <Text style={styles.bannerTitle}>
                  {expiringCount} hợp đồng sắp hết hạn trong 30 ngày
                </Text>
                <Text style={styles.bannerSubtitle}>Kiểm tra danh sách và nhắc khách gia hạn</Text>
              </View>
            </View>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#3b82f6" />
          </Pressable>
        )}

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tenants.filter((t) => t.status === tab.key).length;
            return (
              <Pressable
                key={tab.key}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {tab.label}{count > 0 ? ` (${count})` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={52} color="#cbd5e1" />
            <Text style={styles.emptyStateTitle}>
              {searchText ? 'Không tìm thấy kết quả' : 'Chưa có cư dân'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchText
                ? 'Thử tìm kiếm với từ khóa khác'
                : 'Nhấn "+ Thêm cư dân" để bắt đầu'}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <Text style={styles.countLabel}>{filtered.length} cư dân</Text>
            {filtered.map((tenant) => (
              <Pressable
                key={tenant.id}
                style={styles.tenantCard}
                onPress={() => navigation.navigate('cu-dan/chi-tiet', { tenantId: tenant.id })}
              >
                {/* Avatar */}
                <View style={[styles.avatar, { backgroundColor: getColor(tenant.fullName) }]}>
                  <Text style={styles.avatarText}>{getInitials(tenant.fullName)}</Text>
                </View>

                {/* Info */}
                <View style={styles.tenantInfo}>
                  <Text style={styles.tenantName} numberOfLines={1}>{tenant.fullName}</Text>
                  <View style={styles.tenantMeta}>
                    <MaterialIcons name="apartment" size={13} color="#94a3b8" />
                    <Text style={styles.tenantMetaText} numberOfLines={1}>
                      {tenant.roomCode ? `${tenant.roomCode} • ${tenant.buildingName}` : tenant.buildingName || 'Chưa có phòng'}
                    </Text>
                  </View>
                  {tenant.phoneNumber ? (
                    <View style={styles.tenantMeta}>
                      <MaterialIcons name="phone" size={13} color="#94a3b8" />
                      <Text style={styles.tenantMetaText}>{tenant.phoneNumber}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Arrow */}
                <MaterialIcons name="keyboard-arrow-right" size={22} color="#cbd5e1" />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('cu-dan/them')}>
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.addBtnText}>Thêm cư dân</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  scrollContent: { padding: theme.spacing.marginMobile, paddingBottom: 100 },

  // Search
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
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.onSurface, padding: 0 },

  // Banner
  banner: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 16,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 8 },
  bellCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  bannerTextContainer: { flex: 1, gap: 2 },
  bannerTitle: { ...theme.typography.bodyMd, fontWeight: 'bold', color: '#1e40af' },
  bannerSubtitle: { fontSize: 11, color: '#3b82f6' },

  // Tabs
  pillsScroll: { gap: 10, marginBottom: 20 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  pillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  pillText: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant },
  pillTextActive: { color: theme.colors.onPrimary, fontWeight: 'bold' },

  // States
  centered: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  loadingText: { ...theme.typography.bodyMd, color: theme.colors.onSurfaceVariant },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 8 },
  emptyStateTitle: { ...theme.typography.bodyLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  emptyStateSubtitle: { fontSize: 13, color: theme.colors.onSurfaceVariant, textAlign: 'center' },

  // List
  listContainer: { gap: 10 },
  countLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 4, fontWeight: 'bold' },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  tenantInfo: { flex: 1, gap: 3 },
  tenantName: { ...theme.typography.bodyLg, fontWeight: 'bold', color: theme.colors.onSurface },
  tenantMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tenantMetaText: { fontSize: 12, color: '#94a3b8', flex: 1 },

  // Bottom
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1, borderTopColor: theme.colors.outlineVariant,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl, paddingVertical: 14, gap: 8,
  },
  addBtnText: { ...theme.typography.bodyLg, color: theme.colors.onPrimary, fontWeight: 'bold' },
});

export default TenantsList;
