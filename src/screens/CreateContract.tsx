import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, ActivityIndicator, Alert, Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

interface Tenant {
  id: string;
  fullName: string;
  phoneNumber: string;
  buildingId?: string;
  roomId?: string;
  notes?: string;
  cccdFront?: string;
  cccdBack?: string;
}

const CYCLES = ['1 tháng', '2 tháng', '3 tháng', '6 tháng', '12 tháng'];

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const parseDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(Number);
    const parsed = new Date(yyyy, mm - 1, dd);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

export const CreateContract: React.FC = () => {
  const navigation = useNavigation<any>();

  // ── Loading / Saving ───────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = React.useState(true);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // ── Tenant Selection ───────────────────────────────────────────────────────
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);
  const [showTenantDropdown, setShowTenantDropdown] = React.useState(false);
  const [tenantSearch, setTenantSearch] = React.useState('');

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

  const [startDate, setStartDate] = React.useState(formatDate(new Date()));
  const [signDate] = React.useState(formatDate(new Date()));
  const [endDate, setEndDate] = React.useState('');
  const [rentPrice, setRentPrice] = React.useState('');
  const [depositPrice, setDepositPrice] = React.useState('');

  const [selectedCycle, setSelectedCycle] = React.useState('1 tháng');
  const [showCycleDropdown, setShowCycleDropdown] = React.useState(false);
  const [collectionDay, setCollectionDay] = React.useState('05');
  const [paidUntilDate, setPaidUntilDate] = React.useState('12/08/2026');

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const [showPaidDatePicker, setShowPaidDatePicker] = React.useState(false);

  // Term Selection
  const [contractTerm, setContractTerm] = React.useState<number>(12); // Default to 12 months (1 year)
  const [showTermDropdown, setShowTermDropdown] = React.useState(false);

  const calculateEndDate = (startDateStr: string, monthsToAdd: number) => {
    const parts = startDateStr.split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts.map(Number);
      const start = new Date(yyyy, mm - 1, dd);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setMonth(end.getMonth() + monthsToAdd);
        const ddOut = String(end.getDate()).padStart(2, '0');
        const mmOut = String(end.getMonth() + 1).padStart(2, '0');
        const yyyyOut = end.getFullYear();
        return `${ddOut}/${mmOut}/${yyyyOut}`;
      }
    }
    return startDateStr;
  };

  React.useEffect(() => {
    if (contractTerm !== 0) {
      const calculated = calculateEndDate(startDate, contractTerm);
      setEndDate(calculated);
    }
  }, [startDate, contractTerm]);

  React.useEffect(() => {
    fetchBuildings();
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'tenants'), orderBy('fullName')));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        fullName: doc.data().fullName || '',
        phoneNumber: doc.data().phoneNumber || '',
        buildingId: doc.data().buildingId,
        roomId: doc.data().roomId,
        notes: doc.data().notes,
        cccdFront: doc.data().cccdFront,
        cccdBack: doc.data().cccdBack,
      }));
      setTenants(list);
    } catch (err) {
      console.error('Error fetching tenants list:', err);
    }
  };

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
      return list;
    } catch (err) {
      console.error('Error fetching rooms:', err);
      return [];
    } finally {
      setLoadingRooms(false);
    }
  };

  // ── Tenant Dropdown Selection Handlers ─────────────────────────────────────
  const handleSelectTenant = async (t: Tenant) => {
    setSelectedTenant(t);
    setShowTenantDropdown(false);
    setFullName(t.fullName);
    setPhoneNumber(t.phoneNumber);
    setAddressNote(t.notes || '');
    setCccdFront(t.cccdFront || null);
    setCccdBack(t.cccdBack || null);

    if (t.buildingId) {
      const bMatch = buildings.find(b => b.id === t.buildingId);
      if (bMatch) {
        setSelectedBuilding(bMatch);
        const fetchedRooms = await fetchRooms(t.buildingId);
        if (t.roomId) {
          const rMatch = fetchedRooms.find(r => r.id === t.roomId);
          if (rMatch) {
            setSelectedRoom(rMatch);
            if (rMatch.price) {
              setRentPrice(rMatch.price.toString());
              setDepositPrice(rMatch.price.toString());
            }
          }
        }
      }
    }
  };

  const handleClearTenantSelection = () => {
    setSelectedTenant(null);
    setShowTenantDropdown(false);
    setFullName('');
    setPhoneNumber('');
    setAddressNote('');
    setCccdFront(null);
    setCccdBack(null);
  };

  const filteredTenants = React.useMemo(() => {
    if (!tenantSearch.trim()) return tenants;
    const q = tenantSearch.toLowerCase();
    return tenants.filter(t => 
      t.fullName.toLowerCase().includes(q) || 
      t.phoneNumber.includes(q)
    );
  }, [tenants, tenantSearch]);

  // ── Photo Upload Logic ─────────────────────────────────────────────────────
  const pickCccdImage = async (side: 'front' | 'back') => {
    Alert.alert(
      'Chọn ảnh CCCD',
      'Vui lòng chọn nguồn ảnh của bạn',
      [
        {
          text: 'Máy ảnh',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền sử dụng máy ảnh để chụp ảnh CCCD.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [85, 54],
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
              if (side === 'front') setCccdFront(dataUrl);
              else setCccdBack(dataUrl);
            }
          },
        },
        {
          text: 'Thư viện ảnh',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện để chọn ảnh CCCD.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [85, 54],
              quality: 0.5,
              base64: true,
            });
            if (!result.canceled && result.assets[0].base64) {
              const dataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
              if (side === 'front') setCccdFront(dataUrl);
              else setCccdBack(dataUrl);
            }
          },
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

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
      Alert.alert('Thông báo', 'Vui lòng nhập hoặc chọn họ và tên khách thuê.');
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

      // 2. Register or update the tenant record
      if (selectedTenant) {
        // Update existing tenant
        const tenantRef = doc(db, 'tenants', selectedTenant.id);
        await updateDoc(tenantRef, {
          buildingId: selectedBuilding.id,
          buildingName: selectedBuilding.name,
          roomId: selectedRoom.id,
          roomCode: selectedRoom.code,
          moveInDate: startDate,
          contractEndDate: endDate,
          contractId: contractRef.id,
          notes: addressNote.trim(),
          cccdFront: cccdFront ?? selectedTenant.cccdFront ?? '',
          cccdBack: cccdBack ?? selectedTenant.cccdBack ?? '',
        });
      } else {
        // Register new tenant
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
      }

      // 3. Mark room status as occupied
      const roomRef = doc(db, 'rooms', selectedRoom.id);
      await updateDoc(roomRef, {
        status: 'occupied',
        price: parsedRent, // update price with negotiated rent
      });

      Alert.alert('Thành công', 'Đã tạo hợp đồng và lưu thông tin cư dân thành công!');
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
        <Text style={styles.headerTitle}>Tạo hợp đồng mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          
          {/* Section 1: Thông tin khách thuê */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin khách thuê</Text>
          </View>

          {/* Searchable Tenant Dropdown */}
          <Text style={styles.label}>Chọn từ cư dân hiện tại (Tùy chọn)</Text>
          <View style={{ zIndex: 50, marginBottom: 12 }}>
            <Pressable onPress={() => setShowTenantDropdown(!showTenantDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>
                {selectedTenant ? `${selectedTenant.fullName} (${selectedTenant.phoneNumber})` : 'Chọn cư dân...'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
            </Pressable>
            
            {showTenantDropdown && (
              <View style={styles.dropdown}>
                <View style={styles.dropdownSearch}>
                  <MaterialIcons name="search" size={18} color="#94a3b8" />
                  <TextInput
                    style={styles.dropdownSearchInput}
                    placeholder="Tìm kiếm tên hoặc số điện thoại..."
                    value={tenantSearch}
                    onChangeText={setTenantSearch}
                  />
                </View>
                {filteredTenants.length === 0 ? (
                  <Text style={styles.emptyDropdownText}>Không tìm thấy cư dân</Text>
                ) : (
                  <ScrollView style={{ maxHeight: 180 }}>
                    {filteredTenants.map((t) => (
                      <Pressable key={t.id} style={styles.dropdownItem} onPress={() => handleSelectTenant(t)}>
                        <Text style={styles.dropdownItemText}>{t.fullName} ({t.phoneNumber})</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
                {selectedTenant && (
                  <Pressable
                    style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fef2f2' }]}
                    onPress={handleClearTenantSelection}
                  >
                    <Text style={[styles.dropdownItemText, { color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }]}>
                      ❌ Nhập cư dân mới / Bỏ chọn
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
            editable={!selectedTenant}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="09xx xxx xxx"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!selectedTenant}
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
                    <MaterialIcons name="edit" size={18} color="#fff" />
                    <Text style={styles.cccdOverlayText}>Đổi ảnh</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.photoPlaceholderCircle}>
                    <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoUploadTitle}>Mặt trước CCCD</Text>
                  <Text style={styles.photoUploadSub}>Nhấn để chụp hoặc tải lên</Text>
                </>
              )}
            </Pressable>

            {/* Back */}
            <Pressable style={styles.photoUploadCard} onPress={() => pickCccdImage('back')}>
              {cccdBack ? (
                <>
                  <Image source={{ uri: cccdBack }} style={styles.cccdPreview} resizeMode="cover" />
                  <View style={styles.cccdOverlay}>
                    <MaterialIcons name="edit" size={18} color="#fff" />
                    <Text style={styles.cccdOverlayText}>Đổi ảnh</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.photoPlaceholderCircle}>
                    <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoUploadTitle}>Mặt sau CCCD</Text>
                  <Text style={styles.photoUploadSub}>Nhấn để chụp hoặc tải lên</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Section 3: Thông tin phòng & hợp đồng */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="domain" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin phòng & Hợp đồng</Text>
          </View>

          {/* Building Dropdown */}
          <Text style={styles.label}>Tòa nhà</Text>
          {loadingBuildings ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 8 }} />
          ) : (
            <View style={{ zIndex: 30, marginBottom: 12 }}>
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

          {/* Room Dropdown */}
          <Text style={styles.label}>Phòng / Căn hộ</Text>
          {loadingRooms ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ alignSelf: 'flex-start', marginVertical: 8 }} />
          ) : (
            <View style={{ zIndex: 20, marginBottom: 12 }}>
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
          <Pressable onPress={() => setShowStartDatePicker(true)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{startDate || 'Chọn ngày bắt đầu'}</Text>
            <MaterialIcons name="calendar-today" size={20} color="#a1a1aa" />
          </Pressable>
          {showStartDatePicker && (
            <DateTimePicker
              value={parseDate(startDate)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowStartDatePicker(false);
                if (selectedDate) {
                  setStartDate(formatDate(selectedDate));
                }
              }}
            />
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>Thời hạn hợp đồng</Text>
          <View style={{ zIndex: 10 }}>
            <Pressable onPress={() => setShowTermDropdown(!showTermDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>
                {contractTerm === 6 ? '6 tháng' : contractTerm === 12 ? '12 tháng (1 năm)' : contractTerm === 24 ? '24 tháng (2 năm)' : 'Tùy chọn (Tự chọn ngày)'}
              </Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
            </Pressable>
            {showTermDropdown && (
              <View style={styles.dropdown}>
                <Pressable style={styles.dropdownItem} onPress={() => { setContractTerm(6); setShowTermDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>6 tháng</Text>
                </Pressable>
                <Pressable style={styles.dropdownItem} onPress={() => { setContractTerm(12); setShowTermDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>12 tháng (1 năm)</Text>
                </Pressable>
                <Pressable style={styles.dropdownItem} onPress={() => { setContractTerm(24); setShowTermDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>24 tháng (2 năm)</Text>
                </Pressable>
                <Pressable style={styles.dropdownItem} onPress={() => { setContractTerm(0); setShowTermDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>Tùy chọn (Tự chọn ngày)</Text>
                </Pressable>
              </View>
            )}
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Hạn hợp đồng</Text>
          <Pressable 
            onPress={() => contractTerm === 0 && setShowEndDatePicker(true)} 
            style={[styles.dropdownButton, contractTerm !== 0 && { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' }]}
          >
            <Text style={[styles.dropdownButtonText, contractTerm !== 0 && { color: '#64748b' }]}>
              {endDate || 'Chọn ngày hết hạn'}
            </Text>
            <MaterialIcons name={contractTerm !== 0 ? "lock-outline" : "calendar-today"} size={20} color="#a1a1aa" />
          </Pressable>
          {contractTerm === 0 && showEndDatePicker && (
            <DateTimePicker
              value={parseDate(endDate)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowEndDatePicker(false);
                if (selectedDate) {
                  setEndDate(formatDate(selectedDate));
                }
              }}
            />
          )}

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
          <Pressable onPress={() => setShowPaidDatePicker(true)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{paidUntilDate || 'Chọn ngày'}</Text>
            <MaterialIcons name="calendar-today" size={20} color="#a1a1aa" />
          </Pressable>
          {showPaidDatePicker && (
            <DateTimePicker
              value={parseDate(paidUntilDate)}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowPaidDatePicker(false);
                if (selectedDate) {
                  setPaidUntilDate(formatDate(selectedDate));
                }
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Tạo hợp đồng</Text>
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
    paddingBottom: 100,
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
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  photoUploadCard: {
    flex: 1,
    height: 120,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  photoPlaceholderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  photoUploadTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  photoUploadSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  cccdPreview: {
    width: '100%',
    height: '100%',
  },
  cccdOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  cccdOverlayText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  dropdownSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 12,
    gap: 8,
  },
  dropdownSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: theme.colors.onSurface,
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
  emptyDropdown: {
    padding: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  emptyDropdownText: {
    padding: 16,
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 13,
  },
  bottomBar: {
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CreateContract;
