import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const BUILDINGS = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
const ROOMS = ['p1', 'p2', 'p3', 'p4', 'p5'];
const CYCLES = ['1 tháng', '2 tháng', '3 tháng', '6 tháng', '12 tháng'];

export const CreateContract: React.FC = () => {
  const navigation = useNavigation();

  // Tenant Information
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [addressNote, setAddressNote] = React.useState('');

  // Contract Information
  const [selectedBuilding, setSelectedBuilding] = React.useState('');
  const [selectedRoom, setSelectedRoom] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  const [startDate, setStartDate] = React.useState('');
  const [signDate] = React.useState('11/07/2026');
  const [endDate, setEndDate] = React.useState('');
  const [rentPrice, setRentPrice] = React.useState('');
  const [depositPrice, setDepositPrice] = React.useState('');

  const [selectedCycle, setSelectedCycle] = React.useState('');
  const [showCycleDropdown, setShowCycleDropdown] = React.useState(false);
  const [collectionDay, setCollectionDay] = React.useState('');
  const [paidUntilDate, setPaidUntilDate] = React.useState('');

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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          
          {/* Section 1: Thông tin khách thuê */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="person-outline" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin khách thuê</Text>
          </View>

          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại</Text>
          <TextInput
            style={styles.textInput}
            placeholder="09xx xxx xxx"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Địa chỉ (Ghi chú)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Nhập địa chỉ hoặc ghi chú (tùy chọn)"
            multiline
            numberOfLines={3}
            value={addressNote}
            onChangeText={setAddressNote}
          />

          {/* Section 2: Căn cước công dân */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="credit-card" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Căn cước công dân</Text>
          </View>

          <View style={styles.row}>
            <Pressable style={styles.photoUploadCard}>
              <View style={styles.photoUploadCircle}>
                <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.photoUploadTitle}>Mặt trước</Text>
              <Text style={styles.photoUploadSubtext}>Chạm để chụp</Text>
            </Pressable>

            <Pressable style={styles.photoUploadCard}>
              <View style={styles.photoUploadCircle}>
                <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.photoUploadTitle}>Mặt sau</Text>
              <Text style={styles.photoUploadSubtext}>Chạm để chụp</Text>
            </Pressable>
          </View>

          {/* Section 3: Thông tin hợp đồng */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="description" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
          </View>

          <Text style={styles.label}>Tòa nhà</Text>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBuilding || 'Chọn tòa nhà'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showBuildingDropdown && (
            <View style={styles.dropdown}>
              {BUILDINGS.map((b) => (
                <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b); setShowBuildingDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{b}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>Phòng</Text>
          {!selectedBuilding ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Vui lòng chọn toà nhà trước</Text>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedRoom || 'Chọn phòng'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showRoomDropdown && (
                <View style={styles.dropdown}>
                  {ROOMS.map((r) => (
                    <Pressable key={r} style={styles.dropdownItem} onPress={() => { setSelectedRoom(r); setShowRoomDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 14 }]}>Ngày bắt đầu hợp đồng</Text>
          <Pressable style={styles.datePicker}>
            <MaterialIcons name="calendar-today" size={18} color="#64748b" />
            <Text style={styles.datePickerText}>{startDate || 'Chọn ngày bắt đầu'}</Text>
          </Pressable>

          <Text style={[styles.label, { marginTop: 14 }]}>Ngày ký hợp đồng</Text>
          <Pressable style={styles.datePicker}>
            <MaterialIcons name="calendar-today" size={18} color="#64748b" />
            <Text style={styles.datePickerText}>{signDate}</Text>
          </Pressable>

          <Text style={[styles.label, { marginTop: 14 }]}>Hạn hợp đồng</Text>
          <Pressable style={styles.datePicker}>
            <MaterialIcons name="calendar-today" size={18} color="#64748b" />
            <Text style={styles.datePickerText}>{endDate || 'Chọn ngày hết hạn'}</Text>
          </Pressable>

          <Text style={[styles.label, { marginTop: 14 }]}>Tiền phòng</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 5.500.000"
            keyboardType="numeric"
            value={rentPrice}
            onChangeText={setRentPrice}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Tiền cọc (Tùy chọn)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 5.500.000"
            keyboardType="numeric"
            value={depositPrice}
            onChangeText={setDepositPrice}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Chu kỳ trả tiền phòng</Text>
          <Pressable onPress={() => setShowCycleDropdown(!showCycleDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedCycle || 'Chọn chu kỳ'}</Text>
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

          <Text style={[styles.label, { marginTop: 14 }]}>Ngày thu tiền phòng</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập ngày (1-31)"
            keyboardType="numeric"
            value={collectionDay}
            onChangeText={setCollectionDay}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Đã trả đến ngày (Tùy chọn)</Text>
          <Pressable style={styles.datePicker}>
            <MaterialIcons name="calendar-today" size={18} color="#64748b" />
            <Text style={styles.datePickerText}>{paidUntilDate || 'Chọn ngày đã trả đến'}</Text>
          </Pressable>

          {/* Section 4: Thiết bị */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="router" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thiết bị</Text>
          </View>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Vui lòng chọn phòng để xem danh sách thiết bị</Text>
          </View>

          {/* Section 5: Dịch vụ */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="payments" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Dịch vụ</Text>
          </View>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Vui lòng chọn toà nhà để xem dịch vụ</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Tạo hợp đồng</Text>
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
  banner: {
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerText: {
    ...theme.typography.bodyMd,
    color: '#64748b',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  datePickerText: {
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
});

export default CreateContract;
