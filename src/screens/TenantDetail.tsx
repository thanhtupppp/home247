import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert, Modal
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, deleteDoc, updateDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Image } from 'expo-image';

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

  // ── Room Transfer States ───────────────────────────────────────────────────
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [buildings, setBuildings] = React.useState<any[]>([]);
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = React.useState<any>(null);
  const [selectedRoom, setSelectedRoom] = React.useState<any>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);
  const [transferring, setTransferring] = React.useState(false);
  const [loadingTransferData, setLoadingTransferData] = React.useState(false);

  const fetchTenantDetail = React.useCallback(async () => {
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
  }, [tenantId, navigation]);

  React.useEffect(() => {
    if (isFocused && tenantId) {
      fetchTenantDetail();
    }
  }, [isFocused, tenantId, fetchTenantDetail]);

  const openTransferModal = async () => {
    setShowTransferModal(true);
    try {
      setLoadingTransferData(true);
      const bSnap = await getDocs(query(collection(db, 'buildings'), orderBy('name')));
      const bList = bSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setBuildings(bList);
      if (bList.length > 0) {
        setSelectedBuilding(bList[0]);
        await fetchRoomsForTransfer(bList[0].id);
      }
    } catch (err) {
      console.error('Error loading transfer buildings:', err);
    } finally {
      setLoadingTransferData(false);
    }
  };

  const fetchRoomsForTransfer = async (buildingId: string) => {
    try {
      setSelectedRoom(null);
      const rSnap = await getDocs(
        query(collection(db, 'rooms'), where('buildingId', '==', buildingId), orderBy('code'))
      );
      const rList = rSnap.docs.map(doc => ({
        id: doc.id,
        code: doc.data().code,
        status: doc.data().status
      }));
      setRooms(rList);
      if (rList.length > 0) {
        setSelectedRoom(rList[0]);
      }
    } catch (err) {
      console.error('Error loading transfer rooms:', err);
    }
  };

  const handleSelectBuilding = (b: any) => {
    setSelectedBuilding(b);
    setShowBuildingDropdown(false);
    fetchRoomsForTransfer(b.id);
  };

  const handleTransfer = async () => {
    if (!selectedBuilding || !selectedRoom) {
      Alert.alert('Thông báo', 'Vui lòng chọn tòa nhà và phòng mới.');
      return;
    }
    
    if (selectedRoom.id === tenant?.roomId) {
      Alert.alert('Thông báo', 'Cư dân đã ở phòng này rồi.');
      return;
    }

    try {
      setTransferring(true);
      
      // 1. Update tenant document
      const tenantRef = doc(db, 'tenants', tenantId);
      await updateDoc(tenantRef, {
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.name,
        roomId: selectedRoom.id,
        roomCode: selectedRoom.code
      });

      // 2. Mark old room as empty
      if (tenant?.roomId) {
        const oldRoomRef = doc(db, 'rooms', tenant.roomId);
        await updateDoc(oldRoomRef, { status: 'empty' });
      }

      // 3. Mark new room as occupied
      const newRoomRef = doc(db, 'rooms', selectedRoom.id);
      await updateDoc(newRoomRef, { status: 'occupied' });

      Alert.alert('Thành công', `Đã chuyển cư dân sang phòng ${selectedRoom.code} thành công!`);
      setShowTransferModal(false);
      fetchTenantDetail(); // Refresh UI
    } catch (err) {
      console.error('Error transferring room:', err);
      Alert.alert('Lỗi', 'Không thể thực hiện chuyển phòng.');
    } finally {
      setTransferring(false);
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
          <View style={styles.roomBadgeRow}>
            <View style={styles.roomBadge}>
              <MaterialIcons name="meeting-room" size={16} color={theme.colors.primary} />
              <Text style={styles.roomBadgeText}>
                Phòng {tenant.roomCode || 'Trống'} • {tenant.buildingName || 'Chưa gán'}
              </Text>
            </View>
            <Pressable onPress={openTransferModal} style={styles.transferButton}>
              <MaterialIcons name="swap-horiz" size={16} color="#059669" />
              <Text style={styles.transferButtonText}>Chuyển phòng</Text>
            </Pressable>
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
                  <Image source={{ uri: tenant.cccdFront }} style={styles.cccdImage} contentFit="contain" />
                </View>
              ) : null}

              {tenant.cccdBack ? (
                <View style={styles.imageWrapper}>
                  <Text style={styles.imageLabel}>Mặt sau</Text>
                  <Image source={{ uri: tenant.cccdBack }} style={styles.cccdImage} contentFit="contain" />
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

      {/* Room Transfer Modal */}
      <Modal visible={showTransferModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chuyển phòng cư dân</Text>
              <Pressable onPress={() => setShowTransferModal(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>

            {loadingTransferData ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.modalLoadingText}>Đang tải thông tin tòa nhà...</Text>
              </View>
            ) : (
              <View style={styles.modalForm}>
                <Text style={styles.modalLabel}>Tòa nhà mới</Text>
                <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.modalDropdownButton}>
                  <Text style={styles.modalDropdownText}>{selectedBuilding?.name || 'Chọn tòa nhà'}</Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
                </Pressable>
                {showBuildingDropdown && (
                  <View style={styles.modalDropdown}>
                    {buildings.map((b) => (
                      <Pressable key={b.id} style={styles.modalDropdownItem} onPress={() => handleSelectBuilding(b)}>
                        <Text style={styles.modalDropdownItemText}>{b.name}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Text style={[styles.modalLabel, { marginTop: 16 }]}>Phòng mới</Text>
                <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.modalDropdownButton}>
                  <Text style={styles.modalDropdownText}>
                    {selectedRoom ? `Phòng ${selectedRoom.code} (${selectedRoom.status === 'occupied' ? 'Có người' : 'Phòng trống'})` : 'Chọn phòng'}
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
                </Pressable>
                {showRoomDropdown && (
                  <View style={styles.modalDropdown}>
                    {rooms.length === 0 ? (
                      <Text style={styles.emptyDropdownText}>Chưa có phòng</Text>
                    ) : (
                      rooms.map((r) => (
                        <Pressable key={r.id} style={styles.modalDropdownItem} onPress={() => { setSelectedRoom(r); setShowRoomDropdown(false); }}>
                          <Text style={styles.modalDropdownItemText}>
                            Phòng {r.code} {r.status === 'occupied' ? '⚠️ (Có người)' : '✅ (Trống)'}
                          </Text>
                        </Pressable>
                      ))
                    )}
                  </View>
                )}

                <Pressable style={styles.modalConfirmBtn} onPress={handleTransfer} disabled={transferring}>
                  {transferring ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="swap-horiz" size={20} color="#fff" />
                      <Text style={styles.modalConfirmText}>Xác nhận chuyển</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </View>
        </View>
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
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  roomBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  roomBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  transferButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#065f46',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  modalLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  modalLoadingText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  modalForm: {
    gap: 8,
  },
  modalLabel: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
  },
  modalDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalDropdownText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  modalDropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 4,
    overflow: 'hidden',
  },
  modalDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  modalDropdownItemText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  emptyDropdownText: {
    padding: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
    marginTop: 24,
  },
  modalConfirmText: {
    ...theme.typography.bodyLg,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TenantDetail;
