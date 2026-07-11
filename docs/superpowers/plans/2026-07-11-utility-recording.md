# Utility Management and Recording Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Quản lý Điện nước" and "Ghi điện nước" screens based on user screenshots, with interactive months, buildings, single-room and bulk-room indices recording.

**Architecture:**
- Create `UtilityManagement.tsx` to handle building select dropdown and month filter selection, navigating to recording.
- Create `UtilityRecording.tsx` to handle single-room ("Ghi theo phòng") and bulk ("Ghi hàng loạt") input forms with React Native state.
- Update `App.tsx` routes to hook up the components.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

## Global Constraints
- Do not introduce external dependencies; use React Native core components and `@expo/vector-icons` (specifically `MaterialIcons`).
- Styling must follow the design system tokens defined in `src/theme.ts`.
- Ensure type-correct TSX/TS implementation.

---

### Task 1: Create Utility Management Screen

**Files:**
- Create: `src/screens/UtilityManagement.tsx`

**Interfaces:**
- Consumes: `mockData.ts` for building list, navigation hook, theme.
- Produces: The building and month selection dashboard view.

- [ ] **Step 1: Create `src/screens/UtilityManagement.tsx`**

Write `UtilityManagement.tsx` to render:
- Header with back arrow and title "Điện nước".
- Horizontal scroll of months: `2026`, `09/2026`, `10/2026`, `11/2026`, `12/2026`. Highlight active month selection.
- Building selector card: building icon, name ("nơ trang long"), badge ("0") and chevron-down icon. Clicking it toggles a building dropdown modal/list.
- Bottom blue action button: "+ Ghi điện nước" navigating to `dien-nuoc/ghi`.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const UtilityManagement: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedMonth, setSelectedMonth] = React.useState('10/2026');
  const [selectedBuilding, setSelectedBuilding] = React.useState('nơ trang long');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const months = ['2026', '09/2026', '10/2026', '11/2026', '12/2026'];
  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Điện nước</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Months Selector */}
      <View style={styles.monthsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScroll}>
          {months.map((month) => {
            const isActive = selectedMonth === month;
            return (
              <Pressable key={month} onPress={() => setSelectedMonth(month)} style={styles.monthItem}>
                <Text style={[styles.monthText, isActive && styles.monthTextActive]}>
                  {month}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Building Selector Card */}
      <View style={styles.content}>
        <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.selectorCard}>
          <View style={styles.selectorLeft}>
            <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
            <Text style={styles.buildingName}>{selectedBuilding}</Text>
          </View>
          <View style={styles.selectorRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>0</Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={24} color={theme.colors.primary} />
          </View>
        </Pressable>

        {showBuildingDropdown && (
          <View style={styles.dropdown}>
            {buildings.map((building) => (
              <Pressable
                key={building}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedBuilding(building);
                  setShowBuildingDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{building}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('dien-nuoc/ghi', { building: selectedBuilding })}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.actionBtnText}>Ghi điện nước</Text>
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
  monthsContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  monthsScroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    gap: 24,
  },
  monthItem: {
    paddingVertical: 4,
  },
  monthText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  monthTextActive: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: theme.spacing.marginMobile,
    zIndex: 1,
  },
  selectorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bce0fd',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buildingName: {
    ...theme.typography.bodyMd,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#dbeafe',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.xl,
    marginTop: 8,
    overflow: 'hidden',
    boxShadow: [{
      offsetX: 0,
      offsetY: 4,
      blurRadius: 8,
      color: 'rgba(0,0,0,0.05)'
    }],
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
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  actionBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default UtilityManagement;
```

---

### Task 2: Create Utility Recording Screen

**Files:**
- Create: `src/screens/UtilityRecording.tsx`

**Interfaces:**
- Consumes: route parameters, mock rooms/buildings from `mockData.ts`, theme.
- Produces: Detailed recording forms for room indices.

- [ ] **Step 1: Create `src/screens/UtilityRecording.tsx`**

Write `UtilityRecording.tsx` implementing:
- Header with back arrow and title "Ghi điện nước".
- Segmented control: "Ghi theo phòng" (Single room) and "Ghi hàng loạt" (Bulk recording).
- Tab 1 ("Ghi theo phòng") structure:
  - Tòa nhà selector, Chọn phòng selector.
  - Form showing Electric & Water Index input (Chỉ số cũ, Chỉ số mới, Tiêu thụ, Thành tiền).
- Tab 2 ("Ghi hàng loạt") structure:
  - Scrollable list of rooms. Each room has a toggle switch, and input fields for new electric index.
- Bottom blue action button "Ghi điện nước" with disk icon to save and navigate back.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { mockRooms } from '../data/mockData';

export const UtilityRecording: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialBuilding = route.params?.building || 'nơ trang long';

  const [activeTab, setActiveTab] = React.useState<'room' | 'bulk'>('room');
  const [selectedBuilding, setSelectedBuilding] = React.useState(initialBuilding);
  const [selectedRoom, setSelectedRoom] = React.useState('');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  // States for recording data
  const [singleElectricNew, setSingleElectricNew] = React.useState('');
  const [singleWaterNew, setSingleWaterNew] = React.useState('');

  // Bulk rooms state (simulating rooms P.101, P.102, P.201, P.202)
  const [bulkRooms, setBulkRooms] = React.useState([
    { id: '1', code: 'Phòng p1', enabled: true, electricOld: 0, electricNew: '' },
    { id: '2', code: 'Phòng p2', enabled: false, electricOld: 124, electricNew: '' },
    { id: '3', code: 'Phòng p3', enabled: true, electricOld: 256, electricNew: '' },
  ]);

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const rooms = mockRooms.map(r => r.code);

  const toggleBulkRoom = (id: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const handleBulkElectricChange = (id: string, value: string) => {
    setBulkRooms(bulkRooms.map(item => 
      item.id === id ? { ...item, electricNew: value } : item
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Ghi điện nước</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tabButton, activeTab === 'room' && styles.tabButtonActive]}
          onPress={() => setActiveTab('room')}
        >
          <Text style={[styles.tabText, activeTab === 'room' && styles.tabTextActive]}>
            Ghi theo phòng
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, activeTab === 'bulk' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bulk')}
        >
          <Text style={[styles.tabText, activeTab === 'bulk' && styles.tabTextActive]}>
            Ghi hàng loạt
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Tab 1: Ghi theo phòng */}
        {activeTab === 'room' && (
          <View style={styles.form}>
            <Text style={styles.label}>Tòa nhà *</Text>
            <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{selectedBuilding}</Text>
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

            <Text style={[styles.label, { marginTop: 16 }]}>Chọn phòng *</Text>
            <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{selectedRoom || 'Chọn...'}</Text>
              <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
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

            {selectedRoom !== '' && (
              <View style={styles.inputsSection}>
                {/* Electricity Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="bolt" size={20} color="#d97706" />
                    <Text style={styles.cardTitle}>Điện</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                      <TextInput style={styles.textInputRead} value="1245" editable={false} />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Chỉ số mới</Text>
                      <TextInput 
                        style={styles.textInput} 
                        placeholder="Nhập số..." 
                        keyboardType="numeric" 
                        value={singleElectricNew}
                        onChangeText={setSingleElectricNew}
                      />
                    </View>
                  </View>
                </View>

                {/* Water Card */}
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="water-drop" size={20} color={theme.colors.primary} />
                    <Text style={styles.cardTitle}>Nước</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                      <TextInput style={styles.textInputRead} value="342" editable={false} />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={styles.inputLabel}>Chỉ số mới</Text>
                      <TextInput 
                        style={styles.textInput} 
                        placeholder="Nhập số..." 
                        keyboardType="numeric" 
                        value={singleWaterNew}
                        onChangeText={setSingleWaterNew}
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tab 2: Ghi hàng loạt */}
        {activeTab === 'bulk' && (
          <View style={styles.form}>
            <Text style={styles.label}>Tòa nhà *</Text>
            <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.dropdownButton}>
              <Text style={styles.dropdownButtonText}>{selectedBuilding}</Text>
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

            {/* List of rooms for bulk input */}
            <View style={styles.bulkList}>
              {bulkRooms.map((room) => (
                <View key={room.id} style={styles.bulkCard}>
                  <View style={styles.bulkCardHeader}>
                    <Text style={styles.bulkRoomName}>{room.code}</Text>
                    <Switch 
                      value={room.enabled} 
                      onValueChange={() => toggleBulkRoom(room.id)}
                      trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
                      thumbColor={room.enabled ? theme.colors.primary : '#94a3b8'}
                    />
                  </View>

                  {room.enabled && (
                    <View style={styles.bulkInputsContainer}>
                      <Text style={styles.bulkSubTitle}>điện</Text>
                      <View style={styles.cardRow}>
                        <View style={styles.inputCol}>
                          <Text style={styles.inputLabel}>Chỉ số cũ</Text>
                          <TextInput style={styles.textInputRead} value={String(room.electricOld)} editable={false} />
                        </View>
                        <View style={styles.inputCol}>
                          <Text style={styles.inputLabel}>Chỉ số mới</Text>
                          <TextInput 
                            style={styles.textInput} 
                            placeholder="Nhập chỉ số" 
                            keyboardType="numeric"
                            value={room.electricNew}
                            onChangeText={(val) => handleBulkElectricChange(room.id, val)}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="save" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Ghi điện nước</Text>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  tabTextActive: {
    color: theme.colors.primary,
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
  inputsSection: {
    marginTop: 20,
    gap: 16,
  },
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    padding: 16,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
    paddingBottom: 8,
  },
  cardTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  textInputRead: {
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    backgroundColor: '#f1f5f9',
  },
  bulkList: {
    marginTop: 20,
    gap: 16,
  },
  bulkCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    padding: 16,
  },
  bulkCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulkRoomName: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  bulkInputsContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainer,
    paddingTop: 12,
  },
  bulkSubTitle: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'lowercase',
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

export default UtilityRecording;
```

---

### Task 3: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

**Interfaces:**
- Consumes: Screen components `UtilityManagement` and `UtilityRecording`.
- Produces: Configured stack routes `dien-nuoc` and `dien-nuoc/ghi`.

- [ ] **Step 1: Import screens in `App.tsx`**

```typescript
import UtilityManagement from './src/screens/UtilityManagement';
import UtilityRecording from './src/screens/UtilityRecording';
```

- [ ] **Step 2: Update stack screens in `App.tsx`**

Replace:
```typescript
          <Stack.Screen name="dien-nuoc">
            {() => (
              <GenericScreen 
                title="Ghi chỉ số Điện & Nước" 
                type="utility" 
                description="Nhập chỉ số điện và nước tiêu thụ đầu kỳ, cuối kỳ để tính toán hóa đơn." 
              />
            )}
          </Stack.Screen>
```
With:
```typescript
          <Stack.Screen name="dien-nuoc" component={UtilityManagement} />
          <Stack.Screen name="dien-nuoc/ghi" component={UtilityRecording} />
```

- [ ] **Step 3: Run typescript check to verify**

Run: `npx tsc --noEmit`
Expected: Success.
