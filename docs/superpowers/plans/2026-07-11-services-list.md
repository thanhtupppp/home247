# Services List and Creation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Dịch vụ" screen and the new "Tạo dịch vụ" screen according to user screenshots.

**Architecture:**
- Create `src/screens/ServicesList.tsx` containing the back arrow header with title/subtitle, accordion cards with toggle state, item lists (Internet, Gửi xe) and bottom-right create button.
- Create `src/screens/CreateService.tsx` containing the form inputs, dropdown selects, and action buttons.
- Update `App.tsx` navigation routes to hook up both components.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Create ServicesList Screen

**Files:**
- Create: `src/screens/ServicesList.tsx`

- [ ] **Step 1: Create `src/screens/ServicesList.tsx`**

Write `ServicesList.tsx` to render:
- Header: back arrow, title "Dịch vụ" next to blue icon, subtitle "Quản lý các loại dịch vụ".
- Accordion cards with toggle state.
- Expanded card 1 content:
  - "Cố định" (Fixed) section with Internet card.
  - "Theo người" (Per tenant) section with Gửi xe card.
- Collapsed card 2 content.
- Bottom right "+ Thêm dịch vụ" button.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const ServicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({
    'Khác': true,
    'nơ trang long': false,
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
            <MaterialIcons name="dashboard" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Dịch vụ</Text>
            <Text style={styles.headerSubtitle}>Quản lý các loại dịch vụ</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Accordion Group 1: Khác */}
        <View style={[styles.accordionCard, expandedGroups['Khác'] && styles.accordionCardExpanded]}>
          <Pressable onPress={() => toggleGroup('Khác')} style={styles.accordionHeader}>
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.buildingIconContainer}>
                <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.groupName}>Khác</Text>
                <Text style={styles.groupSubtitle}>2 dịch vụ</Text>
              </View>
            </View>
            <MaterialIcons 
              name={expandedGroups['Khác'] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#a1a1aa" 
              style={styles.chevron}
            />
          </Pressable>

          {expandedGroups['Khác'] && (
            <View style={styles.accordionContent}>
              {/* Category 1: Cố định */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="lock" size={16} color="#10b981" />
                  <Text style={[styles.categoryTitle, { color: '#10b981' }]}>Cố định</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.serviceItemCard}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceName}>Internet</Text>
                  <Text style={styles.servicePrice}>90 đ</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>

              {/* Category 2: Theo người */}
              <View style={[styles.categoryHeader, { marginTop: 16 }]}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="group" size={16} color="#f59e0b" />
                  <Text style={[styles.categoryTitle, { color: '#f59e0b' }]}>Theo người</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.serviceItemCard}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceName}>Gửi xe</Text>
                  <Text style={styles.servicePrice}>0 đ/unit</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#cbd5e1" />
              </Pressable>
            </View>
          )}
        </View>

        {/* Accordion Group 2: nơ trang long */}
        <View style={[styles.accordionCard, expandedGroups['nơ trang long'] && styles.accordionCardExpanded]}>
          <Pressable onPress={() => toggleGroup('nơ trang long')} style={styles.accordionHeader}>
            <View style={styles.accordionHeaderLeft}>
              <View style={styles.buildingIconContainer}>
                <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={styles.groupName}>nơ trang long</Text>
                <Text style={styles.groupSubtitle}>1 dịch vụ</Text>
              </View>
            </View>
            <MaterialIcons 
              name={expandedGroups['nơ trang long'] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
              size={24} 
              color="#a1a1aa" 
              style={styles.chevron}
            />
          </Pressable>

          {expandedGroups['nơ trang long'] && (
            <View style={styles.accordionContent}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryHeaderLeft}>
                  <MaterialIcons name="lock" size={16} color="#10b981" />
                  <Text style={[styles.categoryTitle, { color: '#10b981' }]}>Cố định</Text>
                </View>
                <Text style={styles.categoryCount}>1</Text>
              </View>

              <Pressable style={styles.serviceItemCard}>
                <View style={styles.serviceItemLeft}>
                  <Text style={styles.serviceName}>Rác & Vệ sinh</Text>
                  <Text style={styles.servicePrice}>50.000 đ</Text>
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
          style={styles.addServiceButton}
          onPress={() => navigation.navigate('cau-hinh-gia/them')}
        >
          <MaterialIcons name="add" size={22} color={theme.colors.onPrimary} />
          <Text style={styles.addServiceButtonText}>Thêm dịch vụ</Text>
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
  headerTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
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
    borderColor: '#dbeafe',
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
  serviceItemCard: {
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
  serviceItemLeft: {
    gap: 4,
  },
  serviceName: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  servicePrice: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  addServiceButton: {
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
  addServiceButtonText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default ServicesList;
```

---

### Task 2: Create CreateService Screen

**Files:**
- Create: `src/screens/CreateService.tsx`

- [ ] **Step 1: Create `src/screens/CreateService.tsx`**

Write `CreateService.tsx` to render:
- Header: back arrow, title "Tạo dịch vụ".
- Tên dịch vụ: TextInput, placeholder "Vd: Điện, Nước, Internet".
- Tòa nhà select dropdown.
- Phương thức tính select dropdown.
- Đơn vị (tùy chọn): TextInput, placeholder "Vd: kWh, m³, tháng".
- Giá đơn vị: TextInput, placeholder "Vd: 3500".
- Bottom Buttons:
  - Left "Đóng" button.
  - Right "+ Tạo dịch vụ" button.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateService: React.FC = () => {
  const navigation = useNavigation();

  const [serviceName, setServiceName] = React.useState('');
  const [selectedBuilding, setSelectedBuilding] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const [calcMethod, setCalcMethod] = React.useState('');
  const [showCalcDropdown, setShowCalcDropdown] = React.useState(false);

  const [unit, setUnit] = React.useState('');
  const [unitPrice, setUnitPrice] = React.useState('');

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const calcMethods = ['Cố định', 'Theo người', 'Theo chỉ số đồng hồ'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Tên dịch vụ */}
          <Text style={styles.label}>Tên dịch vụ</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: Điện, Nước, Internet"
            value={serviceName}
            onChangeText={setServiceName}
          />

          {/* Tòa nhà Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tòa nhà</Text>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedBuilding || 'Chọn tòa nhà'}</Text>
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

          {/* Phương thức tính Dropdown */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phương thức tính</Text>
          <Pressable onPress={() => setShowCalcDropdown(!showCalcDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{calcMethod || 'Chọn phương thức tính'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
          </Pressable>
          {showCalcDropdown && (
            <View style={styles.dropdown}>
              {calcMethods.map((m) => (
                <Pressable key={m} style={styles.dropdownItem} onPress={() => { setCalcMethod(m); setShowCalcDropdown(false); }}>
                  <Text style={styles.dropdownItemText}>{m}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Đơn vị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Đơn vị (tùy chọn)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: kWh, m³, tháng"
            value={unit}
            onChangeText={setUnit}
          />

          {/* Giá đơn vị */}
          <Text style={[styles.label, { marginTop: 16 }]}>Giá đơn vị</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Vd: 3500"
            keyboardType="numeric"
            value={unitPrice}
            onChangeText={setUnitPrice}
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtnText}>Đóng</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="add" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Tạo dịch vụ</Text>
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

export default CreateService;
```

---

### Task 3: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `ServicesList` and `CreateService` in `App.tsx`**

```typescript
import ServicesList from './src/screens/ServicesList';
import CreateService from './src/screens/CreateService';
```

- [ ] **Step 2: Replace route mapping in `App.tsx`**

Replace:
```typescript
          <Stack.Screen name="cau-hinh-gia" component={ServicesList} />
```
With:
```typescript
          <Stack.Screen name="cau-hinh-gia" component={ServicesList} />
          <Stack.Screen name="cau-hinh-gia/them" component={CreateService} />
```

- [ ] **Step 3: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
