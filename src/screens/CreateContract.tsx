import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput,
  ActivityIndicator, Alert, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

interface Building {
  id: string;
  name: string;
}

interface Room {
  id: string;
  code: string;
  price?: number;
  status?: string;
}

const CYCLES = ['1 tháng', '2 tháng', '3 tháng', '6 tháng', '12 tháng'];

export const CreateContract: React.FC = () => {
  const navigation = useNavigation<any>();

  // ── Loading / Saving ───────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = React.useState(true);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // ── Tenant Information ─────────────────────────────────────────────────────
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [addressNote, setAddressNote] = React.useState('');

  // ── CCCD Photos (Base64 Picker) ────────────────────────────────────────────
  const [cccdFront, setCccdFront] = React.useState<string | null>(null);
  const [cccdBack, setCccdBack] = React.useState<string | null>(null);

  // ── Contract Information ───────────────────────────────────────────────────
  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);

  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  const [startDate, setStartDate] = React.useState('12/07/2026');
  const [signDate] = React.useState('12/07/2026');
  const [endDate, setEndDate] = React.useState('12/07/2027');
  const [rentPrice, setRentPrice] = React.useState('');
  const [depositPrice, setDepositPrice] = React.useState('');

  const [selectedCycle, setSelectedCycle] = React.useState('1 tháng');
  const [showCycleDropdown, setShowCycleDropdown] = React.useState(false);
  const [collectionDay, setCollectionDay] = React.useState('05');
  const [paidUntilDate, setPaidUntilDate] = React.useState('12/08/2026');

  // ── Fetch Buildings ────────────────────────────────────────────────────────
  React.useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const snap = await getDocs(query(collection(db, 'buildings'), orderBy('name')));
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      setBuildings(list);
      if (list.length > 0) {
        setSelectedBuilding(list[0]);
        fetchRooms(list[0].id);
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const fetchRooms = async (buildingId: string) => {
    try {
      setLoadingRooms(true);
      setSelectedRoom(null);
      const snap = await getDocs(
        query(collection(db, 'rooms'), where('buildingId', '==', buildingId), orderBy('code'))
      );
      const list = snap.docs.map((d) => ({
        id: d.id,
        code: d.data().code,
        price: d.data().price ? Number(d.data().price) : undefined,
        status: d.data().status,
      }));
      setRooms(list);
      if (list.length > 0) {
        setSelectedRoom(list[0]);
        if (list[0].price) {
          setRentPrice(list[0].price.toString());
          setDepositPrice(list[0].price.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // ── Photo Upload Logic ─────────────────────────────────────────────────────
  const pickCccdImage = async (side: 'front' | 'back') => {
    Alert.alert(
      side === 'front' ? 'CCCD Mặt trước' : 'CCCD Mặt sau',
      'Chọn nguồn ảnh',
      [
        {
          text: 'Thư viện ảnh',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              quality: 0.4,
              base64: true,
            });
            if (!result.canceled && result.assets?.[0]?.base64) {
              const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
              side === 'front' ? setCccdFront(dataUrl) : setCccdBack(dataUrl);
            }
          },
        },
        {
          text: 'Chụp ảnh',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.4,
              base64: true,
            });
            if (!result.canceled && result.assets?.[0]?.base64) {
              const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
              side === 'front' ? setCccdFront(dataUrl) : setCccdBack(dataUrl);
            }
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  // ── Selection Handlers ─────────────────────────────────────────────────────
  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b);
    setShowBuildingDropdown(false);
    fetchRooms(b.id);
  };

  const handleSelectRoom = (r: Room) => {
    setSelectedRoom(r);
    setShowRoomDropdown(false);
    if (r.price) {
      setRentPrice(r.price.toString());
      setDepositPrice(r.price.toString());
    }
  };

  // ── Save contract and link to tenant ──────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên khách thuê.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return;
    }
    if (!selectedBuilding) {
      Alert.alert('Thông báo', 'Vui lòng chọn tòa nhà.');
      return;
    }
    if (!selectedRoom) {
      Alert.alert('Thông báo', 'Vui lòng chọn phòng.');
      return;
    }

    try {
      setSaving(true);
      const parsedRent = Number(rentPrice.replace(/[^0-9]/g, '')) || 0;
      const parsedDeposit = Number(depositPrice.replace(/[^0-9]/g, '')) || 0;

      // 1. Save Contract doc
      const contractData = {
        tenantName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressNote: addressNote.trim(),
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.name,
        roomId: selectedRoom.id,
        roomCode: selectedRoom.code,
        startDate,
        signDate,
        endDate,
        rentPrice: parsedRent,
        depositPrice: parsedDeposit,
        cycle: selectedCycle,
        collectionDay: Number(collectionDay) || 5,
        paidUntilDate,
        status: 'active',
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || 'system',
      };
      
      const contractRef = await addDoc(collection(db, 'contracts'), contractData);

      // 2. Also register this person in the tenants collection
      const tenantData = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: '',
        dob: '',
        cccd: '',
        cccdFront: cccdFront ?? '',
        cccdBack: cccdBack ?? '',
        gender: 'Nam',
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.name,
        roomId: selectedRoom.id,
        roomCode: selectedRoom.code,
        moveInDate: startDate,
        contractEndDate: endDate,
        contractId: contractRef.id,
        notes: addressNote.trim(),
        sendInvite: false,
        receiveNotif: true,
        primaryContact: true,
        status: 'active',
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || 'system',
      };
      await addDoc(collection(db, 'tenants'), tenantData);

      // 3. Mark room status as occupied
      const roomRef = doc(db, 'rooms', selectedRoom.id);
      await updateDoc(roomRef, {
        status: 'occupied',
        price: parsedRent, // update price with negotiated rent
      });

      Alert.alert('Thành công', 'Đã tạo hợp đồng và thêm cư dân thành công!');
      navigation.goBack();
    } catch (err) {
      console.error('Error creating contract:', err);
      Alert.alert('Lỗi', 'Không thể tạo hợp đồng mới.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo hợp đồng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          
          {/* Section 1: Thông tin khách thuê */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin khách thuê</Text>
          </View>

          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="09xx xxx xxx"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Địa chỉ / Ghi chú</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Nhập địa chỉ hoặc ghi chú (tùy chọn)"
            value={addressNote}
            onChangeText={setAddressNote}
            multiline
            numberOfLines={3}
          />

          {/* Section 2: Căn cước công dân */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="credit-card" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Căn cước công dân</Text>
          </View>

          <View style={styles.row}>
            {/* Front */}
            <Pressable style={styles.photoUploadCard} onPress={() => pickCccdImage('front')}>
              {cccdFront ? (
                <>
                  <Image source={{ uri: cccdFront }} style={styles.cccdPreview} resizeMode="cover" />
                  <View style={styles.cccdOverlay}>
                    <MaterialIcons name="edit" size={16} color="#fff" />
                    <Text style={styles.cccdOverlayText}>Đổi ảnh</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.photoUploadCircle}>
                    <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoUploadTitle}>Mặt trước</Text>
                  <Text style={styles.photoUploadSubtext}>Chạm để chọn</Text>
                </>
              )}
            </Pressable>

            {/* Back */}
            <Pressable style={styles.photoUploadCard} onPress={() => pickCccdImage('back')}>
              {cccdBack ? (
                <>
                  <Image source={{ uri: cccdBack }} style={styles.cccdPreview} resizeMode="cover" />
                  <View style={styles.cccdOverlay}>
                    <MaterialIcons name="edit" size={16} color="#fff" />
                    <Text style={styles.cccdOverlayText}>Đổi ảnh</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.photoUploadCircle}>
                    <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoUploadTitle}>Mặt sau</Text>
                  <Text style={styles.photoUploadSubtext}>Chạm để chọn</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Section 3: Thông tin hợp đồng */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="description" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
          </View>

          <Text style={styles.label}>Tòa nhà *</Text>
          {loadingBuildings ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
          ) : (
            <View>
              <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedBuilding?.name || 'Chọn tòa nhà'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showBuildingDropdown && (
                <View style={styles.dropdown}>
                  {buildings.map((b) => (
                    <Pressable key={b.id} style={styles.dropdownItem} onPress={() => handleSelectBuilding(b)}>
                      <Text style={styles.dropdownItemText}>{b.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>Phòng *</Text>
          {loadingRooms ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 12 }} />
          ) : !selectedBuilding ? (
            <View style={styles.disabledDropdown}>
              <Text style={styles.disabledDropdownText}>Vui lòng chọn tòa nhà trước</Text>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedRoom?.code || 'Chọn phòng'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showRoomDropdown && (
                <View style={styles.dropdown}>
                  {rooms.length === 0 ? (
                    <Text style={styles.emptyDropdown}>Chưa có phòng nào</Text>
                  ) : (
                    rooms.map((r) => (
                      <Pressable key={r.id} style={styles.dropdownItem} onPress={() => handleSelectRoom(r)}>
                        <Text style={styles.dropdownItemText}>
                          Phòng {r.code} {r.status === 'occupied' ? '👥 (Đang ở)' : '🟢 (Trống)'}
                        </Text>
                      </Pressable>
                    ))
                  )}
                </View>
              )}
            </View>
          )}

          {/* Dates & Rates */}
          <Text style={[styles.label, { marginTop: 14 }]}>Ngày bắt đầu hợp đồng</Text>
          <TextInput
            style={styles.textInput}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="dd/mm/yyyy"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Hạn hợp đồng</Text>
          <TextInput
            style={styles.textInput}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="dd/mm/yyyy"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Tiền phòng *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 5500000"
            keyboardType="numeric"
            value={rentPrice}
            onChangeText={setRentPrice}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Tiền cọc (Tùy chọn)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 5500000"
            keyboardType="numeric"
            value={depositPrice}
            onChangeText={setDepositPrice}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Chu kỳ trả tiền phòng</Text>
          <Pressable onPress={() => setShowCycleDropdown(!showCycleDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedCycle}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showCycleDropdown && (
            <View style={styles.dropdown}>
              {CYCLES.map((c) => (
                <Pressable key={c} style={styles.dropdownItem} onPress={() => { setSelectedCycle(c); setShowCycleDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>Ngày chốt đóng tiền hàng tháng</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 05"
            keyboardType="numeric"
            value={collectionDay}
            onChangeText={setCollectionDay}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Đã thanh toán đến ngày</Text>
          <TextInput
            style={styles.textInput}
            value={paidUntilDate}
            onChangeText={setPaidUntilDate}
            placeholder="dd/mm/yyyy"
          />
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
              <Text style={styles.saveBtnText}>Tạo hợp đồng</Text>
            </>
          )}
        </Pressable>
      </View>
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
    paddingBottom: 40,
  },
  form: {
    padding: theme.spacing.marginMobile,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  photoUploadCard: {
    flex: 1,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    minHeight: 110,
    overflow: 'hidden',
  },
  photoUploadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoUploadTitle: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  photoUploadSubtext: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  dropdownButton: {
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
  dropdownButtonText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  dropdownItemText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  bottomBar: {
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  cccdPreview: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.xl,
  },
  cccdOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  cccdOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledDropdown: {
    backgroundColor: '#f1f5f9',
    borderColor: theme.colors.outlineVariant,
    borderWidth: 1,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disabledDropdownText: {
    ...theme.typography.bodyMd,
    color: '#94a3b8',
  },
  emptyDropdown: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default CreateContract;
