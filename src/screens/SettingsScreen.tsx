import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showBottomSheet, setShowBottomSheet] = React.useState(false);

  const infoGrid = [
    { id: '1', label: 'Số điện thoại', value: '+8439643137', icon: 'phone' },
    { id: '2', label: 'CCCD', value: 'Chưa cập nhật', icon: 'badge' },
    { id: '3', label: 'Ngày sinh', value: 'Chưa cập nhật', icon: 'calendar-today' },
    { id: '4', label: 'Thành phố', value: 'Chưa cập nhật', icon: 'place' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={54} color="#cbd5e1" />
            </View>
            <Pressable style={styles.cameraOverlay} onPress={() => setShowBottomSheet(true)}>
              <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
            </Pressable>
          </View>
          <Text style={styles.username}>tu</Text>
          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={16} color="#64748b" />
            <Text style={styles.phoneText}>+8439643137</Text>
          </View>
        </View>

        {/* Info Grid (2x2) */}
        <View style={styles.grid}>
          {infoGrid.map((item) => (
            <View key={item.id} style={styles.gridCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name={item.icon as any} size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <Text style={styles.gridValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Edit Info Button */}
        <Pressable 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('cai-dat/chinh-sua')}
        >
          <MaterialIcons name="edit" size={20} color={theme.colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.editBtnText}>Chỉnh sửa thông tin</Text>
        </Pressable>

        {/* Bank Accounts Section */}
        <View style={styles.bankSection}>
          <View style={styles.bankHeader}>
            <Text style={styles.bankTitle}>Tài khoản ngân hàng</Text>
            <Pressable onPress={() => navigation.navigate('cai-dat/ngan-hang')}>
              <Text style={styles.addBankText}>Thêm</Text>
            </Pressable>
          </View>
          <Text style={styles.bankEmptyText}>Chưa có tài khoản ngân hàng.</Text>
        </View>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowBottomSheet(false)}>
          <View style={styles.modalContent}>
            <View style={styles.sheetHandle} />
            
            <Pressable style={styles.sheetItem} onPress={() => setShowBottomSheet(false)}>
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetIconCircle}>
                  <MaterialIcons name="photo-camera" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.sheetItemTitle}>Chụp ảnh mới</Text>
                  <Text style={styles.sheetItemSubtitle}>Dùng camera để cập nhật nhanh</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={() => setShowBottomSheet(false)}>
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetIconCircle}>
                  <MaterialIcons name="image" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.sheetItemTitle}>Chọn từ thư viện</Text>
                  <Text style={styles.sheetItemSubtitle}>Tải ảnh sẵn có lên máy chủ</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={() => setShowBottomSheet(false)}>
              <View style={styles.sheetItemLeft}>
                <View style={[styles.sheetIconCircle, { backgroundColor: '#fef2f2' }]}>
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </View>
                <View>
                  <Text style={[styles.sheetItemTitle, { color: '#ef4444' }]}>Gỡ ảnh đại diện</Text>
                  <Text style={styles.sheetItemSubtitle}>Quay về ảnh mặc định</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 16,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    fontSize: 22,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  username: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontSize: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
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
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  gridValue: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  editBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.primaryContainer,
    fontWeight: 'bold',
  },
  bankSection: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 14,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  addBankText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bankEmptyText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: theme.borderRadius.xl * 2,
    borderTopRightRadius: theme.borderRadius.xl * 2,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: 40,
    paddingTop: 10,
    gap: 16,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  sheetItemSubtitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});

export default SettingsScreen;
