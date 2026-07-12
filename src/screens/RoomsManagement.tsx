import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  TextInput, 
  ActivityIndicator, 
  Modal, 
  Alert 
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  writeBatch, 
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { mockRooms } from '../data/mockData';

export const RoomsManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [searchText, setSearchText] = React.useState('');
  
  const [buildings, setBuildings] = React.useState<any[]>([]);
  const [expandedBuildingId, setExpandedBuildingId] = React.useState<string | null>(null);
  const [roomsData, setRoomsData] = React.useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = React.useState(false);
  const [loadingRooms, setLoadingRooms] = React.useState(false);

  // Add Room Modal States
  const [showAddRoomModal, setShowAddRoomModal] = React.useState(false);
  const [selectedBuildingForRoom, setSelectedBuildingForRoom] = React.useState<any>(null);
  const [roomCode, setRoomCode] = React.useState('');
  const [roomFloor, setRoomFloor] = React.useState('1');
  const [roomType, setRoomType] = React.useState('Phòng Đơn');
  const [roomPrice, setRoomPrice] = React.useState('3500000');
  const [roomArea, setRoomArea] = React.useState('20m²');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);
  const [savingRoom, setSavingRoom] = React.useState(false);

  const ROOM_TYPES = ['Phòng Đơn', 'Phòng Đôi', 'Phòng Vip'];

  React.useEffect(() => {
    if (isFocused) {
      fetchBuildings();
    }
  }, [isFocused]);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const bQuery = query(collection(db, 'buildings'));
      const bSnapshot = await getDocs(bQuery);
      
      let list: any[] = [];
      bSnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });

      // If empty, auto-seed the database with initial mock buildings and rooms
      if (list.length === 0) {
        list = await seedInitialData();
      }

      setBuildings(list);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedInitialData = async () => {
    try {
      const batch = writeBatch(db);
      
      // 1. Create mock buildings
      const b1Ref = doc(collection(db, 'buildings'));
      const b2Ref = doc(collection(db, 'buildings'));
      const b3Ref = doc(collection(db, 'buildings'));

      const uid = auth.currentUser?.uid || 'system';

      batch.set(b1Ref, {
        name: 'nơ trang long',
        type: 'Chung cư mini',
        province: 'Hồ Chí Minh',
        ward: 'Phường 1',
        detailAddress: '123 Nơ Trang Long',
        createdAt: new Date(),
        createdBy: uid
      });

      batch.set(b2Ref, {
        name: 'Home247 Landmark',
        type: 'Chung cư mini',
        province: 'Hồ Chí Minh',
        ward: 'Phường 22',
        detailAddress: '208 Nguyễn Hữu Cảnh',
        createdAt: new Date(),
        createdBy: uid
      });

      batch.set(b3Ref, {
        name: 'Home247 Riverside',
        type: 'Chung cư mini',
        province: 'Hồ Chí Minh',
        ward: 'Thảo Điền',
        detailAddress: '30 Xa lộ Hà Nội',
        createdAt: new Date(),
        createdBy: uid
      });

      // 2. Create mock rooms under 'nơ trang long'
      mockRooms.forEach((room) => {
        const roomRef = doc(collection(db, 'rooms'));
        batch.set(roomRef, {
          buildingId: b1Ref.id,
          buildingName: 'nơ trang long',
          code: room.code,
          type: room.type,
          price: Number(room.price.replace(/[^0-9]/g, '')),
          area: room.area,
          floor: room.floor,
          status: room.status,
          createdAt: new Date(),
          createdBy: uid
        });
      });

      await batch.commit();

      return [
        { id: b1Ref.id, name: 'nơ trang long', type: 'Chung cư mini', province: 'Hồ Chí Minh', ward: 'Phường 1', detailAddress: '123 Nơ Trang Long' },
        { id: b2Ref.id, name: 'Home247 Landmark', type: 'Chung cư mini', province: 'Hồ Chí Minh', ward: 'Phường 22', detailAddress: '208 Nguyễn Hữu Cảnh' },
        { id: b3Ref.id, name: 'Home247 Riverside', type: 'Chung cư mini', province: 'Hồ Chí Minh', ward: 'Thảo Điền', detailAddress: '30 Xa lộ Hà Nội' }
      ];
    } catch (e) {
      console.error('Error seeding data:', e);
      return [];
    }
  };

  const toggleExpandBuilding = async (buildingId: string) => {
    if (expandedBuildingId === buildingId) {
      setExpandedBuildingId(null);
    } else {
      setExpandedBuildingId(buildingId);
      await fetchRoomsForBuilding(buildingId);
    }
  };

  const fetchRoomsForBuilding = async (buildingId: string) => {
    try {
      setLoadingRooms(true);
      const rQuery = query(
        collection(db, 'rooms'),
        where('buildingId', '==', buildingId)
      );
      const rSnapshot = await getDocs(rQuery);
      const roomsList: any[] = [];
      rSnapshot.forEach((doc) => {
        roomsList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort rooms by floor then code
      roomsList.sort((a, b) => {
        if (a.floor !== b.floor) {
          return a.floor - b.floor;
        }
        return a.code.localeCompare(b.code);
      });

      setRoomsData((prev) => ({
        ...prev,
        [buildingId]: roomsList
      }));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleOpenAddRoom = (building: any) => {
    setSelectedBuildingForRoom(building);
    setRoomCode('');
    setRoomFloor('1');
    setRoomType('Phòng Đơn');
    setRoomPrice('3500000');
    setRoomArea('20m²');
    setShowAddRoomModal(true);
  };

  const handleAddRoomSave = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã phòng.');
      return;
    }
    if (!roomFloor.trim() || isNaN(Number(roomFloor))) {
      Alert.alert('Thông báo', 'Tầng phải là số.');
      return;
    }
    if (!roomPrice.trim() || isNaN(Number(roomPrice))) {
      Alert.alert('Thông báo', 'Giá phòng phải là số.');
      return;
    }

    try {
      setSavingRoom(true);
      const uid = auth.currentUser?.uid || 'system';

      await addDoc(collection(db, 'rooms'), {
        buildingId: selectedBuildingForRoom.id,
        buildingName: selectedBuildingForRoom.name,
        code: roomCode.trim(),
        type: roomType,
        price: Number(roomPrice),
        area: roomArea.trim(),
        floor: Number(roomFloor),
        status: 'empty',
        createdAt: new Date(),
        createdBy: uid
      });

      Alert.alert('Thành công', `Đã thêm phòng ${roomCode.trim()} vào tòa nhà ${selectedBuildingForRoom.name}!`);
      setShowAddRoomModal(false);
      await fetchRoomsForBuilding(selectedBuildingForRoom.id);
    } catch (e) {
      console.error('Error adding room:', e);
      Alert.alert('Lỗi', 'Không thể thêm phòng mới.');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = (room: any) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa phòng ${room.code}? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'rooms', room.id));
              Alert.alert('Thành công', `Đã xóa phòng ${room.code} thành công!`);
              await fetchRoomsForBuilding(room.buildingId);
            } catch (error) {
              console.error('Error deleting room:', error);
              Alert.alert('Lỗi', 'Không thể xóa phòng.');
            }
          }
        }
      ]
    );
  };

  const filteredBuildings = buildings.filter((b) =>
    b.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý nhà</Text>
        <Pressable style={styles.moreButton}>
          <MaterialIcons name="more-vert" size={24} color={theme.colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={22} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tòa nhà..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={22} color="#475569" />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
        ) : filteredBuildings.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có tòa nhà nào.</Text>
        ) : (
          filteredBuildings.map((building) => {
            const isExpanded = expandedBuildingId === building.id;
            const rooms = roomsData[building.id] || [];
            return (
              <View key={building.id} style={styles.buildingCard}>
                <Pressable 
                  style={styles.buildingHeader} 
                  onPress={() => toggleExpandBuilding(building.id)}
                >
                  <View style={styles.buildingHeaderLeft}>
                    <MaterialIcons name="apartment" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <View>
                      <Text style={styles.buildingName}>{building.name}</Text>
                      <Text style={styles.buildingType}>{building.type || 'Chung cư mini'}</Text>
                    </View>
                  </View>
                  <View style={styles.buildingHeaderRight}>
                    <MaterialIcons 
                      name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                      size={24} 
                      color="#94a3b8" 
                    />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {loadingRooms ? (
                      <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 12 }} />
                    ) : (
                      <View style={styles.roomsContainer}>
                        {rooms.length === 0 ? (
                          <Text style={styles.emptyRoomsText}>Chưa có căn hộ/phòng nào.</Text>
                        ) : (
                          rooms.map((room) => {
                            const statusLabel = room.status === 'occupied' ? 'Đang ở' : room.status === 'maintenance' ? 'Bảo trì' : 'Trống';
                            const statusBg = room.status === 'occupied' ? '#e6f4ea' : room.status === 'maintenance' ? '#fef3c7' : '#f1f5f9';
                            const statusColor = room.status === 'occupied' ? '#137333' : room.status === 'maintenance' ? '#b45309' : '#475569';
                            return (
                              <View key={room.id} style={styles.roomRow}>
                                <View style={styles.roomInfoCol}>
                                  <Text style={styles.roomCodeText}>{room.code}</Text>
                                  <Text style={styles.roomDetailsText}>Tầng {room.floor} • {room.area} • {room.type}</Text>
                                </View>
                                <View style={styles.roomRightCol}>
                                  <Text style={styles.roomPriceText}>{Number(room.price).toLocaleString('vi-VN')}đ</Text>
                                  <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                                  </View>
                                </View>
                                <Pressable 
                                  style={styles.deleteRoomBtn} 
                                  onPress={() => handleDeleteRoom(room)}
                                >
                                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                                </Pressable>
                              </View>
                            );
                          })
                        )}

                        <Pressable 
                          style={styles.addRoomCardButton} 
                          onPress={() => handleOpenAddRoom(building)}
                        >
                          <MaterialIcons name="add" size={18} color={theme.colors.primary} />
                          <Text style={styles.addRoomCardButtonText}>Thêm phòng</Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.addBuildingButton}
          onPress={() => navigation.navigate('toa-nha/them')}
        >
          <MaterialIcons name="add" size={22} color={theme.colors.onPrimary} />
          <Text style={styles.addBuildingButtonText}>Thêm toà nhà</Text>
        </Pressable>
      </View>

      {/* Add Room Modal */}
      <Modal
        visible={showAddRoomModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddRoomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm phòng mới</Text>
              <Pressable onPress={() => setShowAddRoomModal(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.inputLabel}>Mã phòng *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Vd: P.101"
                value={roomCode}
                onChangeText={setRoomCode}
              />

              <View style={styles.rowInputs}>
                <View style={[styles.inputCol, { marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Tầng *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Vd: 1"
                    keyboardType="numeric"
                    value={roomFloor}
                    onChangeText={setRoomFloor}
                  />
                </View>
                <View style={styles.inputCol}>
                  <Text style={styles.inputLabel}>Diện tích</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Vd: 20m²"
                    value={roomArea}
                    onChangeText={setRoomArea}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Loại phòng</Text>
              <Pressable onPress={() => setShowTypeDropdown(!showTypeDropdown)} style={styles.modalDropdownBtn}>
                <Text style={styles.modalDropdownBtnText}>{roomType}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
              </Pressable>
              {showTypeDropdown && (
                <View style={styles.modalDropdown}>
                  {ROOM_TYPES.map((t) => (
                    <Pressable key={t} style={styles.modalDropdownItem} onPress={() => { setRoomType(t); setShowTypeDropdown(false); }}>
                      <Text style={styles.modalDropdownItemText}>{t}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Giá thuê phòng (VNĐ/tháng) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Vd: 3500000"
                keyboardType="numeric"
                value={roomPrice}
                onChangeText={setRoomPrice}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowAddRoomModal(false)}>
                <Text style={styles.modalCancelBtnText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.modalSaveBtn} onPress={handleAddRoomSave} disabled={savingRoom}>
                {savingRoom ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Lưu</Text>
                )}
              </Pressable>
            </View>
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
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    fontSize: 22,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: 8,
    paddingBottom: 100,
  },
  searchSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    padding: 0,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buildingCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 12,
  },
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buildingName: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  buildingType: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  buildingHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedContent: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  roomsContainer: {
    gap: 10,
  },
  emptyRoomsText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 12,
  },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  roomInfoCol: {
    flex: 1,
  },
  roomCodeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  roomDetailsText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  roomRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roomPriceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addRoomCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: theme.borderRadius.lg,
    gap: 6,
    marginTop: 8,
  },
  addRoomCardButtonText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  deleteRoomBtn: {
    padding: 8,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addBuildingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    boxShadow: [{
      offsetX: 0,
      offsetY: 4,
      blurRadius: 10,
      color: 'rgba(0, 0, 0, 0.15)'
    }],
  },
  addBuildingButtonText: {
    ...theme.typography.bodyLg,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    flex: 1,
  },
  modalForm: {
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.onSurface,
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputCol: {
    flex: 1,
  },
  modalDropdownBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalDropdownBtnText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  modalDropdown: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalDropdownItemText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: '#f1f5f9',
  },
  modalCancelBtnText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default RoomsManagement;
