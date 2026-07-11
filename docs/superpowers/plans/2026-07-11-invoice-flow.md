# Invoice Management and Creation Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Hóa đơn" screen and the new "Tạo hóa đơn" screen according to user screenshots.

**Architecture:**
- Redesign `src/screens/InvoicesList.tsx` to include months scroll, filter pills, building selector, invoice list cards / empty state, and bottom create button.
- Create `src/screens/CreateInvoice.tsx` to handle the multi-section form inputs and save action.
- Update `App.tsx` navigation routes to hook up the components.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Redesign InvoicesList Screen

**Files:**
- Modify: `src/screens/InvoicesList.tsx`

- [ ] **Step 1: Replace content of `src/screens/InvoicesList.tsx`**

Write `InvoicesList.tsx` to render:
- Header with back arrow and title "Hoá đơn".
- Horizontal scroll of months: `2026`, `09/2026`, `10/2026`, `11/2026`, `12/2026`.
- Pill filters: `Tất cả` (All), `Đã thu tiền` (Paid), `Chưa thu đủ` (Partially/Unpaid).
- Building Selector: blue border, building name, badge showing number of invoices, dropdown chevron.
- Content area: shows invoice cards or "Không có hoá đơn" (empty state).
- Bottom button: "+ Tạo hoá đơn" navigating to `hoa-don/them`.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { recentTransactions } from '../data/mockData';

