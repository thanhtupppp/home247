import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  Switch, Alert, ActivityIndicator, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getProvinceNames, getWardNamesByProvinceName } from '../data/vietnameseAddress';

const ALL_PROVINCES = getProvinceNames();

interface Building { id: string; name: string; }
interface Room { id: string; code: string; buildingId: string; }

export const CreateTenant: React.FC = () => {
  const navigation = useNavigation<any>();

  // ── Loading / Saving ───────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = React.useState(true);
  const [loadingRooms, setLoadingRooms] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // ── Basic Info ─────────────────────────────────────────────────────────────
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [cccd, setCccd] = React.useState('');
  const [cccdFront, setCccdFront] = React.useState<string | null>(null);
  const [cccdBack, setCccdBack] = React.useState<string | null>(null);
  const [gender, setGender] = React.useState<'Nam' | 'Nữ' | 'Khác'>('Nam');

  // ── CCCD Photo Picker ──────────────────────────────────────────────────────
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

  // ── Apartment (from Firestore) ─────────────────────────────────────────────
  const [buildings, setBuildings] = React.useState<Building[]>([]);
  const [rooms, setRooms] = React.useState<Room[]>([]);

  const [selectedBuilding, setSelectedBuilding] = React.useState<Building | null>(null);
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [selectedRoom, setSelectedRoom] = React.useState<Room | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  const [moveInDate, setMoveInDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // ── Address (Vietnamese Provinces Database) ────────────────────────────────
  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = React.useState(false);
  const [provinceSearch, setProvinceSearch] = React.useState('');

  const [selectedWard, setSelectedWard] = React.useState('');
  const [showWardDropdown, setShowWardDropdown] = React.useState(false);
  const [wardSearch, setWardSearch] = React.useState('');

  const [detailAddress, setDetailAddress] = React.useState('');

  // ── Options ────────────────────────────────────────────────────────────────
  const [sendInvite, setSendInvite] = React.useState(true);
  const [receiveNotif, setReceiveNotif] = React.useState(true);
  const [primaryContact, setPrimaryContact] = React.useState(true);

  // ── Computed address lists ─────────────────────────────────────────────────
  const filteredProvinces = React.useMemo(() => {
    if (!provinceSearch.trim()) return ALL_PROVINCES;
    const q = provinceSearch.toLowerCase();
    return ALL_PROVINCES.filter((p) => p.toLowerCase().includes(q));
  }, [provinceSearch]);

  const allWards = React.useMemo(
    () => (selectedProvince ? getWardNamesByProvinceName(selectedProvince) : []),
    [selectedProvince]
  );

  const filteredWards = React.useMemo(() => {
    if (!wardSearch.trim()) return allWards;
    const q = wardSearch.toLowerCase();
    return allWards.filter((w) => w.toLowerCase().includes(q));
  }, [allWards, wardSearch]);

  // ── Fetch buildings on mount ───────────────────────────────────────────────
  React.useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoadingBuildings(true);
      const snap = await getDocs(query(collection(db, 'buildings'), orderBy('name')));
      const list: Building[] = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
      setBuildings(list);
    } catch (err) {
      console.error('Error fetching buildings:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách nhà.');
    } finally {
      setLoadingBuildings(false);
    }
  };

  // ── Fetch rooms when building selected ────────────────────────────────────
  const fetchRooms = async (buildingId: string) => {
    try {
      setLoadingRooms(true);
      setRooms([]);
      setSelectedRoom(null);
      const snap = await getDocs(
        query(collection(db, 'rooms'), where('buildingId', '==', buildingId), orderBy('code'))
      );
      const list: Room[] = snap.docs.map((d) => ({
        id: d.id,
        code: d.data().code,
        buildingId: d.data().buildingId,
      }));
      setRooms(list);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng.');
    } finally {
      setLoadingRooms(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectBuilding = (b: Building) => {
    setSelectedBuilding(b);
    setSelectedRoom(null);
    setShowBuildingDropdown(false);
    fetchRooms(b.id);
  };

  const handleSelectProvince = (p: string) => {
    setSelectedProvince(p);
    setSelectedWard('');
    setShowProvinceDropdown(false);
    setProvinceSearch('');
  };

  const handleSelectWard = (w: string) => {
    setSelectedWard(w);
    setShowWardDropdown(false);
    setWardSearch('');
  };

  // ── Save to Firestore ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập họ và tên.');
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
      Alert.alert('Thông báo', 'Vui lòng chọn phòng/căn hộ.');
      return;
    }

    try {
      setSaving(true);
      const tenantData = {
        // Basic
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        dob: dob.trim(),
        cccd: cccd.trim(),
        cccdFront: cccdFront ?? '',
        cccdBack: cccdBack ?? '',
        gender,
        // Apartment
        buildingId: selectedBuilding.id,
        buildingName: selectedBuilding.name,
        roomId: selectedRoom.id,
        roomCode: selectedRoom.code,
        moveInDate: moveInDate.trim(),
        notes: notes.trim(),
        // Address
        province: selectedProvince,
        ward: selectedWard,
        detailAddress: detailAddress.trim(),
        // Options
        sendInvite,
        receiveNotif,
        primaryContact,
        // Meta
        status: 'active',
        createdAt: new Date(),
        createdBy: auth.currentUser?.uid || 'system',
      };

      await addDoc(collection(db, 'tenants'), tenantData);

      // Update room status to occupied
      const roomRef = doc(db, 'rooms', selectedRoom.id);
      await updateDoc(roomRef, { status: 'occupied' });

      Alert.alert('Thành công', `Đã thêm cư dân ${fullName.trim()} thành công!`);
      navigation.goBack();
    } catch (err) {
      console.error('Error saving tenant:', err);
      Alert.alert('Lỗi', 'Không thể lưu thông tin cư dân.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm cư dân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section 1: Thông tin cơ bản ──────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <Text style={styles.label}>Họ và tên <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập họ tên đầy đủ"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="phone" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="09xx xxx ..."
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 14 }]}>Email</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail-outline" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="ten@em..."
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 14 }]}>Ngày sinh</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="calendar-today" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="dd/mm/yyyy"
                  value={dob}
                  onChangeText={setDob}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 14 }]}>CCCD/CMND</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="badge" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Số CCCD"
                  keyboardType="numeric"
                  value={cccd}
                  onChangeText={setCccd}
                />
              </View>
            </View>
          </View>

          {/* CCCD photo */}
          <Text style={[styles.label, { marginTop: 14 }]}>Ảnh CCCD/CMND</Text>
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
                  <View style={styles.photoUploadCircle}>
                    <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoUploadTitle}>Mặt trước</Text>
                  <Text style={styles.photoUploadSubtext}>Chạm để tải lên</Text>
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
                  <View style={styles.photoUploadCircle}>
                    <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoUploadTitle}>Mặt sau</Text>
                  <Text style={styles.photoUploadSubtext}>Chạm để tải lên</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Gender */}
          <Text style={[styles.label, { marginTop: 14 }]}>Giới tính</Text>
          <View style={styles.genderRow}>
            {(['Nam', 'Nữ', 'Khác'] as const).map((g) => {
              const isSelected = gender === g;
              return (
                <Pressable
                  key={g}
                  style={[styles.genderPill, isSelected && styles.genderPillActive]}
                  onPress={() => setGender(g)}
                >
                  {isSelected && <MaterialIcons name="check" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                  <Text style={[styles.genderText, isSelected && styles.genderTextActive]}>{g}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Section 2: Căn hộ (Firestore) ────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Căn hộ</Text>

          <View style={styles.row}>
            {/* Building dropdown */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Nhà <Text style={styles.required}>*</Text></Text>
              {loadingBuildings ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : (
                <View>
                  <Pressable
                    onPress={() => setShowBuildingDropdown(!showBuildingDropdown)}
                    style={styles.dropdownButton}
                  >
                    <Text style={styles.dropdownButtonText} numberOfLines={1}>
                      {selectedBuilding?.name || 'Chọn tòa nhà'}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#a1a1aa" />
                  </Pressable>
                  {showBuildingDropdown && (
                    <View style={styles.dropdown}>
                      {buildings.length === 0 ? (
                        <Text style={styles.emptyDropdown}>Chưa có nhà nào</Text>
                      ) : (
                        buildings.map((b) => (
                          <Pressable key={b.id} style={styles.dropdownItem} onPress={() => handleSelectBuilding(b)}>
                            <Text style={styles.dropdownItemText}>{b.name}</Text>
                          </Pressable>
                        ))
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Room dropdown */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Phòng <Text style={styles.required}>*</Text></Text>
              {loadingRooms ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
              ) : !selectedBuilding ? (
                <View style={styles.disabledDropdown}>
                  <Text style={styles.disabledText}>Chọn nhà trước</Text>
                </View>
              ) : (
                <View>
                  <Pressable
                    onPress={() => setShowRoomDropdown(!showRoomDropdown)}
                    style={styles.dropdownButton}
                  >
                    <Text style={styles.dropdownButtonText} numberOfLines={1}>
                      {selectedRoom?.code || 'Chọn phòng'}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={20} color="#a1a1aa" />
                  </Pressable>
                  {showRoomDropdown && (
                    <View style={styles.dropdown}>
                      {rooms.length === 0 ? (
                        <Text style={styles.emptyDropdown}>Nhà này chưa có phòng</Text>
                      ) : (
                        rooms.map((r) => (
                          <Pressable key={r.id} style={styles.dropdownItem} onPress={() => { setSelectedRoom(r); setShowRoomDropdown(false); }}>
                            <Text style={styles.dropdownItemText}>{r.code}</Text>
                          </Pressable>
                        ))
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 14 }]}>Ngày vào ở</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="calendar-today" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="dd/mm/yyyy"
                  value={moveInDate}
                  onChangeText={setMoveInDate}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { marginTop: 14 }]}>Ghi chú</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="description" size={20} color="#94a3b8" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ghi chú thêm..."
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── Section 3: Địa chỉ thường trú ────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Địa chỉ thường trú</Text>

          {/* Province */}
          <Text style={styles.label}>Tỉnh/Thành phố</Text>
          <Pressable
            onPress={() => { setShowProvinceDropdown(!showProvinceDropdown); setProvinceSearch(''); }}
            style={styles.dropdownButton}
          >
            <Text style={styles.dropdownButtonText} numberOfLines={1}>
              {selectedProvince || 'Chọn tỉnh/thành'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={20} color="#a1a1aa" />
          </Pressable>
          {showProvinceDropdown && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm tỉnh/thành..."
                value={provinceSearch}
                onChangeText={setProvinceSearch}
                autoFocus
              />
              <ScrollView style={styles.dropdownScrollable} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {filteredProvinces.length === 0 ? (
                  <Text style={styles.emptyDropdown}>Không tìm thấy kết quả</Text>
                ) : (
                  filteredProvinces.map((p) => (
                    <Pressable key={p} style={styles.dropdownItem} onPress={() => handleSelectProvince(p)}>
                      <Text style={styles.dropdownItemText}>{p}</Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* Ward */}
          <Text style={[styles.label, { marginTop: 14 }]}>Phường/Xã</Text>
          {!selectedProvince ? (
            <View style={styles.infoBanner}>
              <MaterialIcons name="info-outline" size={15} color="#64748b" />
              <Text style={styles.infoBannerText}>Vui lòng chọn tỉnh/thành trước</Text>
            </View>
          ) : (
            <View>
              <Pressable
                onPress={() => { setShowWardDropdown(!showWardDropdown); setWardSearch(''); }}
                style={styles.dropdownButton}
              >
                <Text style={styles.dropdownButtonText} numberOfLines={1}>
                  {selectedWard || 'Chọn phường/xã'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#a1a1aa" />
              </Pressable>
              {showWardDropdown && (
                <View style={styles.dropdown}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm phường/xã..."
                    value={wardSearch}
                    onChangeText={setWardSearch}
                    autoFocus
                  />
                  <ScrollView style={styles.dropdownScrollable} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                    {filteredWards.length === 0 ? (
                      <Text style={styles.emptyDropdown}>Không tìm thấy kết quả</Text>
                    ) : (
                      filteredWards.map((w) => (
                        <Pressable key={w} style={styles.dropdownItem} onPress={() => handleSelectWard(w)}>
                          <Text style={styles.dropdownItemText}>{w}</Text>
                        </Pressable>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Detail */}
          <Text style={[styles.label, { marginTop: 14 }]}>Số nhà, tên đường</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="home" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="VD: 123 Nguyễn Văn A..."
              value={detailAddress}
              onChangeText={setDetailAddress}
            />
          </View>
        </View>

        {/* ── Section 4: Hợp đồng ──────────────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Hợp đồng</Text>
          <Pressable style={styles.pdfUploadCard}>
            <View style={styles.pdfIconCircle}>
              <MaterialIcons name="picture-as-pdf" size={24} color="#3b82f6" />
            </View>
            <Text style={styles.pdfUploadTitle}>Tải lên hợp đồng</Text>
            <Text style={styles.pdfUploadSubtext}>Chọn file PDF (tối đa 10MB)</Text>
          </Pressable>
        </View>

        {/* ── Section 5: Tuỳ chọn ──────────────────────────────────────────── */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Tuỳ chọn</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Gửi lời mời đăng nhập</Text>
              <Text style={styles.switchSubtitle}>Gửi SMS/Email để cư dân tự kích hoạt tài khoản.</Text>
            </View>
            <Switch value={sendInvite} onValueChange={setSendInvite} trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }} />
          </View>

          <View style={[styles.switchRow, { marginTop: 16 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Nhận thông báo</Text>
              <Text style={styles.switchSubtitle}>Cho phép cư dân nhận cập nhật khi có xử lý.</Text>
            </View>
            <Switch value={receiveNotif} onValueChange={setReceiveNotif} trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }} />
          </View>

          <View style={[styles.switchRow, { marginTop: 16 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Đặt làm liên hệ chính</Text>
              <Text style={styles.switchSubtitle}>Sử dụng số điện thoại này cho thông báo và OTP.</Text>
            </View>
            <Switch value={primaryContact} onValueChange={setPrimaryContact} trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }} />
          </View>
        </View>

        {/* ── Buttons ───────────────────────────────────────────────────────── */}
        <View style={styles.actionContainer}>
          <Pressable style={styles.submitBtn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="check" size={22} color={theme.colors.onPrimary} />
                <Text style={styles.submitBtnText}>Thêm cư dân</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold' },
  scrollContent: { padding: theme.spacing.marginMobile, gap: 16, paddingBottom: 40 },
  cardSection: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: { ...theme.typography.titleLg, color: theme.colors.onSurface, fontWeight: 'bold', marginBottom: 16 },
  label: { ...theme.typography.labelMd, color: theme.colors.onSurfaceVariant, fontWeight: 'bold', marginBottom: 8 },
  required: { color: '#ef4444' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 10,
  },
  textInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: theme.colors.onSurface },
  row: { flexDirection: 'row', gap: 12 },

  // Dropdowns
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownButtonText: { ...theme.typography.bodyMd, color: theme.colors.onSurface, flex: 1 },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownScrollable: { maxHeight: 200 },
  searchInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    fontSize: 14,
    color: theme.colors.onSurface,
    backgroundColor: '#f8fafc',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  dropdownItemText: { ...theme.typography.bodyMd, color: theme.colors.onSurface },
  emptyDropdown: { padding: 16, color: '#94a3b8', textAlign: 'center', fontSize: 13 },
  disabledDropdown: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#f8fafc',
  },
  disabledText: { ...theme.typography.bodyMd, color: '#94a3b8' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  loadingText: { fontSize: 13, color: theme.colors.onSurfaceVariant },

  // Address helpers
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  infoBannerText: { ...theme.typography.bodyMd, color: '#64748b', fontSize: 13 },

  // CCCD Photos
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
    overflow: 'hidden',
    minHeight: 110,
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
  photoUploadCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  photoUploadTitle: { ...theme.typography.bodyMd, fontWeight: 'bold', color: theme.colors.onSurface },
  photoUploadSubtext: { fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 2 },

  // Gender
  genderRow: { flexDirection: 'row', gap: 12 },
  genderPill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f1f5f9', borderRadius: theme.borderRadius.xl,
    paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: '#e2e8f0',
  },
  genderPillActive: { backgroundColor: '#eff6ff', borderColor: theme.colors.primary },
  genderText: { ...theme.typography.bodyMd, color: '#64748b', fontWeight: 'bold' },
  genderTextActive: { color: theme.colors.primary },

  // Contract
  pdfUploadCard: {
    borderWidth: 1, borderColor: '#dbeafe', borderRadius: theme.borderRadius.xl,
    borderStyle: 'dashed', backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 24, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  pdfIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  pdfUploadTitle: { ...theme.typography.bodyLg, fontWeight: 'bold', color: theme.colors.onSurface },
  pdfUploadSubtext: { fontSize: 12, color: theme.colors.onSurfaceVariant },

  // Options
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  switchTextContainer: { flex: 1, gap: 2 },
  switchTitle: { ...theme.typography.bodyMd, fontWeight: 'bold', color: theme.colors.onSurface },
  switchSubtitle: { fontSize: 12, color: theme.colors.onSurfaceVariant },

  // Buttons
  actionContainer: { gap: 16, marginTop: 8 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer, borderRadius: theme.borderRadius.xl,
    paddingVertical: 14, gap: 8,
  },
  submitBtnText: { ...theme.typography.bodyLg, color: theme.colors.onPrimary, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  cancelBtnText: { ...theme.typography.bodyLg, color: theme.colors.onSurfaceVariant, fontWeight: 'bold' },
});

export default CreateTenant;
