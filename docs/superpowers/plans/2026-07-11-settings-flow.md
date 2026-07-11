# Settings Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Thông tin tài khoản", "Chỉnh sửa thông tin", "Tài khoản ngân hàng", and bottom sheet modal according to user screenshots.

**Architecture:**
- Create `src/screens/SettingsScreen.tsx` containing the avatar card, 2x2 grid, edit button, bank accounts card, and modal overlay.
- Create `src/screens/EditProfile.tsx` containing DOB/city text inputs, and blue verification/saving buttons.
- Create `src/screens/AddBankAccount.tsx` containing bank select dropdown and details inputs.
- Update `App.tsx` navigation routes to hook up all screens.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Create SettingsScreen Screen

**Files:**
- Create: `src/screens/SettingsScreen.tsx`

- [ ] **Step 1: Create `src/screens/SettingsScreen.tsx`**

Write `SettingsScreen.tsx` to render:
- Header: back arrow, title "Thông tin tài khoản".
- Profile card: circle avatar with camera overlay (clicking toggles bottom sheet state), username "tu", phone number.
- Grid: 2x2 cards showing details.
- Edit info button navigating to `cai-dat/chinh-sua`.
- Bank Account card showing title, "Thêm" button (navigating to `cai-dat/ngan-hang`), and empty text.
- Modal overlay representing bottom sheet with photo camera options.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [showBottomSheet, setShowBottomSheet] = React.useState(false);

  const infoGrid = [
    { id: '1', label: 'Số điện thoại', value: '+8439643137', icon: 'phone' },
    { id: '2', label: 'CCCD', value: 'Chưa cập nhật', icon: 'badge' },
    { id: '3', label: 'Ngày sinh', value: 'Chưa cập nhật', icon: 'calendar-today' },
    { id: '4', label: 'Thành phố', value: 'Chưa cập nhật', icon: 'place' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={54} color="#cbd5e1" />
            </View>
            <Pressable style={styles.cameraOverlay} onPress={() => setShowBottomSheet(true)}>
              <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
            </Pressable>
          </View>
          <Text style={styles.username}>tu</Text>
          <View style={styles.phoneRow}>
            <MaterialIcons name="phone" size={16} color="#64748b" />
            <Text style={styles.phoneText}>+8439643137</Text>
          </View>
        </View>

        {/* Info Grid (2x2) */}
        <View style={styles.grid}>
          {infoGrid.map((item) => (
            <View key={item.id} style={styles.gridCard}>
              <View style={styles.iconCircle}>
                <MaterialIcons name={item.icon as any} size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.gridLabel}>{item.label}</Text>
              <Text style={styles.gridValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Edit Info Button */}
        <Pressable 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('cai-dat/chinh-sua')}
        >
          <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
          <Text style={styles.editBtnText}>Chỉnh sửa thông tin</Text>
        </Pressable>

        {/* Bank Accounts Section */}
        <View style={styles.bankSection}>
          <View style={styles.bankHeader}>
            <Text style={styles.bankTitle}>Tài khoản ngân hàng</Text>
            <Pressable onPress={() => navigation.navigate('cai-dat/ngan-hang')}>
              <Text style={styles.addBankText}>Thêm</Text>
            </Pressable>
          </View>
          <Text style={styles.bankEmptyText}>Chưa có tài khoản ngân hàng.</Text>
        </View>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowBottomSheet(false)}>
          <View style={styles.modalContent}>
            <View style={styles.sheetHandle} />
            
            <Pressable style={styles.sheetItem} onPress={() => setShowBottomSheet(false)}>
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetIconCircle}>
                  <MaterialIcons name="photo-camera" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.sheetItemTitle}>Chụp ảnh mới</Text>
                  <Text style={styles.sheetItemSubtitle}>Dùng camera để cập nhật nhanh</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={() => setShowBottomSheet(false)}>
              <View style={styles.sheetItemLeft}>
                <View style={styles.sheetIconCircle}>
                  <MaterialIcons name="image" size={20} color="#3b82f6" />
                </View>
                <View>
                  <Text style={styles.sheetItemTitle}>Chọn từ thư viện</Text>
                  <Text style={styles.sheetItemSubtitle}>Tải ảnh sẵn có lên máy chủ</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>

            <Pressable style={styles.sheetItem} onPress={() => setShowBottomSheet(false)}>
              <View style={styles.sheetItemLeft}>
                <View style={[styles.sheetIconCircle, { backgroundColor: '#fef2f2' }]}>
                  <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                </View>
                <View>
                  <Text style={[styles.sheetItemTitle, { color: '#ef4444' }]}>Gỡ ảnh đại diện</Text>
                  <Text style={styles.sheetItemSubtitle}>Quay về ảnh mặc định</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>
          </View>
        </Pressable>
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
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  username: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    fontSize: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
  },
  gridValue: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    gap: 8,
  },
  editBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bankSection: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 14,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  addBankText: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bankEmptyText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopLeftRadius: theme.borderRadius.xl * 2,
    borderTopRightRadius: theme.borderRadius.xl * 2,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: 40,
    paddingTop: 10,
    gap: 16,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 8,
  },
  sheetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  sheetItemSubtitle: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});

