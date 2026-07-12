import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, ActivityIndicator, Alert, FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, runTransaction } from 'firebase/firestore';
import { db, auth, functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { Image } from 'expo-image';

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
  cccdFront?: string;
  cccdBack?: string;
  dob?: string;
  gender?: string;
  detailAddress?: string;
  ward?: string;
  district?: string;
  province?: string;
}

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

  const [loadingBuildings, setLoadingBuildings] = React.useState(true);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [scanningContract, setScanningContract] = React.useState(false);

  const handleScanContract = async () => {
    // 1. Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để quét tài liệu hợp đồng.');
      return;
    }

    // 2. Launch Image Picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    try {
      setScanningContract(true);
      const scanner = httpsCallable(functions, 'summarizeContract');
      const res = await scanner({ contractDocBase64: result.assets[0].base64 });
      const resData = res.data as any;

      if (resData) {
        Alert.alert(
          'Đọc thành công',
          'AI đã trích xuất được thông tin từ hợp đồng. Bạn có muốn tự động điền các thông tin này?',
          [
            { text: 'Hủy', style: 'cancel' },
            { 
              text: 'Đồng ý', 
              onPress: () => {
                if (resData.tenantName) setFullName(resData.tenantName);
                if (resData.phoneNumber) setPhoneNumber(resData.phoneNumber);
                if (resData.rentPrice) setRentPrice(String(resData.rentPrice));
                if (resData.depositPrice) setDepositPrice(String(resData.depositPrice));
                if (resData.startDate) setStartDate(resData.startDate);
                if (resData.endDate) setEndDate(resData.endDate);
              } 
            }
          ]
        );
      }
    } catch (err) {
      console.error('Error scanning contract:', err);
      Alert.alert('Lỗi', 'Không thể kết nối dịch vụ AI trích xuất hợp đồng. Vui lòng nhập tay.');
    } finally {
      setScanningContract(false);
    }
  };

  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = React.useState<Tenant | null>(null);
  const [showTenantDropdown, setShowTenantDropdown] = React.useState(false);
  const [tenantSearch, setTenantSearch] = React.useState('');

  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [addressNote, setAddressNote] = React.useState('');

  const [cccdFront, setCccdFront] = React.useState<string | null>(null);
  const [cccdBack, setCccdBack] = React.useState<string | null>(null);

  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);

  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  const [startDate, setStartDate] = React.useState(() => formatDate(new Date()));
  const [signDate] = React.useState(() => formatDate(new Date()));
  const [endDate, setEndDate] = React.useState('');
  const [rentPrice, setRentPrice] = React.useState('');
  const [depositPrice, setDepositPrice] = React.useState('');

  const [selectedCycle, setSelectedCycle] = React.useState('1 tháng');
  const [showCycleDropdown, setShowCycleDropdown] = React.useState(false);
  const [collectionDay, setCollectionDay] = React.useState('05');
  const [paidUntilDate, setPaidUntilDate] = React.useState(() => formatDate(new Date()));

  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const [showPaidDatePicker, setShowPaidDatePicker] = React.useState(false);

  const [contractTerm, setContractTerm] = React.useState<number>(12);
  const [showTermDropdown, setShowTermDropdown] = React.useState(false);

  const updateContractTerm = (term: number) => {
    setContractTerm(term);
    if (term !== 0) {
      setEndDate(calculateEndDate(startDate, term));
    }
    setShowTermDropdown(false);
  };

  React.useEffect(() => {
    fetchBuildings();
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDocs(query(collection(db, 'tenants'), where('ownerId', '==', uid)));
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        fullName: doc.data().fullName || '',
        phoneNumber: doc.data().phoneNumber || '',
        buildingId: doc.data().buildingId,
        roomId: doc.data().roomId,
        cccdFront: doc.data().cccdFront,
        cccdBack: doc.data().cccdBack,
      }));
      // Sort tenants by name in memory
      list.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setTenants(list);
    } catch (err) {
      console.error('Error fetching tenants list:', err);
    }
  };

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const snap = await getDocs(query(collection(db, 'buildings'), where('ownerId', '==', uid)));
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setBuildings(list);
    } catch (err) {
      console.error('Error fetching buildings:', err);
    } finally {
      setLoadingBuildings(false);
    }
  };

  const fetchRooms = async (buildingId: string) => {
    try {
      setLoadingRooms(true);
      const uid = auth.currentUser?.uid;
      if (!uid) return [];
      const snap = await getDocs(
        query(collection(db, 'rooms'), where('ownerId', '==', uid), where('buildingId', '==', buildingId))
      );
      const list = snap.docs
        .map((d) => ({
          id: d.id,
          code: d.data().code,
          price: d.data().price ? Number(d.data().price) : undefined,
          status: d.data().status,
        }))
        .filter((r) => r.status === 'empty'); // Only vacant rooms can be selected for new contracts
      setRooms(list);
      return list;
    } catch (err) {
      console.error('Error fetching rooms:', err);
      return [];
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSelectTenant = async (t: Tenant) => {
    setSelectedTenant(t);
    setShowTenantDropdown(false);
    setFullName(t.fullName);
    setPhoneNumber(t.phoneNumber);
    setCccdFront(t.cccdFront || null);
    setCccdBack(t.cccdBack || null);
  };

  const handleClearTenantSelection = () => {
    setSelectedTenant(null);
    setShowTenantDropdown(false);
    setFullName('');
    setPhoneNumber('');
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
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert('Lỗi', 'Phiên đăng nhập đã hết hạn.');
        setSaving(false);
        return;
      }
      
      const parsedRent = Number(rentPrice.replace(/[^0-9]/g, '')) || 0;
      const parsedDeposit = Number(depositPrice.replace(/[^0-9]/g, '')) || 0;

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
        createdBy: uid,
        ownerId: uid,
      };

      await runTransaction(db, async (transaction) => {
        // Double check room status is empty
        const roomRef = doc(db, 'rooms', selectedRoom.id);
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) {
          throw new Error('ROOM_NOT_FOUND');
        }
        if (roomSnap.data().status !== 'empty') {
          throw new Error('ROOM_NOT_AVAILABLE');
        }

        // 1. Add contract document
        const contractRef = doc(collection(db, 'contracts'));
        transaction.set(contractRef, contractData);

        // 2. Create or update tenant doc
        if (selectedTenant) {
          const tenantRef = doc(db, 'tenants', selectedTenant.id);
          transaction.update(tenantRef, {
            buildingId: selectedBuilding.id,
            buildingName: selectedBuilding.name,
            roomId: selectedRoom.id,
            roomCode: selectedRoom.code,
            moveInDate: startDate,
            contractEndDate: endDate,
            contractId: contractRef.id,
            cccdFront: cccdFront ?? selectedTenant.cccdFront ?? '',
            cccdBack: cccdBack ?? selectedTenant.cccdBack ?? '',
          });
        } else {
          const tenantData = {
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            cccdFront: cccdFront ?? '',
            cccdBack: cccdBack ?? '',
            buildingId: selectedBuilding.id,
            buildingName: selectedBuilding.name,
            roomId: selectedRoom.id,
            roomCode: selectedRoom.code,
            moveInDate: startDate,
            contractEndDate: endDate,
            contractId: contractRef.id,
            status: 'active',
            createdAt: new Date(),
            createdBy: uid,
            ownerId: uid,
          };
          const tenantRef = doc(collection(db, 'tenants'));
          transaction.set(tenantRef, tenantData);
        }

        // 3. Update room status to occupied
        transaction.update(roomRef, {
          status: 'occupied',
          price: parsedRent,
        });
      });

      Alert.alert('Thành công', 'Đã tạo hợp đồng và lưu thông tin cư dân thành công!');
      navigation.goBack();
    } catch (err: any) {
      console.error('Error creating contract:', err);
      if (err.message === 'ROOM_NOT_AVAILABLE') {
        Alert.alert('Lỗi', 'Phòng này đã có cư dân khác đang ở. Vui lòng chọn phòng trống khác.');
      } else {
        Alert.alert('Lỗi', 'Không thể tạo hợp đồng mới.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo hợp đồng mới</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* AI Scanner Header Action */}
          <View style={styles.aiScanCard}>
            <View style={styles.aiScanHeader}>
              <MaterialIcons name="auto-awesome" size={20} color={theme.colors.primary} />
              <Text style={styles.aiScanTitle}>Trợ lý AI lập hợp đồng nhanh</Text>
            </View>
            <Text style={styles.aiScanSubtitle}>
              Chọn ảnh chụp hợp đồng để AI tự động điền các thông tin như Tên, SĐT, giá phòng, tiền cọc và thời hạn.
            </Text>
            <Pressable 
              style={styles.aiScanBtn}
              onPress={handleScanContract}
              disabled={scanningContract}
            >
              {scanningContract ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialIcons name="photo-camera" size={18} color="#ffffff" />
                  <Text style={styles.aiScanBtnText}>Chọn ảnh quét hợp đồng</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin khách thuê</Text>
          </View>

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
                <FlatList
                    style={{ maxHeight: 180 }}
                    nestedScrollEnabled
                    data={filteredTenants}
                    keyExtractor={(t) => t.id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: t }) => (
                      <Pressable style={styles.dropdownItem} onPress={() => handleSelectTenant(t)}>
                        <Text style={styles.dropdownItemText}>{t.fullName} ({t.phoneNumber})</Text>
                      </Pressable>
                    )}
                />
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
          <TextInput style={styles.textInput} placeholder="Nhập họ và tên" value={fullName} onChangeText={setFullName} editable={!selectedTenant} />

          <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại *</Text>
          <TextInput style={styles.textInput} placeholder="09xx xxx xxx" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} editable={!selectedTenant} />

          <Text style={[styles.label, { marginTop: 14 }]}>Địa chỉ / Ghi chú</Text>
          <TextInput style={[styles.textInput, styles.textArea]} placeholder="Nhập địa chỉ hoặc ghi chú" value={addressNote} onChangeText={setAddressNote} multiline numberOfLines={3} />

          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="credit-card" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Căn cước công dân</Text>
          </View>

          <View style={styles.row}>
            <Pressable style={styles.photoUploadCard} onPress={() => pickCccdImage('front')}>
              {cccdFront ? <Image source={{ uri: cccdFront }} style={styles.cccdPreview} /> : <View style={styles.photoPlaceholderCircle}><MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} /></View>}
            </Pressable>
            <Pressable style={styles.photoUploadCard} onPress={() => pickCccdImage('back')}>
              {cccdBack ? <Image source={{ uri: cccdBack }} style={styles.cccdPreview} /> : <View style={styles.photoPlaceholderCircle}><MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} /></View>}
            </Pressable>
          </View>

          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="domain" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin phòng & Hợp đồng</Text>
          </View>

          <Text style={styles.label}>Tòa nhà</Text>
          <View style={{ zIndex: 30, marginBottom: 12 }}>
            <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{selectedBuilding?.name || 'Chọn tòa nhà'}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
            </Pressable>
            {showBuildingDropdown && (
              <View style={styles.dropdown}>
                <FlatList data={buildings} keyExtractor={(b) => b.id} renderItem={({item}) => <Pressable style={styles.dropdownItem} onPress={() => handleSelectBuilding(item)}><Text style={styles.dropdownItemText}>{item.name}</Text></Pressable>} />
              </View>
            )}
          </View>

          <Text style={styles.label}>Phòng / Căn hộ</Text>
          <View style={{ zIndex: 20, marginBottom: 12 }}>
            <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{selectedRoom?.code || 'Chọn phòng'}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
            </Pressable>
            {showRoomDropdown && (
              <View style={styles.dropdown}>
                <FlatList data={rooms} keyExtractor={(r) => r.id} renderItem={({item}) => <Pressable style={styles.dropdownItem} onPress={() => handleSelectRoom(item)}><Text style={styles.dropdownItemText}>Phòng {item.code}</Text></Pressable>} />
              </View>
            )}
          </View>

          <Text style={[styles.label, { marginTop: 14 }]}>Ngày bắt đầu hợp đồng</Text>
          <Pressable onPress={() => setShowStartDatePicker(true)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{startDate}</Text>
            <MaterialIcons name="calendar-today" size={20} color="#a1a1aa" />
          </Pressable>
          {showStartDatePicker && <DateTimePicker value={parseDate(startDate)} mode="date" onChange={(e, d) => { setShowStartDatePicker(false); if(d) { const s = formatDate(d); setStartDate(s); if(contractTerm !== 0) setEndDate(calculateEndDate(s, contractTerm)); }}} />}

          <Text style={[styles.label, { marginTop: 14 }]}>Thời hạn hợp đồng</Text>
          <View style={{ zIndex: 10 }}>
            <Pressable onPress={() => setShowTermDropdown(!showTermDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{contractTerm === 6 ? '6 tháng' : contractTerm === 12 ? '12 tháng (1 năm)' : contractTerm === 24 ? '24 tháng (2 năm)' : 'Tự chọn ngày kết thúc'}</Text>
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
  aiScanCard: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 16,
  },
  aiScanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  aiScanTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  aiScanSubtitle: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  aiScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 10,
    gap: 8,
  },
  aiScanBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default CreateContract;
