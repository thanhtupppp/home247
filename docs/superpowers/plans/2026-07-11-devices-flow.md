# Devices Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Trang thiết bị" screen and the new "Thêm thiết bị" screen according to user screenshots.

**Architecture:**
- Create `src/screens/DevicesList.tsx` containing the back arrow header with title/subtitle, accordion cards with toggle state, categorized items list, and bottom-right create button.
- Create `src/screens/CreateDevice.tsx` containing the form inputs with inline icons, dropdown selects, and action button.
- Update `App.tsx` navigation routes to hook up both components.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Create DevicesList Screen

**Files:**
- Create: `src/screens/DevicesList.tsx`

- [ ] **Step 1: Create `src/screens/DevicesList.tsx`**

Write `DevicesList.tsx` to render:
- Header: back arrow, title "Trang thiết bị" next to blue icon, subtitle "Quản lý thiết bị tòa nhà".
- Accordion card "Chưa gán tòa nhà" (default expanded) with toggle logic.
- Accordion content containing:
  - "Gia dụng" category: 3 items (Máy giặt, Máy lạnh, Tủ lạnh).
  - "Phòng tắm" category: 1 item (Máy nước nóng).
  - "Nội thất" category: 3 items (Bàn làm việc, Giường, Tủ quần áo).
- Bottom-right "+ Thêm thiết bị" button.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const DevicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Unassigned': true,
  });

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="router" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.titleTextWrapper}>
            <Text style={styles.headerTitle}>Trang thiết bị</Text>
            <Text style={styles.headerSubtitle}>Quản lý thiết bị tòa nhà</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Accordion Group: Chưa gán tòa nhà */}
        <View style={[styles.accordionCard, expandedGroups['Unassigned'] && styles.accordionCardExpanded]}>
          <Pressable onPress={() => toggleGroup('Unassigned')} style={styles.accordionHeader}>
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.buildingIconContainer}>
                <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={groupNameStyle(expandedGroups['Unassigned'])}>Chưa gán tòa nhà</Text>
                <Text style={styles.groupSubtitle}>8 thiết bị</Text>
              </View>
            </View>
            <MaterialIcons 
              name={expandedGroups['Unassigned'] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color={expandedGroups['Unassigned'] ? theme.colors.primary : "#a1a1aa"} 
              style={styles.chevron}
            />
          </Pressable>

          {expandedGroups['Unassigned'] && (
            <View style={styles.accordionContent}>
              {/* Category 1: Gia dụng */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="kitchen" size={16} color={theme.colors.primary} />
                  <Text style={[styles.categoryTitle, { color: theme.colors.primary }]}>Gia dụng</Text>
                </View>
                <Text style={styles.categoryCount}>3</Text>
              </View>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Máy giặt</Text>
                  <Text style={styles.deviceDesc}>Máy giặt tiêu chuẩn.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Máy lạnh</Text>
                  <Text style={styles.deviceDesc}>Máy lạnh treo tường.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Tủ lạnh</Text>
                  <Text style={styles.deviceDesc}>Tủ lạnh tiêu chuẩn.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              {/* Category 2: Phòng tắm */}
              <View style={[styles.categoryHeader, { marginTop: 16 }]}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="water-drop" size={16} color="#06b6d4" />
                  <Text style={[styles.categoryTitle, { color: '#06b6d4' }]}>Phòng tắm</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Máy nước nóng</Text>
                  <Text style={styles.deviceDesc}>Máy nước nóng phòng tắm.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              {/* Category 3: Nội thất */}
              <View style={[styles.categoryHeader, { marginTop: 16 }]}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="chair" size={16} color="#b45309" />
                  <Text style={[styles.categoryTitle, { color: '#b45309' }]}>Nội thất</Text>
                </View>
                <Text style={styles.categoryCount}>3</Text>
              </View>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Bàn làm việc</Text>
                  <Text style={styles.deviceDesc}>Bàn làm việc/học tập.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Giường</Text>
                  <Text style={styles.deviceDesc}>Giường tiêu chuẩn cho 1 người...</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              <Pressable style={styles.deviceItemCard}>
                <View style={styles.deviceItemLeft}>
                  <Text style={styles.deviceName}>Tủ quần áo</Text>
                  <Text style={styles.deviceDesc}>Tủ quần áo gỗ 2 cánh.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action style button on the bottom right */}
      <View style={styles.bottomContainer}>
        <Pressable 
          style={styles.addDeviceButton}
          onPress={() => navigation.navigate('thiet-bi/them')}
        >
          <MaterialIcons name="add" size={22} color={theme.colors.onPrimary} />
          <Text style={styles.addDeviceButtonText}>Thêm thiết bị</Text>
        </Pressable>
      </View>
    </View>
  );
};

const groupNameStyle = (isExpanded: boolean) => {
  return [
    styles.groupName,
    isExpanded && { color: theme.colors.primary }
  ];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleTextWrapper: {
    gap: 2,
  },
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  scrollContent: {
    padding: theme.spacing.marginMobile,
    gap: 16,
    paddingBottom: 100,
  },
  accordionCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  accordionCardExpanded: {
    borderColor: '#bce0fd',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buildingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  groupSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  chevron: {
    padding: 4,
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  categoryCount: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  deviceItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    marginBottom: 10,
  },
  deviceItemLeft: {
    gap: 4,
  },
  deviceName: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  deviceDesc: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addDeviceButton: {
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
  addDeviceButtonText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default DevicesList;
```

---

### Task 2: Create CreateDevice Screen

**Files:**
- Create: `src/screens/CreateDevice.tsx`

- [ ] **Step 1: Create `src/screens/CreateDevice.tsx`**

Write `CreateDevice.tsx` to render:
- Header: back arrow, title "Thêm thiết bị".
- Tòa nhà select dropdown.
- Tên thiết bị: TextInput with inline router/waveform icon.
- Danh mục: Dropdown select, placeholder "Chọn danh mục".
- Mô tả: TextInput multiline with document/file icon.
- Bottom Button: large blue "Tạo thiết bị" button.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateDevice: React.FC = () => {
  const navigation = useNavigation();

  const [selectedBuilding, setSelectedBuilding] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [deviceName, setDeviceName] = React.useState('');
  
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false);

  const [description, setDescription] = React.useState('');

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const categories = ['Gia dụng', 'Phòng tắm', 'Nội thất'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Thêm thiết bị</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Tòa nhà Dropdown */}
          <Text style={styles.label}>Tòa nhà</Text>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBuilding || 'Chọn...'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
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

          {/* Tên thiết bị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tên thiết bị</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="router" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập tên thiết bị"
              value={deviceName}
              onChangeText={setDeviceName}
            />
          </View>

          {/* Danh mục Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Danh mục</Text>
          <Pressable onPress={() => setShowCategoryDropdown(!showCategoryDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedCategory || 'Chọn danh mục'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showCategoryDropdown && (
            <View style={styles.dropdown}>
              {categories.map((c) => (
                <Pressable key={c} style={styles.dropdownItem} onPress={() => { setSelectedCategory(c); setShowCategoryDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{c}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Mô tả */}
          <Text style={[styles.label, { marginTop: 16 }]}>Mô tả</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <MaterialIcons name="description" size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Nhập mô tả thiết bị (tùy chọn)"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveBtnText}>Tạo thiết bị</Text>
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
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.onSurface,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingVertical: 0,
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

export default CreateDevice;
```

---

### Task 3: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `DevicesList` and `CreateDevice` in `App.tsx`**

```typescript
import DevicesList from './src/screens/DevicesList';
import CreateDevice from './src/screens/CreateDevice';
```

- [ ] **Step 2: Replace route mapping in `App.tsx`**

Replace:
```typescript
          <Stack.Screen name="thiet-bi">
            {() => (
              <GenericScreen 
                title="Quản lý Thiết bị" 
                type="device" 
                description="Danh mục tài sản, trang thiết bị cố định được cấp phát tại từng phòng trọ." 
              />
            )}
          </Stack.Screen>
```
With:
```typescript
          <Stack.Screen name="thiet-bi" component={DevicesList} />
          <Stack.Screen name="thiet-bi/them" component={CreateDevice} />
```

- [ ] **Step 3: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
