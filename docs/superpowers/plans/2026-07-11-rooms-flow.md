# Rooms Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Quản lý nhà" screen and the new "Thêm nhà" screen according to user screenshots.

**Architecture:**
- Update `src/screens/RoomsManagement.tsx` to match the search bar, filter buttons, list of buildings (e.g., "nơ trang long (1)"), and bottom floating button.
- Create `src/screens/CreateBuilding.tsx` containing the multi-section form inputs with dropdowns and buttons.
- Update `App.tsx` navigation routes to register `toa-nha/them`.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Redesign RoomsManagement Screen

**Files:**
- Modify: `src/screens/RoomsManagement.tsx`

- [ ] **Step 1: Write redesigned `RoomsManagement.tsx`**

Overwrite the file to render:
- Header: title "Quản lý nhà", three-dot menu button.
- Search Bar: rounded input placeholder "Tìm kiếm phòng/căn hộ", magnifying glass icon.
- Filter List Button to the right of search input.
- Accordion-style item: "nơ trang long (1)" with "Chi tiết" link and chevron-down.
- Bottom floating button: `+ Thêm toà nhà` navigating to `'toa-nha/them'`.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const RoomsManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchText, setSearchText] = React.useState('');

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
              placeholder="Tìm kiếm phòng/căn hộ"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={22} color="#475569" />
          </Pressable>
        </View>

        {/* Building List (e.g. nơ trang long) */}
        <View style={styles.buildingCard}>
          <View style={styles.buildingHeader}>
            <Text style={styles.buildingName}>nơ trang long (1)</Text>
            <View style={styles.buildingHeaderRight}>
              <Pressable onPress={() => {}}>
                <Text style={styles.detailLink}>Chi tiết</Text>
              </Pressable>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#94a3b8" />
            </View>
          </View>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buildingName: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  buildingHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addBuildingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#93c5fd', // Light blue background in screenshot
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
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default RoomsManagement;
```

---

### Task 2: Create CreateBuilding Screen

**Files:**
- Create: `src/screens/CreateBuilding.tsx`

- [ ] **Step 1: Create `src/screens/CreateBuilding.tsx`**

Write `CreateBuilding.tsx` to render:
- Header: back arrow, title "Thêm nhà".
- "Thông tin cơ bản" section (with list icon):
  - Tên nhà: TextInput, placeholder "Vd: Cơ sở 1".
  - Loại nhà select dropdown.
- "Địa chỉ" section (with location icon):
  - Tỉnh thành phố select dropdown.
  - Phường/Xã select dropdown.
  - Địa chỉ chi tiết: TextInput, placeholder "Số nhà, tên đường...".
- Bottom Buttons:
  - Left "Đóng" button.
  - Right "Thêm nhà" button.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateBuilding: React.FC = () => {
  const navigation = useNavigation();

  const [buildingName, setBuildingName] = React.useState('');
  const [selectedType, setSelectedType] = React.useState('');
  const [showTypeDropdown, setShowTypeDropdown] = React.useState(false);

  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = React.useState(false);

  const [selectedWard, setSelectedWard] = React.useState('');
  const [showWardDropdown, setShowWardDropdown] = React.useState(false);

  const [detailAddress, setDetailAddress] = React.useState('');

  const types = ['Chung cư mini', 'Nhà nguyên căn', 'Dãy phòng trọ'];
  const provinces = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];
  const wards = ['Phường 1', 'Phường 2', 'Phường 3'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm nhà</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Section 1: Thông tin cơ bản */}
          <View style={styles.sectionHeader}>
            <MaterialIcons name="fact-check" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          </View>

          <Text style={styles.label}>Tên nhà</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: Cơ sở 1"
            value={buildingName}
            onChangeText={setBuildingName}
          />

          <Text style={[styles.label, { marginTop: 16 }]}>Loại nhà</Text>
          <Pressable onPress={() => setShowTypeDropdown(!showTypeDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedType || 'Chọn loại nhà'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showTypeDropdown && (
            <View style={styles.dropdown}>
              {types.map((t) => (
                <Pressable key={t} style={styles.dropdownItem} onPress={() => { setSelectedType(t); setShowTypeDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{t}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Section 2: Địa chỉ */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <MaterialIcons name="place" size={22} color={theme.colors.onSurface} />
            <Text style={styles.sectionTitle}>Địa chỉ</Text>
          </View>

          <Text style={styles.label}>Tỉnh thành phố</Text>
          <Pressable onPress={() => setShowProvinceDropdown(!showProvinceDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedProvince || 'Chọn tỉnh/thành'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showProvinceDropdown && (
            <View style={styles.dropdown}>
              {provinces.map((p) => (
                <Pressable key={p} style={styles.dropdownItem} onPress={() => { setSelectedProvince(p); setShowProvinceDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Phường/Xã</Text>
          {!selectedProvince ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Vui lòng chọn tỉnh/thành trước</Text>
            </View>
          ) : (
            <View>
              <Pressable onPress={() => setShowWardDropdown(!showWardDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedWard || 'Chọn phường/xã'}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showWardDropdown && (
                <View style={styles.dropdown}>
                  {wards.map((w) => (
                    <Pressable key={w} style={styles.dropdownItem} onPress={() => { setSelectedWard(w); setShowWardDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{w}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Địa chỉ chi tiết</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Số nhà, tên đường..."
            value={detailAddress}
            onChangeText={setDetailAddress}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Đóng</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnText}>Thêm nhà</Text>
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
  bottomBar: {
    flexDirection: 'row',
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    gap: 12,
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  closeBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
  },
  saveBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default CreateBuilding;
```

---

### Task 3: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `CreateBuilding` in `App.tsx`**

```typescript
import CreateBuilding from './src/screens/CreateBuilding';
```

- [ ] **Step 2: Replace route mapping in `App.tsx`**

Inside Stack Navigator in `App.tsx`, replace:
```typescript
          <Stack.Screen name="toa-nha">
            {() => (
              <GenericScreen 
                title="Quản lý Tòa nhà" 
                type="building" 
                description="Cấu hình các tòa nhà, chung cư mini, chi nhánh phòng cho thuê đang hoạt động." 
              />
            )}
          </Stack.Screen>
```
With:
```typescript
          <Stack.Screen name="toa-nha" component={RoomsManagement} />
          <Stack.Screen name="toa-nha/them" component={CreateBuilding} />
```

- [ ] **Step 3: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
