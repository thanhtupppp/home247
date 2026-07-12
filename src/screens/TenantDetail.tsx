import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  Image, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface TenantData {
  fullName: string;
  phoneNumber: string;
  email: string;
  dob: string;
  cccd: string;
  cccdFront: string;
  cccdBack: string;
  gender: string;
  buildingId: string;
  buildingName: string;
  roomId: string;
  roomCode: string;
  moveInDate: string;
  notes: string;
  province: string;
  ward: string;
  detailAddress: string;
  sendInvite: boolean;
  receiveNotif: boolean;
  primaryContact: boolean;
}

export const TenantDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { tenantId } = route.params || {};

  const [tenant, setTenant] = React.useState<TenantData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (isFocused && tenantId) {
      fetchTenantDetail();
    }
  }, [isFocused, tenantId]);

  const fetchTenantDetail = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'tenants', tenantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTenant(docSnap.data() as TenantData);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin cư dân.');
        navigation.goBack();
      }
    } catch (err) {
      console.error('Error fetching tenant details:', err);
      Alert.alert('Lỗi', 'Không thể tải chi tiết cư dân.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa cư dân ${tenant?.fullName || ''} khỏi hệ thống?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa cư dân',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              
              // 1. Delete tenant doc
              await deleteDoc(doc(db, 'tenants', tenantId));

              // 2. Update room status to empty if this was the resident
              if (tenant?.roomId) {
                const roomRef = doc(db, 'rooms', tenant?.roomId);
                // Optional check: see if there are any other active tenants in this room
                await updateDoc(roomRef, { status: 'empty' });
              }

              Alert.alert('Thành công', 'Đã xóa cư dân khỏi hệ thống.');
              navigation.goBack();
            } catch (err) {
              console.error('Error deleting tenant:', err);
              Alert.alert('Lỗi', 'Không thể xóa cư dân.');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin cư dân...</Text>
      </View>
    );
  }

  if (!tenant) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết cư dân</Text>
        <Pressable onPress={handleDelete} disabled={deleting} style={styles.deleteButton}>
          {deleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Name Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {tenant.fullName
                .split(' ')
                .slice(-2)
                .map((w) => w[0]?.toUpperCase() || '')
                .join('')}
            </Text>
          </View>
          <Text style={styles.profileName}>{tenant.fullName}</Text>
          <View style={styles.roomBadge}>
            <MaterialIcons name="meeting-room" size={16} color={theme.colors.primary} />
            <Text style={styles.roomBadgeText}>
              Phòng {tenant.roomCode || 'Trống'} • {tenant.buildingName || 'Chưa gán'}
            </Text>
          </View>
        </View>

        {/* ── Section 1: Thông tin cá nhân ────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              <Text style={styles.infoValue}>{tenant.phoneNumber || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="mail-outline" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{tenant.email || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ngày sinh</Text>
              <Text style={styles.infoValue}>{tenant.dob || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="wc" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Giới tính</Text>
              <Text style={styles.infoValue}>{tenant.gender || 'Nam'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="badge" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Số CCCD/CMND</Text>
              <Text style={styles.infoValue}>{tenant.cccd || 'Chưa cập nhật'}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 2: Địa chỉ thường trú ────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Địa chỉ thường trú</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Tỉnh / Thành phố</Text>
              <Text style={styles.infoValue}>{tenant.province || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="map" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phường / Xã</Text>
              <Text style={styles.infoValue}>{tenant.ward || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="home" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Địa chỉ chi tiết</Text>
              <Text style={styles.infoValue}>{tenant.detailAddress || 'Chưa cập nhật'}</Text>
            </View>
          </View>
        </View>

        {/* ── Section 3: Ảnh CCCD ──────────────────────────────────────────── */}
        {(tenant.cccdFront || tenant.cccdBack) && (
          <View style={styles.cardSection}>
            <Text style={styles.sectionTitle}>Ảnh CCCD/CMND</Text>
            <View style={styles.imageGrid}>
              {tenant.cccdFront ? (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Mặt trước</Text>
                  <Image source={{ uri: tenant.cccdFront }} style={styles.cccdImage} resizeMode="contain" />
                </View>
              ) : null}

              {tenant.cccdBack ? (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Mặt sau</Text>
                  <Image source={{ uri: tenant.cccdBack }} style={styles.cccdImage} resizeMode="contain" />
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* ── Section 4: Hợp đồng & Căn hộ ────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Hợp đồng & Căn hộ</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ngày dời vào</Text>
              <Text style={styles.infoValue}>{tenant.moveInDate || 'Chưa cập nhật'}</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="rate-review" size={20} color="#94a3b8" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Ghi chú</Text>
              <Text style={styles.infoValue}>{tenant.notes || 'Không có ghi chú'}</Text>
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileName: {
    ...theme.typography.headlineLgMobile,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  roomBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  cardSection: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 12,
    marginBottom: 12,
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  imageWrapper: {
    gap: 6,
  },
  imageLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
  },
  cccdImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f8fafc',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
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
});

export default TenantDetail;
