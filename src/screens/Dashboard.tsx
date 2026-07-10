import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import TopAppBar from '../components/TopAppBar';
import BentoStatCard from '../components/BentoStatCard';
import RevenueChart from '../components/RevenueChart';
import AlertItem from '../components/AlertItem';
import TransactionTable from '../components/TransactionTable';
import { dashboardStats, revenueHistory, emergencyAlerts, recentTransactions } from '../data/mockData';
import { theme } from '../theme';

export interface DashboardProps {
  readonly className?: string;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TopAppBar />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.subtitle}>TRANG QUẢN TRỊ</Text>
            <Text style={styles.title}>Tổng quan</Text>
          </View>
          <View style={styles.dateFilter}>
            <MaterialIcons name="date-range" size={16} color={theme.colors.onSurfaceVariant} />
            <Text style={styles.dateText}>Tháng 10, 2023</Text>
          </View>
        </View>

        {/* Bento Stats */}
        <View style={styles.section}>
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

        {/* Chart & Alerts */}
        <View style={styles.section}>
          <RevenueChart history={revenueHistory} />
        </View>

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

        {/* Recent Transactions */}
        <View style={styles.section}>
          <TransactionTable transactions={recentTransactions} />
        </View>
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
  dateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  dateText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    paddingHorizontal: theme.spacing.marginMobile,
    marginBottom: 20,
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
