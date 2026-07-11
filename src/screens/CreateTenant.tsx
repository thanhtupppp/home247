import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateTenant: React.FC = () => {
  const navigation = useNavigation();

  // Basic Info
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState<'Nam' | 'Nữ' | 'Khác'>('Nam');

  // Apartment Info
  const [selectedBuilding, setSelectedBuilding] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState('');
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);
  const [moveInDate, setMoveInDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Options
  const [sendInvite, setSendInvite] = React.useState(true);
  const [receiveNotif, setReceiveNotif] = React.useState(true);
  const [primaryContact, setPrimaryContact] = React.useState(true);

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const rooms = ['p1', 'p2', 'p3', 'p4', 'p5'];

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Thông tin cơ bản */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <Text style={styles.label}>Họ và tên</Text>
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
              <Text style={[styles.label, { marginTop: 14 }]}>Số điện thoại</Text>
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
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>
          </View>

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

          {/* CCCD Cards */}
          <Text style={[styles.label, { marginTop: 14 }]}>CCCD/CMND</Text>
          <View style={styles.row}>
            <Pressable style={styles.photoUploadCard}>
              <View style={styles.photoUploadCircle}>
                <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.photoUploadTitle}>Mặt trước</Text>
              <Text style={styles.photoUploadSubtext}>Chạm để tải lên</Text>
            </Pressable>

            <Pressable style={styles.photoUploadCard}>
              <View style={styles.photoUploadCircle}>
                <MaterialIcons name="add-a-photo" size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.photoUploadTitle}>Mặt sau</Text>
              <Text style={styles.photoUploadSubtext}>Chạm để tải lên</Text>
            </Pressable>
          </View>

          {/* Gender Selector */}
          <Text style={[styles.label, { marginTop: 14 }]}>Giới tính</Text>
          <View style={styles.genderRow}>
            {(['Nam', 'Nữ', 'Khác'] as const).map((g) => {
              const isSelected = gender === g;
              return (
                <Pressable
                  key={g}
                  style={[
                    styles.genderPill,
                    isSelected && styles.genderPillActive
                  ]}
                  onPress={() => setGender(g)}
                >
                  {isSelected && <MaterialIcons name="check" size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />}
                  <Text style={[styles.genderText, isSelected && styles.genderTextActive]}>
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Section 2: Căn hộ */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Căn hộ</Text>

          <View style={styles.row}>
            {/* Tòa nhà Select */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Nhà</Text>
              <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText} numberOfLines={1}>{selectedBuilding || 'Chọn tòa nhà'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#a1a1aa" />
              </Pressable>
              {showBuildingDropdown && (
                <View style={styles.dropdown}>
                  {buildings.map((b) => (
                    <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBuilding(b); setShowBuildingDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{b}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Căn hộ Select */}
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Căn hộ</Text>
              <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText} numberOfLines={1}>{selectedRoom || 'Chọn căn hộ'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#a1a1aa" />
              </Pressable>
              {showRoomDropdown && (
                <View style={styles.dropdown}>
                  {rooms.map((r) => (
                    <Pressable key={r} style={styles.dropdownItem} onPress={() => { setSelectedRoom(r); setShowRoomDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{r}</Text>
                    </Pressable>
                  ))}
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
                  placeholder="dd/mm/..."
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
                  placeholder="VD: Thẻ ..."
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Hợp đồng */}
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

        {/* Section 4: Tuỳ chọn */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Tuỳ chọn</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Gửi lời mời đăng nhập</Text>
              <Text style={styles.switchSubtitle}>Gửi SMS/Email để cư dân tự kích hoạt tài khoản.</Text>
            </View>
            <Switch
              value={sendInvite}
              onValueChange={setSendInvite}
              trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }}
            />
          </View>

          <View style={[styles.switchRow, { marginTop: 16 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Nhận thông báo</Text>
              <Text style={styles.switchSubtitle}>Cho phép cư dân nhận cập nhật khi có xử lý.</Text>
            </View>
            <Switch
              value={receiveNotif}
              onValueChange={setReceiveNotif}
              trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }}
            />
          </View>

          <View style={[styles.switchRow, { marginTop: 16 }]}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Đặt làm liên hệ chính</Text>
              <Text style={styles.switchSubtitle}>Sử dụng số điện thoại này cho thông báo và OTP.</Text>
            </View>
            <Switch
              value={primaryContact}
              onValueChange={setPrimaryContact}
              trackColor={{ true: theme.colors.primary, false: '#e2e8f0' }}
            />
          </View>
        </View>

        {/* Form Action Buttons */}
        <View style={styles.actionContainer}>
          <Pressable style={styles.submitBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="check" size={22} color={theme.colors.onPrimary} />
            <Text style={styles.submitBtnText}>Thêm cư dân</Text>
          </Pressable>
          <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </Pressable>
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
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
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
  },
  label: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
    marginBottom: 8,
  },
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
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
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
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  genderPillActive: {
    backgroundColor: '#eff6ff',
    borderColor: theme.colors.primary,
  },
  genderText: {
    ...theme.typography.bodyMd,
    color: '#64748b',
    fontWeight: 'bold',
  },
  genderTextActive: {
    color: theme.colors.primary,
  },
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    zIndex: 10,
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
  pdfUploadCard: {
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: theme.borderRadius.xl,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pdfIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfUploadTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  pdfUploadSubtext: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  switchTextContainer: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  switchSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  actionContainer: {
    gap: 16,
    marginTop: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  submitBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  cancelBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
    fontWeight: 'bold',
  },
});

export default CreateTenant;
