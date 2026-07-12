import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const TenantsManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [loading, setLoading] = React.useState(false);
  const [pendingTenants, setPendingTenants] = React.useState(0);
  const [pendingFeedback, setPendingFeedback] = React.useState(0);

  React.useEffect(() => {
    if (isFocused) {
      fetchApprovalCounts();
    }
  }, [isFocused]);

  const fetchApprovalCounts = async () => {
    try {
      setLoading(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      
      // 1. Fetch pending tenants
      const tenantsSnap = await getDocs(
        query(collection(db, 'tenants'), where('ownerId', '==', uid), where('status', '==', 'pending'))
      );
      setPendingTenants(tenantsSnap.size);

      // 2. Fetch pending support requests / feedback
      const supportSnap = await getDocs(
        query(collection(db, 'supportRequests'), where('ownerId', '==', uid), where('status', '==', 'pending'))
      );
      setPendingFeedback(supportSnap.size);

    } catch (err) {
      console.error('Error fetching approvals count:', err);
    } finally {
      setLoading(false);
    }
  };

  const approvals = [
    { id: '1', title: 'Cư dân chờ duyệt', count: pendingTenants, icon: 'people', iconColor: '#f97316', bgColor: '#fff7ed', route: 'cu-dan/danh-sach' },
    { id: '2', title: 'Phương tiện chờ duyệt', count: 0, icon: 'directions-car', iconColor: '#3b82f6', bgColor: '#eff6ff', route: null },
    { id: '3', title: 'Tạm trú chờ duyệt', count: 0, icon: 'description', iconColor: '#eab308', bgColor: '#fefce8', route: null },
    { id: '4', title: 'Phản ánh chờ duyệt', count: pendingFeedback, icon: 'forum', iconColor: '#ef4444', bgColor: '#fef2f2', route: 'cu-dan/phan-anh' },
  ];

  const menus = [
    { id: '1', title: 'Danh sách cư dân', icon: 'people', route: 'cu-dan/danh-sach' },
    { id: '2', title: 'Danh sách phương tiện', icon: 'directions-car', route: 'cu-dan/phuong-tien' },
    { id: '3', title: 'Danh sách tạm trú', icon: 'description', route: 'cu-dan/tam-tru' },
    { id: '4', title: 'Danh sách phản ánh', icon: 'forum', route: 'cu-dan/phan-anh' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Approvals Title */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Công việc cần duyệt</Text>
          {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
        </View>

        {/* 2x2 Grid of Approval Cards */}
        <View style={styles.grid}>
          {approvals.map((item) => (
            <Pressable 
              key={item.id} 
              style={styles.gridCard}
              onPress={() => {
                if (item.route) {
                  navigation.navigate(item.route);
                }
              }}
            >
              <View style={styles.gridCardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                  <MaterialIcons name={item.icon as any} size={22} color={item.iconColor} />
                </View>
                <Text style={styles.bigNumber}>{item.count}</Text>
              </View>
              <Text style={styles.gridCardLabel} numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Resident Info Section Title */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Thông tin cư dân</Text>

        {/* Vertical menu list */}
        <View style={styles.menuList}>
          {menus.map((menu) => (
            <Pressable 
              key={menu.id} 
              style={styles.menuItemCard}
              onPress={() => {
                if (menu.route === 'cu-dan/danh-sach') {
                  navigation.navigate('cu-dan/danh-sach');
                } else if (menu.route === 'cu-dan/phan-anh') {
                  navigation.navigate('cu-dan/phan-anh');
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconCircle}>
                  <MaterialIcons name={menu.icon as any} size={20} color="#475569" />
                </View>
                <Text style={styles.menuItemTitle}>{menu.title}</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>
          ))}
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
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    gap: 12,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  gridCardLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  menuList: {
    gap: 12,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
});

export default TenantsManagement;