export const InvoicesList: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedMonth, setSelectedMonth] = React.useState('10/2026');
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedBuilding, setSelectedBuilding] = React.useState('nơ trang long');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);

  const months = ['2026', '09/2026', '10/2026', '11/2026', '12/2026'];
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'paid', label: 'Đã thu tiền' },
    { key: 'unpaid', label: 'Chưa thu đủ' },
  ] as const;

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];

  // Filter invoices based on selected building
  // "nơ trang long" defaults to 0 invoices as in screenshot
  const filteredInvoices = selectedBuilding === 'nơ trang long' ? [] : recentTransactions;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Hoá đơn</Text>
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

      {/* Filter Pills */}
      <View style={styles.pillsContainer}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <Pressable
              key={filter.key}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Building Selector Card */}
        <View style={styles.buildingSelectorWrapper}>
          <Pressable onPress={() => setShowBuildingDropdown(!showBuildingDropdown)} style={styles.selectorCard}>
            <View style={styles.selectorLeft}>
              <MaterialIcons name="apartment" size={20} color={theme.colors.primary} />
              <Text style={styles.buildingName}>{selectedBuilding}</Text>
            </View>
            <View style={styles.selectorRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filteredInvoices.length}</Text>
              </View>
              <MaterialIcons name={showBuildingDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color={theme.colors.primary} />
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

        {/* Content Area */}
        <View style={styles.content}>
          {filteredInvoices.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Không có hoá đơn</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredInvoices.map((tx) => (
                <View key={tx.id} style={styles.invoiceCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.roomBadge}>
                      <Text style={styles.roomText}>{tx.roomCode}</Text>
                    </View>
                    <View 
                      style={[
                        styles.statusBadge,
                        tx.status === 'success' ? styles.successBadge : styles.overdueBadge
                      ]}
                    >
                      <Text 
                        style={[
                          styles.statusText,
                          tx.status === 'success' ? styles.successText : styles.overdueText
                        ]}
                      >
                        {tx.status === 'success' ? 'Đã thu tiền' : 'Chưa thu đủ'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardMiddle}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Khách thuê</Text>
                      <Text style={styles.infoValue}>{tx.tenantName}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Hạng mục</Text>
                      <Text style={styles.infoValue}>{tx.type}</Text>
                    </View>
                    <View style={styles.infoColAlignRight}>
                      <Text style={styles.infoLabel}>Số tiền</Text>
                      <Text style={styles.amountValue}>{tx.amount}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable 
          style={styles.actionBtn}
          onPress={() => navigation.navigate('hoa-don/them', { building: selectedBuilding })}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.actionBtnText}>Tạo hoá đơn</Text>
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
  pillsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: 16,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  pillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  pillText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  buildingSelectorWrapper: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: 16,
    zIndex: 10,
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
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: theme.spacing.marginMobile,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  listContainer: {
    gap: 16,
  },
  invoiceCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  roomBadge: {
    backgroundColor: theme.colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.lg,
  },
  roomText: {
    ...theme.typography.numericData,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  successBadge: {
    backgroundColor: '#e6f4ea',
  },
  successText: {
    color: '#137333',
    fontSize: 10,
    fontWeight: 'bold',
  },
  overdueBadge: {
    backgroundColor: '#fce8e6',
  },
  overdueText: {
    color: '#c5221f',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  infoCol: {
    flex: 1.2,
    gap: 4,
  },
  infoColAlignRight: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...theme.typography.bodyMd,
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  amountValue: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.primary,
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

export default InvoicesList;
```

---

### Task 2: Create CreateInvoice Screen

**Files:**
- Create: `src/screens/CreateInvoice.tsx`

- [ ] **Step 1: Create `src/screens/CreateInvoice.tsx`**

Write `CreateInvoice.tsx` to render:
- Header with back arrow and title "Tạo hoá đơn".
- Tòa nhà * dropdown ("nơ trang long", customizable).
- Phòng * dropdown ("p1", customizable).
- Contract banner: "Phòng này chưa có hợp đồng".
- Section 1 (Tiền phòng):
  - Toggle: "Bao gồm tiền phòng".
  - Input field for amount: Placeholder "Vd: 5.500.000".
  - "Thu tiền phòng từ ngày:" Date input, "01/07/2026".
  - "Đến ngày:" Date input, "31/07/2026".
- Section 2 (Dịch vụ):
  - Toggle: "Bao gồm dịch vụ".
  - Grey banner: "Vui lòng chọn hợp đồng để xem dịch vụ".
- Section 3 (Đồng hồ):
  - Toggle: "Bao gồm chỉ số đồng hồ".
  - Dropdown "Tháng chốt *" ("Tháng 7 2026").
  - Grey banner: "Không có chỉ số đồng hồ cho tháng này".
- Bottom button: `+ Tạo hoá đơn` to save and navigate back.

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const CreateInvoice: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const initialBuilding = route.params?.building || 'nơ trang long';

  const [selectedBuilding, setSelectedBuilding] = React.useState(initialBuilding);
  const [selectedRoom, setSelectedRoom] = React.useState('p1');
  const [showBuildingDropdown, setShowBuildingDropdown] = React.useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = React.useState(false);

  // Form toggles and states
  const [includeRent, setIncludeRent] = React.useState(true);
  const [rentAmount, setRentAmount] = React.useState('');
  const [includeService, setIncludeService] = React.useState(true);
  const [includeMeter, setIncludeMeter] = React.useState(true);
  const [showMonthDropdown, setShowMonthDropdown] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState('Tháng 7 2026');

  const buildings = ['nơ trang long', 'Home247 Landmark', 'Home247 Riverside'];
  const rooms = ['p1', 'p2', 'p3', 'p4', 'p5'];
  const months = ['Tháng 6 2026', 'Tháng 7 2026', 'Tháng 8 2026'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Tạo hoá đơn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          {/* Tòa nhà selector */}
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

          {/* Phòng selector */}
          <Text style={[styles.label, { marginTop: 16 }]}>Phòng *</Text>
          <Pressable onPress={() => setShowRoomDropdown(!showRoomDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{selectedRoom}</Text>
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

          <View style={styles.divider} />

          {/* Hợp đồng banner */}
          <Text style={styles.sectionHeaderLabel}>Hợp đồng</Text>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Phòng này chưa có hợp đồng</Text>
          </View>

          <View style={styles.divider} />

          {/* Tiền phòng Section */}
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderLabel}>Tiền phòng</Text>
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bao gồm tiền phòng</Text>
            <Switch
              value={includeRent}
              onValueChange={setIncludeRent}
              trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
              thumbColor={includeRent ? theme.colors.primary : '#94a3b8'}
            />
          </View>

          {includeRent && (
            <View style={styles.rentInputs}>
              <TextInput
                style={styles.textInput}
                placeholder="Vd: 5.500.000"
                keyboardType="numeric"
                value={rentAmount}
                onChangeText={setRentAmount}
              />
              
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Thu tiền phòng từ ngày:</Text>
              <View style={styles.dateSelector}>
                <MaterialIcons name="calendar-today" size={18} color="#64748b" />
                <Text style={styles.dateSelectorText}>01/07/2026</Text>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Đến ngày:</Text>
              <View style={styles.dateSelector}>
                <MaterialIcons name="calendar-today" size={18} color="#64748b" />
                <Text style={styles.dateSelectorText}>31/07/2026</Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Dịch vụ Section */}
          <Text style={styles.sectionHeaderLabel}>Dịch vụ</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bao gồm dịch vụ</Text>
            <Switch
              value={includeService}
              onValueChange={setIncludeService}
              trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
              thumbColor={includeService ? theme.colors.primary : '#94a3b8'}
            />
          </View>
          {includeService && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>Vui lòng chọn hợp đồng để xem dịch vụ</Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Đồng hồ Section */}
          <Text style={styles.sectionHeaderLabel}>Đồng hồ</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Bao gồm chỉ số đồng hồ</Text>
            <Switch
              value={includeMeter}
              onValueChange={setIncludeMeter}
              trackColor={{ false: '#e2e8f0', true: '#60a5fa' }}
              thumbColor={includeMeter ? theme.colors.primary : '#94a3b8'}
            />
          </View>
          {includeMeter && (
            <View style={styles.meterInputs}>
              <Text style={styles.inputLabel}>Tháng chốt *</Text>
              <Pressable onPress={() => setShowMonthDropdown(!showMonthDropdown)} style={styles.dropdownButton}>
                <Text style={styles.dropdownButtonText}>{selectedMonth}</Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#a1a1aa" />
              </Pressable>
              {showMonthDropdown && (
                <View style={styles.dropdown}>
                  {months.map((m) => (
                    <Pressable key={m} style={styles.dropdownItem} onPress={() => { setSelectedMonth(m); setShowMonthDropdown(false); }}>
                      <Text style={styles.dropdownItemText}>{m}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={[styles.banner, { marginTop: 12 }]}>
                <Text style={styles.bannerText}>Không có chỉ số đồng hồ cho tháng này</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.saveBtnText}>Tạo hoá đơn</Text>
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
  divider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginVertical: 20,
  },
  sectionHeaderLabel: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 10,
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  rentInputs: {
    marginTop: 8,
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
  inputLabel: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 6,
  },
  dateSelector: {
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
  dateSelectorText: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
  },
  meterInputs: {
    marginTop: 8,
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

export default CreateInvoice;
```

---

### Task 3: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `CreateInvoice` screen in `App.tsx`**

```typescript
import CreateInvoice from './src/screens/CreateInvoice';
```

- [ ] **Step 2: Register `hoa-don/them` route in `App.tsx`**

```typescript
          <Stack.Screen name="hoa-don/them" component={CreateInvoice} />
```

- [ ] **Step 3: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
