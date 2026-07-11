import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const TenantsManagement: React.FC = () => {
  const navigation = useNavigation<any>();

  const approvals = [
    { id: '1', title: 'Cư dân chờ duyệt', count: 0, icon: 'people', iconColor: '#f97316', bgColor: '#fff7ed' },
    { id: '2', title: 'Phương tiện chờ duyệt', count: 0, icon: 'directions-car', iconColor: '#3b82f6', bgColor: '#eff6ff' },
    { id: '3', title: 'Tạm trú chờ duyệt', count: 0, icon: 'description', iconColor: '#eab308', bgColor: '#fefce8' },
    { id: '4', title: 'Phản ánh chờ duyệt', count: 0, icon: 'forum', iconColor: '#ef4444', bgColor: '#fef2f2' },
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
        <Text style={styles.sectionTitle}>Công việc cần duyệt</Text>

        {/* 2x2 Grid of Approval Cards */}
        <View style={styles.grid}>
          {approvals.map((item) => (
            <Pressable key={item.id} style={styles.gridCard}>
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
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  gridCardLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  menuList: {
    gap: 12,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
});

export default TenantsManagement;