export default SettingsScreen;
```

---

### Task 2: Create EditProfile Screen

**Files:**
- Create: `src/screens/EditProfile.tsx`

- [ ] **Step 1: Create `src/screens/EditProfile.tsx`**

Write `EditProfile.tsx` to render:
- Header: back arrow, title "Chỉnh sửa thông tin".
- Section 1: Thông tin liên hệ
  - Ngày sinh: input, calendar icon.
  - Thành phố: input, location icon.
- Section 2: CCCD/CMND
  - Blue button: `Xác thực CCCD`.
  - Blue button: `Lưu thông tin`.
- Section 3: Cập nhật số điện thoại
  - Pressable card showing left phone icon, title, description, and chevron right.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const EditProfile: React.FC = () => {
  const navigation = useNavigation();

  const [dob, setDob] = React.useState('');
  const [city, setCity] = React.useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Section 1: Thông tin liên hệ */}
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <View style={styles.inputContainer}>
            <MaterialIcons name="calendar-today" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Ngày sinh"
              value={dob}
              onChangeText={setDob}
            />
          </View>

          <View style={[styles.inputContainer, { marginTop: 14 }]}>
            <MaterialIcons name="place" size={20} color="#94a3b8" />
            <TextInput
              style={styles.textInput}
              placeholder="Thành phố"
              value={city}
              onChangeText={setCity}
            />
          </View>

          {/* Section 2: CCCD/CMND */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>CCCD/CMND</Text>
          
          <Pressable style={styles.blueBtn} onPress={() => {}}>
            <MaterialIcons name="badge" size={20} color="#ffffff" />
            <Text style={styles.blueBtnText}>Xác thực CCCD</Text>
          </Pressable>

          <Pressable style={[styles.blueBtn, { marginTop: 14 }]} onPress={() => navigation.goBack()}>
            <MaterialIcons name="save" size={20} color="#ffffff" />
            <Text style={styles.blueBtnText}>Lưu thông tin</Text>
          </Pressable>

          {/* Section 3: Cập nhật số điện thoại */}
          <Pressable style={styles.phoneCard} onPress={() => {}}>
            <View style={styles.phoneCardLeft}>
              <View style={styles.phoneIconCircle}>
                <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.phoneTitle}>Cập nhật số điện thoại</Text>
                <Text style={styles.phoneSubtitle}>Cần nhập mật khẩu để xác nhận</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#cbd5e1" />
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
    paddingBottom: 40,
  },
  form: {
    padding: theme.spacing.marginMobile,
  },
  sectionTitle: {
    ...theme.typography.labelMd,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 12,
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
  blueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  blueBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  phoneCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginTop: 24,
  },
  phoneCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  phoneIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  phoneSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});

export default EditProfile;
```

---

### Task 3: Create AddBankAccount Screen

**Files:**
- Create: `src/screens/AddBankAccount.tsx`

- [ ] **Step 1: Create `src/screens/AddBankAccount.tsx`**

Write `AddBankAccount.tsx` to render:
- Header: back arrow, title "Tài khoản ngân hàng".
- Ngân hàng select dropdown.
- Số TK text input.
- Chi nhánh text input.
- Tên chủ tài khoản text input.
- Save/submit button `Lưu tài khoản`.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const AddBankAccount: React.FC = () => {
  const navigation = useNavigation();

  const [selectedBank, setSelectedBank] = React.useState('');
  const [showBankDropdown, setShowBankDropdown] = React.useState(false);

  const [accountNumber, setAccountNumber] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('NGUYEN VAN A');

  const banks = ['Vietcombank', 'Techcombank', 'MB Bank', 'ACB'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tài khoản ngân hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Ngân hàng Dropdown */}
          <Text style={styles.label}>Ngân hàng</Text>
          <Pressable onPress={() => setShowBankDropdown(!showBankDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBank || 'Chọn ngân hàng'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showBankDropdown && (
            <View style={styles.dropdown}>
              {banks.map((b) => (
                <Pressable key={b} style={styles.dropdownItem} onPress={() => { setSelectedBank(b); setShowBankDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{b}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Số TK */}
          <Text style={[styles.label, { marginTop: 16 }]}>Số TK</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập số tài khoản"
            keyboardType="numeric"
            value={accountNumber}
            onChangeText={setAccountNumber}
          />

          {/* Chi nhánh */}
          <Text style={[styles.label, { marginTop: 16 }]}>Chi nhánh</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập chi nhánh"
            value={branch}
            onChangeText={setBranch}
          />

          {/* Tên chủ tài khoản */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tên chủ tài khoản</Text>
          <TextInput
            style={styles.textInput}
            placeholder="NGUYEN VAN A"
            value={ownerName}
            onChangeText={setOwnerName}
          />

          {/* Bottom Button */}
          <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.saveBtnText}>Lưu tài khoản</Text>
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
    paddingBottom: 40,
  },
  form: {
    padding: theme.spacing.marginMobile,
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
  saveBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    marginTop: 24,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default AddBankAccount;
```

---

### Task 4: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `SettingsScreen`, `EditProfile`, `AddBankAccount` in `App.tsx`**

```typescript
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfile from './src/screens/EditProfile';
import AddBankAccount from './src/screens/AddBankAccount';
```

- [ ] **Step 2: Replace tab screen component for route `'Settings'`**

Replace:
```typescript
      <Tab.Screen 
        name="Settings" 
        options={{ tabBarLabel: 'Cài đặt' }}
      >
        {() => (
          <GenericScreen 
            title="Cài đặt hệ thống" 
            type="settings" 
            description="Thiết lập các thông số thông báo tự động, cấu hình nhắc nợ và tích hợp cổng thanh toán." 
          />
        )}
      </Tab.Screen>
```
With:
```typescript
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ tabBarLabel: 'Cài đặt' }}
      />
```

- [ ] **Step 3: Register stack screens in App.tsx**

Inside Stack Navigator in `App.tsx`, register:
```typescript
          <Stack.Screen name="cai-dat/chinh-sua" component={EditProfile} />
          <Stack.Screen name="cai-dat/ngan-hang" component={AddBankAccount} />
```

- [ ] **Step 4: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
