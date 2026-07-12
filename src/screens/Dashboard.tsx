import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import BentoStatCard from '../components/BentoStatCard';
import RevenueChart from '../components/RevenueChart';
import AlertItem from '../components/AlertItem';
import TransactionTable from '../components/TransactionTable';
import { revenueHistory, emergencyAlerts, recentTransactions } from '../data/mockData';
import { theme } from '../theme';
import { doc, getDoc, getDocs, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Image } from 'expo-image';

export interface DashboardProps {
  readonly className?: string;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = React.useState<'tasks' | 'stats'>('tasks');
  const [adminName, setAdminName] = React.useState('Admin');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  // OPERATIONAL STATS STATES
  const [loadingStats, setLoadingStats] = React.useState(true);
  const [revenueThisMonth, setRevenueThisMonth] = React.useState('0M');
  const [roomOccupancyText, setRoomOccupancyText] = React.useState('0% công suất');
  const [roomOccupancyValue, setRoomOccupancyValue] = React.useState('0 / 0');
  const [roomOccupancyProgress, setRoomOccupancyProgress] = React.useState(0);
  const [requestCount, setRequestCount] = React.useState('0');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [recentTx, setRecentTx] = React.useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = React.useState<any[]>([]);
  const [dashboardAlerts, setDashboardAlerts] = React.useState<any[]>([]);

