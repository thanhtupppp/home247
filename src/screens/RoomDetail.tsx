import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { doc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface RoomData {
  id: string;
  code: string;
  buildingId: string;
  buildingName: string;
  floor: number;
  area: string;
  price: number;
  type: string;
  status: 'empty' | 'occupied' | 'maintenance';
}

interface Tenant {
  id: string;
  fullName: string;
  phoneNumber: string;
}

interface Contract {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  rentPrice: number;
}

export const RoomDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { roomId } = route.params || {};

  const [room, setRoom] = React.useState<RoomData | null>(null);
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [contract, setContract] = React.useState<Contract | null>(null);
  
  const [loading, setLoading] = React.useState(true);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  const fetchRoomDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Room doc
      const roomSnap = await getDoc(doc(db, 'rooms', roomId));
      if (!roomSnap.exists()) {
        Alert.alert('Lỗi', 'Không tìm thấy phòng.');
        navigation.goBack();
        return;
      }
      setRoom({ id: roomSnap.id, ...roomSnap.data() } as RoomData);
      
      // 2. Fetch Tenants in this room
      const tSnap = await getDocs(
        query(collection(db, 'tenants'), where('roomId', '==', roomId), where('status', '==', 'active'))
      );
      const tList = tSnap.docs.map((doc) => ({
        id: doc.id,
        fullName: doc.data().fullName || '',
        phoneNumber: doc.data().phoneNumber || '',
      }));
      setTenants(tList);

      // 3. Fetch Contract for this room
      const cSnap = await getDocs(
        query(collection(db, 'contracts'), where('roomId', '==', roomId), where('status', '==', 'active'))
      );
      if (!cSnap.empty) {
        const cDoc = cSnap.docs[0];
        setContract({
          id: cDoc.id,
          tenantName: cDoc.data().tenantName || '',
          startDate: cDoc.data().startDate || '',
          endDate: cDoc.data().endDate || '',
          rentPrice: cDoc.data().rentPrice || 0,
        });
      } else {
        setContract(null);
      }

    } catch (err) {
      console.error('Error fetching room details:', err);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng.');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigation]);

  React.useEffect(() => {
    if (isFocused && roomId) {
      fetchRoomDetails();
    }
  }, [isFocused, roomId, fetchRoomDetails]);

  const handleUpdateStatus = async (newStatus: 'empty' | 'occupied' | 'maintenance') => {
    if (!room) return;
    try {
      setUpdatingStatus(true);
      setShowStatusDropdown(false);
      
      await updateDoc(doc(db, 'rooms', roomId), { status: newStatus });
      setRoom((prev) => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái phòng.');
    } catch (err) {
      console.error('Error updating room status:', err);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết phòng...</Text>
      </View>
    );
  }

  if (!room) return null;

  const statusLabel = room.status === 'occupied' ? 'Đang ở' : room.status === 'maintenance' ? 'Bảo trì' : 'Trống';
  const statusBg = room.status === 'occupied' ? '#e6f4ea' : room.status === 'maintenance' ? '#fef3c7' : '#f1f5f9';
  const statusColor = room.status === 'occupied' ? '#137333' : room.status === 'maintenance' ? '#b45309' : '#475569';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Chi tiết phòng {room.code}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Core Room Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.roomCode}>Phòng {room.code}</Text>
              <Text style={styles.buildingName}>{room.buildingName}</Text>
            </View>
            
            {/* Status Picker Button */}
            <View>
              <Pressable
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                style={[styles.statusBadge, { backgroundColor: statusBg }]}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color={statusColor} />
                ) : (
                  <>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                    <MaterialIcons name="arrow-drop-down" size={16} color={statusColor} />
                  </>
                )}
              </Pressable>
              
              {showStatusDropdown && (
                <View style={styles.dropdown}>
                  <Pressable style={styles.dropdownItem} onPress={() => handleUpdateStatus('empty')}>
                    <Text style={[styles.dropdownText, { color: '#475569' }]}>🟢 Trống</Text>
                  </Pressable>
                  <Pressable style={styles.dropdownItem} onPress={() => handleUpdateStatus('occupied')}>
                    <Text style={[styles.dropdownText, { color: '#137333' }]}>👥 Đang ở</Text>
                  </Pressable>
                  <Pressable style={styles.dropdownItem} onPress={() => handleUpdateStatus('maintenance')}>
                    <Text style={[styles.dropdownText, { color: '#b45309' }]}>🛠️ Bảo trì</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Specs */}
          <View style={styles.specsRow}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>TẦNG</Text>
              <Text style={styles.specValue}>{room.floor}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>DIỆN TÍCH</Text>
              <Text style={styles.specValue}>{room.area}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>LOẠI PHÒNG</Text>
              <Text style={styles.specValue} numberOfLines={1}>{room.type}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá thuê cơ sở:</Text>
            <Text style={styles.priceValue}>{Number(room.price).toLocaleString('vi-VN')} đ/tháng</Text>
          </View>
        </View>

        {/* ── Section: Cư dân hiện tại ────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Cư dân trong phòng</Text>
            <Pressable
              onPress={() => navigation.navigate('cu-dan/them', { buildingId: room.buildingId, roomId: room.id })}
              style={styles.actionLink}
            >
              <MaterialIcons name="add" size={16} color={theme.colors.primary} />
              <Text style={styles.actionLinkText}>Thêm</Text>
            </Pressable>
          </View>

          {tenants.length === 0 ? (
            <Text style={styles.emptyText}>Chưa có cư dân nào đăng ký ở phòng này.</Text>
          ) : (
            <View style={styles.list}>
              {tenants.map((t) => (
                <Pressable
                  key={t.id}
                  style={styles.tenantRow}
                  onPress={() => navigation.navigate('cu-dan/chi-tiet', { tenantId: t.id })}
                >
                  <View style={styles.tenantLeft}>
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{t.fullName.split(' ').pop()?.[0]?.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.tenantName}>{t.fullName}</Text>
                      <Text style={styles.tenantPhone}>{t.phoneNumber}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* ── Section: Hợp đồng thuê ──────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Hợp đồng thuê</Text>
            {!contract && (
              <Pressable
                onPress={() => navigation.navigate('hop-dong/moi')}
                style={styles.actionLink}
              >
                <MaterialIcons name="add" size={16} color={theme.colors.primary} />
                <Text style={styles.actionLinkText}>Tạo HĐ</Text>
              </Pressable>
            )}
          </View>

          {contract ? (
            <View style={styles.contractBox}>
              <View style={styles.contractRow}>
                <Text style={styles.contractLabel}>Người ký hợp đồng:</Text>
                <Text style={styles.contractValue}>{contract.tenantName}</Text>
              </View>
              <View style={styles.contractRow}>
                <Text style={styles.contractLabel}>Thời hạn thuê:</Text>
                <Text style={styles.contractValue}>{contract.startDate} - {contract.endDate}</Text>
              </View>
              <View style={styles.contractRow}>
                <Text style={styles.contractLabel}>Giá thuê trên HĐ:</Text>
                <Text style={[styles.contractValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                  {Number(contract.rentPrice).toLocaleString('vi-VN')} đ
                </Text>
              </View>
              
              <Pressable
                onPress={() => navigation.navigate('hop-dong')}
                style={styles.viewContractBtn}
              >
                <Text style={styles.viewContractBtnText}>Xem danh sách hợp đồng</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có hợp đồng nào đang hiệu lực cho phòng này.</Text>
          )}
        </View>

        {/* Quick billing access */}
        <Pressable
          style={styles.quickInvoiceBtn}
          onPress={() => navigation.navigate('hoa-don/them', { buildingId: room.buildingId, roomId: room.id })}
        >
          <MaterialIcons name="receipt-long" size={20} color="#fff" />
          <Text style={styles.quickInvoiceBtnText}>Tạo hóa đơn tháng này</Text>
        </Pressable>
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
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 20,
  },
  roomCode: {
    ...theme.typography.headlineLgMobile,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  buildingName: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: 36,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.lg,
    width: 120,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 30,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specBox: {
    flex: 1,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  sectionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.lg,
  },
  actionLinkText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
    textAlign: 'center',
    paddingVertical: 12,
  },
  list: {
    gap: 12,
  },
  tenantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  tenantPhone: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  contractBox: {
    gap: 8,
  },
  contractRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  contractValue: {
    fontSize: 13,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  viewContractBtn: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  viewContractBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onSurfaceVariant,
  },
  quickInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
  },
  quickInvoiceBtnText: {
    ...theme.typography.bodyLg,
    color: '#fff',
    fontWeight: 'bold',
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

export default RoomDetail;
