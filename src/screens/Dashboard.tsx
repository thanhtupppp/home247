import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import BentoStatCard from '../components/BentoStatCard';
import RevenueChart from '../components/RevenueChart';
import AlertItem from '../components/AlertItem';
import TransactionTable from '../components/TransactionTable';
import { dashboardStats, revenueHistory, emergencyAlerts, recentTransactions } from '../data/mockData';
import { theme } from '../theme';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface DashboardProps {
  readonly className?: string;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [activeTab, setActiveTab] = React.useState<'tasks' | 'stats'>('tasks');
  const [adminName, setAdminName] = React.useState(auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Admin');

  React.useEffect(() => {
    if (isFocused) {
      loadAdminName();
    }
  }, [isFocused]);

  const loadAdminName = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setAdminName('Admin');
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
      } else {
        setAdminName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Admin');
      }
    } catch (error) {
      console.error('Error loading admin name on dashboard:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Greeting Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <MaterialIcons name="person" size={28} color="#a1a1aa" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{adminName}</Text>
          </View>
        </View>
        <Pressable style={styles.notificationBtn} accessibilityRole="button" accessibilityLabel="Notifications">
          <MaterialIcons name="notifications" size={24} color={theme.colors.primary} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>1</Text>
          </View>
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
                <MaterialIcons name="group" size={24} color="#7c3aed" />
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
                  {emergencyAlerts.map((alert) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))}
                </View>
                <Pressable style={styles.allAlertsBtn} accessibilityRole="button" accessibilityLabel="View all alerts">
                  <Text style={styles.allAlertsBtnText}>Xem tất cả thông báo</Text>
                </Pressable>
              </View>
            </View>

            {/* To-Do Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Công việc cần làm</Text>
              <View style={styles.todoCard}>
                <View style={styles.todoIconContainer}>
                  <MaterialIcons name="check-circle" size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.todoText}>Không có công việc nào cần làm</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Bento Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chỉ số vận hành</Text>
              <View style={styles.statGrid}>
                {dashboardStats.map((stat) => (
                  <BentoStatCard
                    key={stat.id}
                    label={stat.label}
                    value={stat.value}
                    change={stat.change}
                    icon={stat.icon}
                    isWarning={stat.isWarning}
                    progress={stat.progress}
                    progressText={stat.progressText}
                  />
                ))}
              </View>
            </View>

            {/* Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Biểu đồ doanh thu</Text>
              <RevenueChart history={revenueHistory} />
            </View>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
              <TransactionTable transactions={recentTransactions} />
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
});

export default Dashboard;
