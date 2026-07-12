import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { RevenueChart } from '../components/RevenueChart';

interface BuildingStat {
  name: string;
  revenue: number;
  unpaid: number;
  percentage: number;
}

export const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Overall metrics
  const [totalCollected, setTotalCollected] = React.useState(0);
  const [totalUncollected, setTotalUncollected] = React.useState(0);
  const [occupancyRate, setOccupancyRate] = React.useState(0);
  const [totalRooms, setTotalRooms] = React.useState(0);
  const [occupiedRooms, setOccupiedRooms] = React.useState(0);
  const [totalTenants, setTotalTenants] = React.useState(0);
  const [resolvedIssues, setResolvedIssues] = React.useState(0);
  const [pendingIssues, setPendingIssues] = React.useState(0);

  // Lists & Chart data
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [buildingStats, setBuildingStats] = React.useState<BuildingStat[]>([]);

  // Generate last 6 months list
  const last6Months = React.useMemo(() => {
    const list: string[] = [];
    const date = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      list.push(`${mm}/${yyyy}`);
    }
    return list;
  }, []);

  React.useEffect(() => {
    if (isFocused) {
      fetchStatistics();
    }
  }, [isFocused]);

  const fetchStatistics = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);

      // 1. Fetch Invoices for Revenue
      const invSnap = await getDocs(collection(db, 'invoices'));
      let sumCollected = 0;
      let sumUncollected = 0;

      // Temporary maps to group invoice details
      const monthlyCollectedMap: Record<string, number> = {};
      const buildingCollectedMap: Record<string, number> = {};
      const buildingUncollectedMap: Record<string, number> = {};

      // Initialize monthly collected map for the last 6 months
      last6Months.forEach(m => {
        monthlyCollectedMap[m] = 0;
      });

      invSnap.forEach((doc) => {
        const data = doc.data();
        const amt = Number(data.amount) || 0;
        const bName = data.buildingName || 'Khác';
        const mStr = data.month || '';

        if (data.status === 'success') {
          sumCollected += amt;
          if (monthlyCollectedMap[mStr] !== undefined) {
            monthlyCollectedMap[mStr] += amt;
          }
          buildingCollectedMap[bName] = (buildingCollectedMap[bName] || 0) + amt;
        } else if (data.status === 'pending') {
          sumUncollected += amt;
          buildingUncollectedMap[bName] = (buildingUncollectedMap[bName] || 0) + amt;
        }
      });

      setTotalCollected(sumCollected);
      setTotalUncollected(sumUncollected);

      // 2. Fetch Rooms for Occupancy
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      const tRooms = roomsSnap.size;
      let oRooms = 0;
      roomsSnap.forEach((doc) => {
        if (doc.data().status === 'occupied') {
          oRooms++;
        }
      });
      setTotalRooms(tRooms);
      setOccupiedRooms(oRooms);
      setOccupancyRate(tRooms > 0 ? Math.round((oRooms / tRooms) * 100) : 0);

      // 3. Fetch Active Tenants
      const tenantsSnap = await getDocs(
        query(collection(db, 'tenants'), where('status', '==', 'active'))
      );
      setTotalTenants(tenantsSnap.size);

      // 4. Fetch Support Requests status
      const supportSnap = await getDocs(collection(db, 'supportRequests'));
      let resolved = 0;
      let pending = 0;
      supportSnap.forEach((doc) => {
        const stat = doc.data().status || 'pending';
        if (stat === 'resolved' || stat === 'done' || stat === 'success') {
          resolved++;
        } else {
          pending++;
        }
      });
      setResolvedIssues(resolved);
      setPendingIssues(pending);

      // 5. Build Chart Data
      let maxMonthAmt = 0;
      last6Months.forEach(m => {
        if (monthlyCollectedMap[m] > maxMonthAmt) {
          maxMonthAmt = monthlyCollectedMap[m];
        }
      });

      const formattedChart = last6Months.map(m => {
        const amt = monthlyCollectedMap[m];
        // Calculate height percentage (scale to max 100)
        const height = maxMonthAmt > 0 ? Math.round((amt / maxMonthAmt) * 100) : 0;
        return {
          month: m,
          amount: amt >= 1000000 
            ? `${(amt / 1000000).toFixed(1)}M` 
            : `${(amt / 1000).toFixed(0)}K`,
          height: Math.max(height, 8), // Min height so there is always a tiny bar visible
        };
      });
      setChartData(formattedChart);

      // 6. Build Building Stats
      // Fetch actual buildings list to ensure all buildings are covered
      const buildingsSnap = await getDocs(collection(db, 'buildings'));
      const bStatsList: BuildingStat[] = [];
      buildingsSnap.forEach((doc) => {
        const bName = doc.data().name;
        const rev = buildingCollectedMap[bName] || 0;
        const unpaid = buildingUncollectedMap[bName] || 0;
        bStatsList.push({
          name: bName,
          revenue: rev,
          unpaid: unpaid,
          percentage: sumCollected > 0 ? Math.round((rev / sumCollected) * 100) : 0
        });
      });

      // Add 'Khác' group if there is revenue under it
      if (buildingCollectedMap['Khác'] || buildingUncollectedMap['Khác']) {
        const rev = buildingCollectedMap['Khác'] || 0;
        const unpaid = buildingUncollectedMap['Khác'] || 0;
        bStatsList.push({
          name: 'Khác',
          revenue: rev,
          unpaid: unpaid,
          percentage: sumCollected > 0 ? Math.round((rev / sumCollected) * 100) : 0
        });
      }

      bStatsList.sort((a, b) => b.revenue - a.revenue);
      setBuildingStats(bStatsList);

    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải số liệu thống kê...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Số liệu & Thống kê</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchStatistics(true)} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Bento Metrics Grid */}
        <View style={styles.bentoGrid}>
          {/* Card 1: Revenue Collected */}
          <View style={[styles.bentoCard, { flex: 1, minWidth: '45%', backgroundColor: '#ecfdf5' }]}>
            <View style={styles.bentoIconContainer}>
              <MaterialIcons name="trending-up" size={22} color="#059669" />
            </View>
            <Text style={styles.bentoLabel}>Đã thực thu</Text>
            <Text style={[styles.bentoValue, { color: '#047857' }]}>
              {totalCollected.toLocaleString('vi-VN')} đ
            </Text>
          </View>

          {/* Card 2: Revenue Pending */}
          <View style={[styles.bentoCard, { flex: 1, minWidth: '45%', backgroundColor: '#fef2f2' }]}>
            <View style={styles.bentoIconContainer}>
              <MaterialIcons name="hourglass-empty" size={22} color="#dc2626" />
            </View>
            <Text style={styles.bentoLabel}>Doanh thu chờ</Text>
            <Text style={[styles.bentoValue, { color: '#b91c1c' }]}>
              {totalUncollected.toLocaleString('vi-VN')} đ
            </Text>
          </View>
        </View>

        <View style={styles.bentoGrid}>
          {/* Card 3: Occupancy */}
          <View style={[styles.bentoCard, { flex: 1, minWidth: '45%', backgroundColor: '#eff6ff' }]}>
            <View style={styles.bentoIconContainer}>
              <MaterialIcons name="vpn-key" size={22} color="#1d4ed8" />
            </View>
            <Text style={styles.bentoLabel}>Tỷ lệ lấp đầy</Text>
            <Text style={[styles.bentoValue, { color: '#1e40af' }]}>{occupancyRate}%</Text>
            <Text style={styles.bentoSub}>{occupiedRooms} / {totalRooms} phòng trống</Text>
          </View>

          {/* Card 4: Tenants */}
          <View style={[styles.bentoCard, { flex: 1, minWidth: '45%', backgroundColor: '#fdf4ff' }]}>
            <View style={styles.bentoIconContainer}>
              <MaterialIcons name="people" size={22} color="#a21caf" />
            </View>
            <Text style={styles.bentoLabel}>Tổng số cư dân</Text>
            <Text style={[styles.bentoValue, { color: '#86198f' }]}>{totalTenants}</Text>
            <Text style={styles.bentoSub}>Đang hoạt động</Text>
          </View>
        </View>

        {/* Chart Card */}
        {chartData.length > 0 && (
          <View style={styles.cardWrapper}>
            <RevenueChart history={chartData} />
          </View>
        )}

        {/* Building Breakdown Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Doanh thu theo tòa nhà</Text>
          {buildingStats.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có số liệu tòa nhà</Text>
          ) : (
            buildingStats.map((stat) => (
              <View key={stat.name} style={styles.buildingRow}>
                <View style={styles.buildingInfo}>
                  <Text style={styles.buildingName}>{stat.name}</Text>
                  <Text style={styles.buildingValue}>
                    {stat.revenue.toLocaleString('vi-VN')} đ
                  </Text>
                </View>
                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${stat.percentage}%` }]} />
                </View>
                <View style={styles.buildingSubRow}>
                  <Text style={styles.buildingPercentage}>{stat.percentage}% đóng góp</Text>
                  {stat.unpaid > 0 && (
                    <Text style={styles.buildingUnpaid}>
                      Chờ thu: {stat.unpaid.toLocaleString('vi-VN')} đ
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Support requests analytics */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Phản hồi & Sự cố</Text>
          <View style={styles.issuesMetrics}>
            <View style={styles.issueBox}>
              <Text style={[styles.issueVal, { color: '#059669' }]}>{resolvedIssues}</Text>
              <Text style={styles.issueLbl}>Đã xử lý</Text>
            </View>
            <View style={styles.issueDivider} />
            <View style={styles.issueBox}>
              <Text style={[styles.issueVal, { color: '#d97706' }]}>{pendingIssues}</Text>
              <Text style={styles.issueLbl}>Đang chờ giải quyết</Text>
            </View>
          </View>
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
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
  },
  bentoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard: {
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bentoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bentoLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  bentoValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bentoSub: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  cardWrapper: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    paddingVertical: 12,
  },
  buildingRow: {
    marginBottom: 16,
    gap: 6,
  },
  buildingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
    textTransform: 'capitalize',
  },
  buildingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  buildingSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingPercentage: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  buildingUnpaid: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '500',
  },
  issuesMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  issueBox: {
    alignItems: 'center',
    flex: 1,
  },
  issueVal: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  issueLbl: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  issueDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.outlineVariant,
  },
});

export default StatisticsScreen;