  // CURRENT MONTH
  const currentMonthStr = React.useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${mm}/${now.getFullYear()}`;
  }, []);

  React.useEffect(() => {
    if (isFocused) {
      loadAdminName();
      loadRealStats();
    }
  }, [isFocused]);

  const loadAdminName = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAdminName('Admin');
        setAvatarUrl(null);
        return;
      }
      const uid = currentUser.uid;
      const docRef = doc(db, 'admins', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) {
          setAdminName(data.name);
        }
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
        } else {
          setAvatarUrl(null);
        }
      } else {
        setAdminName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin');
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Error loading admin name on dashboard:', error);
    }
  };

  const loadRealStats = async () => {
    try {
      setLoadingStats(true);

      // 1. Calculate Occupancy from rooms collection
      const roomsSnap = await getDocs(collection(db, 'rooms'));
      const totalRooms = roomsSnap.size;
      let occupiedRooms = 0;
      roomsSnap.forEach((doc) => {
        if (doc.data().status === 'occupied') {
          occupiedRooms++;
        }
      });
      const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
      setRoomOccupancyValue(`${occupiedRooms} / ${totalRooms}`);
      setRoomOccupancyText(`${occupancyPercentage}% công suất lấp đầy`);
      setRoomOccupancyProgress(occupancyPercentage);

      // 2. Calculate Revenue this month from invoices
      const invoicesSnap = await getDocs(
        query(collection(db, 'invoices'), where('month', '==', currentMonthStr), where('status', '==', 'success'))
      );
      let totalRev = 0;
      invoicesSnap.forEach((doc) => {
        totalRev += Number(doc.data().amount) || 0;
      });
      // Convert to millions (M)
      const formattedRev = totalRev >= 1000000 
        ? `${(totalRev / 1000000).toFixed(1)}M`
        : `${(totalRev / 1000).toFixed(0)}K`;
      setRevenueThisMonth(totalRev === 0 ? '0 đ' : formattedRev);

      // 3. Calculate new requests & load pending support requests
      const reqsSnap = await getDocs(collection(db, 'supportRequests'));
      const allReqs = reqsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const activeReqs = allReqs.filter((r: any) => r.status === 'pending' || r.status === 'processing');
      
      activeReqs.sort((a: any, b: any) => {
        const t1 = a.createdAt?.seconds || 0;
        const t2 = b.createdAt?.seconds || 0;
        return t2 - t1;
      });
      setPendingTasks(activeReqs);
      setRequestCount(String(activeReqs.length).padStart(2, '0'));

      // 4. Calculate real MoM revenue for last 6 months
      const allInvoicesSnap = await getDocs(collection(db, 'invoices'));
      const last6MonthsList: string[] = [];
      const date = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        last6MonthsList.push(`${mm}/${yyyy}`);
      }

      const monthlyCollectedMap: Record<string, number> = {};
      last6MonthsList.forEach(m => {
        monthlyCollectedMap[m] = 0;
      });

      allInvoicesSnap.forEach((doc) => {
        const data = doc.data();
        const amt = Number(data.amount) || 0;
        const mStr = data.month || '';
        if (data.status === 'success' && monthlyCollectedMap[mStr] !== undefined) {
          monthlyCollectedMap[mStr] += amt;
        }
      });

      let maxMonthAmt = 0;
      last6MonthsList.forEach(m => {
        if (monthlyCollectedMap[m] > maxMonthAmt) {
          maxMonthAmt = monthlyCollectedMap[m];
        }
      });

      const formattedChart = last6MonthsList.map(m => {
        const amt = monthlyCollectedMap[m];
        const height = maxMonthAmt > 0 ? Math.round((amt / maxMonthAmt) * 100) : 0;
        return {
          month: m,
          amount: amt >= 1000000 
            ? `${(amt / 1000000).toFixed(1)}M` 
            : `${(amt / 1000).toFixed(0)}K`,
          height: Math.max(height, 8),
        };
      });
      setChartData(formattedChart);

      // 5. Query recent 5 transactions
      const recentInvoicesSnap = await getDocs(
        query(collection(db, 'invoices'), orderBy('createdAt', 'desc'), limit(5))
      );
      const mappedTx = recentInvoicesSnap.docs.map((doc) => {
        const data = doc.data();
        const amt = Number(data.amount) || 0;
        return {
          id: doc.id,
          roomCode: data.roomCode || '??',
          tenantName: data.tenantName || 'Cư dân',
          type: `Hóa đơn tháng ${data.month}`,
          amount: `+${amt.toLocaleString('vi-VN')} đ`,
          isExpense: false,
          status: data.status === 'success' ? 'success' : 'pending',
        };
      });
      setRecentTx(mappedTx);
      // 6. Calculate real-time emergency alerts
      const alertsList: any[] = [];

      // 6a. Unpaid Invoices
      const unpaidInvoicesSnap = await getDocs(
        query(collection(db, 'invoices'), where('status', '==', 'pending'), limit(3))
      );
      unpaidInvoicesSnap.forEach(d => {
        const data = d.data();
        const amt = Number(data.amount) || 0;
        alertsList.push({
          id: `inv_${d.id}`,
          type: 'error',
          title: `Phòng ${data.roomCode} quá hạn`,
          description: `Chưa thanh toán hóa đơn tháng ${data.month}. Số tiền: ${amt.toLocaleString('vi-VN')} đ`,
          icon: 'report',
          actionText: 'Xử lý ngay',
          targetRoute: 'Invoices'
        });
      });

      // 6b. Emergency Support Tickets
      const emergencyTickets = activeReqs.filter((r: any) => r.level === 'emergency');
      emergencyTickets.slice(0, 3).forEach((t: any) => {
        alertsList.push({
          id: `tkt_${t.id}`,
          type: 'warning',
          title: `Sự cố khẩn cấp phòng ${t.roomCode}`,
          description: t.title,
          icon: 'electrical_services',
          actionText: 'Điều thợ đến',
          targetRoute: 'cu-dan/phan-anh'
        });
      });

      // 6c. Approaching Contract End (expiring in next 30 days)
      try {
        const contractsSnap = await getDocs(query(collection(db, 'contracts'), where('status', '==', 'active'), limit(3)));
        const today = new Date();
        contractsSnap.forEach(d => {
          const data = d.data();
          if (data.endDate) {
            const endParts = data.endDate.split('/'); // DD/MM/YYYY
            if (endParts.length === 3) {
              const endD = new Date(Number(endParts[2]), Number(endParts[1]) - 1, Number(endParts[0]));
              const diffTime = endD.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays >= 0 && diffDays <= 30) {
                alertsList.push({
                  id: `ctr_${d.id}`,
                  type: 'info',
                  title: `Hợp đồng sắp hết hạn phòng ${data.roomCode}`,
                  description: `Hết hạn sau ${diffDays} ngày (${data.endDate}). Vui lòng liên hệ gia hạn.`,
                  icon: 'water_drop',
                  actionText: 'Xem chi tiết',
                  targetRoute: 'hop-dong'
                });
              }
            }
          }
        });
      } catch (err) {
        console.error('Error fetching contracts for alerts:', err);
      }

      setDashboardAlerts(alertsList);

    } catch (err) {
      console.error('Error loading operational stats on dashboard:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Greeting Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={28} color="#a1a1aa" />
            )}
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{adminName}</Text>
          </View>
        </View>
        <Pressable 
          style={styles.notificationBtn} 
          onPress={() => navigation.navigate('thong-bao')}
          accessibilityRole="button" 
          accessibilityLabel="Notifications"
        >
          <MaterialIcons name="notifications" size={24} color={theme.colors.primary} />
          {dashboardAlerts.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{dashboardAlerts.length}</Text>
            </View>
          )}
        </Pressable>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section: Quản lý */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quản lý</Text>
          <View style={styles.grid}>
            {/* Button 1: Điện nước */}
            <Pressable 
              style={styles.gridItem} 
              onPress={() => navigation.navigate('dien-nuoc')}
              accessibilityRole="button"
              accessibilityLabel="Điện nước"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#fef3c7' }]}>
                <MaterialIcons name="bolt" size={24} color="#d97706" />
              </View>
              <Text style={styles.gridItemText}>Điện nước</Text>
            </Pressable>

            {/* Button 2: Hoá đơn */}
            <Pressable 
              style={styles.gridItem} 
              onPress={() => navigation.navigate('Invoices')}
              accessibilityRole="button"
              accessibilityLabel="Hoá đơn"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
                <MaterialIcons name="description" size={24} color="#2563eb" />
              </View>
              <Text style={styles.gridItemText}>Hoá đơn</Text>
            </Pressable>

            {/* Button 3: Thống kê */}
            <Pressable 
              style={styles.gridItem} 
              onPress={() => navigation.navigate('thong-ke')}
              accessibilityRole="button"
              accessibilityLabel="Thống kê"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
                <MaterialIcons name="analytics" size={24} color="#059669" />
              </View>
              <Text style={styles.gridItemText}>Thống kê</Text>
            </Pressable>

            {/* Button 4: Hợp đồng */}
            <Pressable 
              style={styles.gridItem} 
              onPress={() => navigation.navigate('hop-dong')}
              accessibilityRole="button"
              accessibilityLabel="Hợp đồng"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#f3e8fd' }]}>
                <MaterialIcons name="description" size={24} color="#7c3aed" />
              </View>
              <Text style={styles.gridItemText}>Hợp đồng</Text>
            </Pressable>

            {/* Button 5: Dịch vụ */}
            <Pressable 
              style={styles.gridItem} 
              onPress={() => navigation.navigate('cau-hinh-gia')}
              accessibilityRole="button"
              accessibilityLabel="Dịch vụ"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#e0f2f1' }]}>
                <MaterialIcons name="payments" size={24} color="#00796b" />
              </View>
              <Text style={styles.gridItemText}>Dịch vụ</Text>
            </Pressable>

            {/* Button 6: Thiết bị */}
            <Pressable 
              style={styles.gridItem} 
              onPress={() => navigation.navigate('thiet-bi')}
              accessibilityRole="button"
              accessibilityLabel="Thiết bị"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#f3f4f6' }]}>
                <MaterialIcons name="router" size={24} color="#4b5563" />
              </View>
              <Text style={styles.gridItemText}>Thiết bị</Text>
            </Pressable>
          </View>
        </View>

        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <Pressable 
            style={[styles.segmentButton, activeTab === 'tasks' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('tasks')}
            accessibilityRole="button"
            accessibilityLabel="Công việc"
          >
            <Text style={[styles.segmentText, activeTab === 'tasks' && styles.segmentTextActive]}>
              Công việc
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.segmentButton, activeTab === 'stats' && styles.segmentButtonActive]}
            onPress={() => setActiveTab('stats')}
            accessibilityRole="button"
            accessibilityLabel="Số liệu & Thống kê"
          >
            <Text style={[styles.segmentText, activeTab === 'stats' && styles.segmentTextActive]}>
              Số liệu & Thống kê
            </Text>
          </Pressable>
        </View>

        {/* Dynamic Tab Content */}
        {activeTab === 'tasks' ? (
          <>
            {/* Emergency Alerts */}
            <View style={styles.section}>
              <View style={styles.alertsCard}>
                <View style={styles.alertsHeader}>
                  <Text style={styles.alertsTitle}>Thông báo khẩn</Text>
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>ƯU TIÊN CAO</Text>
                  </View>
                </View>
                <View style={styles.alertList}>
                  {dashboardAlerts.length === 0 ? (
                    <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: '#94a3b8' }}>Hiện không có cảnh báo nào tồn đọng</Text>
                    </View>
                  ) : (
                    dashboardAlerts.map((alert) => (
                      <AlertItem 
                        key={alert.id} 
                        alert={alert} 
                        onPress={() => {
                          if (alert.targetRoute) {
                            navigation.navigate(alert.targetRoute);
                          }
                        }}
                      />
                    ))
                  )}
                </View>
                <Pressable 
                  style={styles.allAlertsBtn} 
                  onPress={() => navigation.navigate('cu-dan/phan-anh')}
                  accessibilityRole="button" 
                  accessibilityLabel="View all alerts"
                >
                  <Text style={styles.allAlertsBtnText}>Xem tất cả thông báo</Text>
                </Pressable>
              </View>
            </View>

            {/* To-Do Section */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.sectionTitle}>Công việc cần làm</Text>
                <Pressable onPress={() => navigation.navigate('cu-dan/phan-anh')}>
                  <Text style={{ fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' }}>Xem tất cả</Text>
                </Pressable>
              </View>
              
              {pendingTasks.length === 0 ? (
                <View style={styles.todoCard}>
                  <View style={styles.todoIconContainer}>
                    <MaterialIcons name="check-circle" size={32} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.todoText}>Tuyệt vời! Không có công việc nào tồn đọng</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {pendingTasks.slice(0, 3).map((task) => (
                    <Pressable 
                      key={task.id} 
                      style={styles.todoCardItem}
                      onPress={() => navigation.navigate('cu-dan/phan-anh')}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={[
                          styles.taskLevelBadge, 
                          task.level === 'emergency' ? { backgroundColor: '#fee2e2' } : { backgroundColor: '#f1f5f9' }
                        ]}>
                          <Text style={[
                            styles.taskLevelText,
                            task.level === 'emergency' ? { color: '#ef4444' } : { color: '#64748b' }
                          ]}>
                            {task.level === 'emergency' ? 'KHẨN CẤP' : 'THÔNG THƯỜNG'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 12, color: '#94a3b8' }}>
                          Phòng {task.roomCode}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: theme.colors.onSurface, marginTop: 6 }}>
                        {task.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, marginTop: 4 }} numberOfLines={2}>
                        {task.description}
                      </Text>
                    </Pressable>
                  ))}
                  {pendingTasks.length > 3 && (
                    <Pressable 
                      style={styles.moreTasksBtn}
                      onPress={() => navigation.navigate('cu-dan/phan-anh')}
                    >
                      <Text style={styles.moreTasksBtnText}>+ Xem thêm {pendingTasks.length - 3} công việc</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            {/* Bento Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chỉ số vận hành</Text>
              {loadingStats ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Đang tính toán chỉ số...</Text>
                </View>
              ) : (
                <View style={styles.statGrid}>
                  <BentoStatCard
                    label="Tổng doanh thu tháng này"
                    value={revenueThisMonth}
                    change="Đã thu từ hóa đơn thực tế"
                    icon="payments"
                  />
                  <BentoStatCard
                    label="Tình trạng phòng"
                    value={roomOccupancyValue}
                    icon="bed"
                    progress={roomOccupancyProgress}
                    progressText={roomOccupancyText}
                  />
                  <BentoStatCard
                    label="Yêu cầu mới"
                    value={requestCount}
                    change="Yêu cầu hỗ trợ chưa xử lý"
                    icon="message"
                    isWarning={Number(requestCount) > 0}
                  />
                </View>
              )}
            </View>

            {/* Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Biểu đồ doanh thu</Text>
              {chartData.length > 0 ? (
                <RevenueChart history={chartData} />
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Chưa có dữ liệu biểu đồ</Text>
                </View>
              )}
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
              {recentTx.length > 0 ? (
                <TransactionTable transactions={recentTx} />
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <Pressable 
        style={styles.fab}
        onPress={() => navigation.navigate('hop-dong/moi')}
        accessibilityRole="button"
        accessibilityLabel="Create contract"
      >
        <MaterialIcons name="add" size={28} color={theme.colors.onPrimary} />
      </Pressable>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e4e4e7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  welcomeTextContainer: {
    flexDirection: 'column',
  },
  welcomeText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  userName: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ff4d4d',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceContainer,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: theme.spacing.marginMobile,
    marginBottom: 20,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    width: '30%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: [{
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
      color: 'rgba(0, 0, 0, 0.02)'
    }],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridItemText: {
    ...theme.typography.labelMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.xl,
    padding: 4,
    marginHorizontal: theme.spacing.marginMobile,
    marginVertical: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
    boxShadow: [{
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
      color: 'rgba(0, 0, 0, 0.05)'
    }],
  },
  segmentText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statGrid: {
    gap: 16,
  },
  alertsCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  alertBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  alertBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: theme.colors.onSecondary,
  },
  alertList: {
    gap: 12,
  },
  allAlertsBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 12,
    borderRadius: theme.borderRadius.lg,
  },
  allAlertsBtnText: {
    ...theme.typography.labelMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  todoCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 24,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: [{
      offsetX: 0,
      offsetY: 2,
      blurRadius: 4,
      color: 'rgba(0, 0, 0, 0.02)'
    }],
  },
  todoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  todoText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: [{
      offsetX: 0,
      offsetY: 4,
      blurRadius: 6,
      color: 'rgba(0, 0, 0, 0.3)'
    }],
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  emptyCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 24,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  todoCardItem: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  taskLevelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.default,
  },
  taskLevelText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  moreTasksBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surfaceContainer,
  },
  moreTasksBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    color: theme.colors.onSurfaceVariant,
  },
});

export default Dashboard;
