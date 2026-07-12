import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface SystemNotification {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  targetRoute: string;
  icon: string;
}

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [notifications, setNotifications] = React.useState<SystemNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    if (isFocused) {
      loadNotifications();
    }
  }, [isFocused]);

  const loadNotifications = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const list: SystemNotification[] = [];

      // 1. Unpaid Invoices
      const unpaidSnap = await getDocs(
        query(collection(db, 'invoices'), where('status', '==', 'pending'))
      );
      unpaidSnap.forEach(d => {
        const data = d.data();
        const amt = Number(data.amount) || 0;
        list.push({
          id: `inv_${d.id}`,
          type: 'error',
          title: `Hóa đơn trễ hạn - Phòng ${data.roomCode}`,
          description: `Khách thuê ${data.tenantName} chưa thanh toán hóa đơn tháng ${data.month}. Số tiền: ${amt.toLocaleString('vi-VN')} đ`,
          timestamp: 'Cần thu tiền',
          targetRoute: 'Invoices',
          icon: 'report-problem'
        });
      });

      // 2. Pending Support Tickets (Emergency & Normal)
      const supportSnap = await getDocs(
        query(collection(db, 'supportRequests'), where('status', '==', 'pending'))
      );
      supportSnap.forEach(d => {
        const data = d.data();
        list.push({
          id: `support_${d.id}`,
          type: data.level === 'emergency' ? 'warning' : 'info',
          title: `${data.level === 'emergency' ? '🚨 Khẩn cấp' : '💬 Phản hồi'} - Phòng ${data.roomCode}`,
          description: `Nội dung: ${data.title}. Chi tiết: ${data.description}`,
          timestamp: data.level === 'emergency' ? 'Ưu tiên cao' : 'Bình thường',
          targetRoute: 'cu-dan/phan-anh',
          icon: data.level === 'emergency' ? 'electrical-services' : 'chat-bubble-outline'
        });
      });

      // 3. Expiring Contracts
      const contractsSnap = await getDocs(
        query(collection(db, 'contracts'), where('status', '==', 'active'))
      );
      const today = new Date();
      contractsSnap.forEach(d => {
        const data = d.data();
        if (data.endDate) {
          const endParts = data.endDate.split('/');
          if (endParts.length === 3) {
            const endD = new Date(Number(endParts[2]), Number(endParts[1]) - 1, Number(endParts[0]));
            const diffTime = endD.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays <= 30) {
              list.push({
                id: `ctr_${d.id}`,
                type: 'info',
                title: `Hợp đồng sắp hết hạn - Phòng ${data.roomCode}`,
                description: `Cư dân ${data.tenantName} hết hạn sau ${diffDays} ngày nữa (${data.endDate}).`,
                timestamp: 'Cần gia hạn',
                targetRoute: 'hop-dong',
                icon: 'lock-clock'
              });
            }
          }
        }
      });

      setNotifications(list);
    } catch (err) {
      console.error('Error loading notification list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getAlertColors = (type: string) => {
    switch (type) {
      case 'error':
        return { bg: '#fee2e2', border: '#ef4444', icon: '#ef4444', text: '#991b1b' };
      case 'warning':
        return { bg: '#fff7ed', border: '#f97316', icon: '#f97316', text: '#9a3412' };
      default:
        return { bg: '#eff6ff', border: '#3b82f6', icon: '#3b82f6', text: '#1e40af' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thông báo hệ thống</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadNotifications(true)} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>Hộp thư thông báo trống</Text>
            <Text style={styles.emptySubtitle}>Tất cả các công việc vận hành, thanh toán và sự cố của tòa nhà đã được xử lý xong.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((item) => {
              const colors = getAlertColors(item.type);
              return (
                <Pressable
                  key={item.id}
                  style={[styles.notificationCard, { borderLeftColor: colors.border }]}
                  onPress={() => {
                    if (item.targetRoute) {
                      navigation.navigate(item.targetRoute);
                    }
                  }}
                >
                  <View style={[styles.iconBox, { backgroundColor: colors.bg }]}>
                    <MaterialIcons name={item.icon as any} size={22} color={colors.icon} />
                  </View>
                  <View style={styles.content}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                      <View style={[styles.timeBadge, { backgroundColor: colors.bg }]}>
                        <Text style={[styles.timeBadgeText, { color: colors.icon }]}>{item.timestamp}</Text>
                      </View>
                    </View>
                    <Text style={styles.description}>{item.description}</Text>
                    <View style={styles.actionRow}>
                      <Text style={[styles.actionText, { color: colors.icon }]}>Chạm để xử lý</Text>
                      <MaterialIcons name="arrow-forward" size={14} color={colors.icon} />
                    </View>
                  </View>
                </Pressable>
              );
            })}
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
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderLeftWidth: 4,
    flexDirection: 'row',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.default,
  },
  timeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  actionText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
