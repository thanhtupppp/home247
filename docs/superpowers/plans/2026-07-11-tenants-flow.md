# Tenants Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Cư dân" tab screen and the new "Danh sách cư dân" screen according to user screenshots.

**Architecture:**
- Create `src/screens/TenantsManagement.tsx` containing the grid of 4 approval cards and the vertical list of 4 resident-related menu items.
- Create `src/screens/TenantsList.tsx` containing the search bar, banner card, filter pills, empty state message, and bottom button.
- Update `App.tsx` navigation routes to hook up both components.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

---

### Task 1: Create TenantsManagement Screen

**Files:**
- Create: `src/screens/TenantsManagement.tsx`

- [ ] **Step 1: Create `src/screens/TenantsManagement.tsx`**

Write `TenantsManagement.tsx` to render:
- Approvals section title: "Công việc cần duyệt"
- Grid (2x2 layout):
  - Card 1: Cư dân chờ duyệt (Orange icon, `people`, count 0)
  - Card 2: Phương tiện chờ duyệt (Blue icon, `directions-car`, count 0)
  - Card 3: Tạm trú chờ duyệt (Yellow icon, `description`, count 0)
  - Card 4: Phản ánh chờ duyệt (Red icon, `forum`, count 0)
- Section title: "Thông tin cư dân"
- Vertical menu list:
  - Danh sách cư dân (Grey icon, `people`, navigates to `cu-dan/danh-sach`)
  - Danh sách phương tiện (Grey icon, `directions-car`)
  - Danh sách tạm trú (Grey icon, `description`)
  - Danh sách phản ánh (Grey icon, `forum`)

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const TenantsManagement: React.FC = () => {
  const navigation = useNavigation<any>();

  const approvals = [
    { id: '1', title: 'Cư dân chờ duyệt', count: 0, icon: 'people', iconColor: '#f97316', bgColor: '#fff7ed' },
    { id: '2', title: 'Phương tiện chờ duyệt', count: 0, icon: 'directions-car', iconColor: '#3b82f6', bgColor: '#eff6ff' },
    { id: '3', title: 'Tạm trú chờ duyệt', count: 0, icon: 'description', iconColor: '#eab308', bgColor: '#fefce8' },
    { id: '4', title: 'Phản ánh chờ duyệt', count: 0, icon: 'forum', iconColor: '#ef4444', bgColor: '#fef2f2' },
  ];

  const menus = [
    { id: '1', title: 'Danh sách cư dân', icon: 'people', route: 'cu-dan/danh-sach' },
    { id: '2', title: 'Danh sách phương tiện', icon: 'directions-car', route: 'cu-dan/phuong-tien' },
    { id: '3', title: 'Danh sách tạm trú', icon: 'description', route: 'cu-dan/tam-tru' },
    { id: '4', title: 'Danh sách phản ánh', icon: 'forum', route: 'cu-dan/phan-anh' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Approvals Title */}
        <Text style={styles.sectionTitle}>Công việc cần duyệt</Text>

        {/* 2x2 Grid of Approval Cards */}
        <View style={styles.grid}>
          {approvals.map((item) => (
            <Pressable key={item.id} style={styles.gridCard}>
              <View style={styles.gridCardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                  <MaterialIcons name={item.icon as any} size={22} color={item.iconColor} />
                </View>
                <Text style={styles.bigNumber}>{item.count}</Text>
              </View>
              <Text style={styles.gridCardLabel} numberOfLines={2}>
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Resident Info Section Title */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Thông tin cư dân</Text>

        {/* Vertical menu list */}
        <View style={styles.menuList}>
          {menus.map((menu) => (
            <Pressable 
              key={menu.id} 
              style={styles.menuItemCard}
              onPress={() => {
                if (menu.route === 'cu-dan/danh-sach') {
                  navigation.navigate('cu-dan/danh-sach');
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconCircle}>
                  <MaterialIcons name={menu.icon as any} size={20} color="#475569" />
                </View>
                <Text style={styles.menuItemTitle}>{menu.title}</Text>
              </View>
              <MaterialIcons name="keyboard-arrow-right" size={24} color="#94a3b8" />
            </Pressable>
          ))}
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
  scrollContent: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.lg + 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.onSurface,
    fontWeight: 'bold',
    marginBottom: 16,
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
    gap: 12,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
  gridCardLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  menuList: {
    gap: 12,
  },
  menuItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    ...theme.typography.bodyLg,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
  },
});

export default TenantsManagement;
```

---

### Task 2: Create TenantsList Screen

**Files:**
- Create: `src/screens/TenantsList.tsx`

- [ ] **Step 1: Create `src/screens/TenantsList.tsx`**

Write `TenantsList.tsx` to render:
- Header: back arrow, title "Danh sách cư dân".
- Search Bar: rounded input placeholder "Tìm kiếm cư dân...".
- Notification Banner: blue container, bell icon, title "3 hợp đồng sắp hết hạn trong tuần này", subtitle "Kiểm tra danh sách và nhắc khách gia hạn", chevron-right.
- Filter Horizontal Tabs: "Đang ở" (active), "Sắp hết hợp đồng", "Đã hết hợp đồng".
- Content area showing empty text "Không có thông tin".
- Bottom Button: `+ Thêm cư dân` at the bottom of the screen.

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

export const TenantsList: React.FC = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'active' | 'expiring' | 'expired'>('active');

  const tabs = [
    { key: 'active', label: 'Đang ở' },
    { key: 'expiring', label: 'Sắp hết hợp đồng' },
    { key: 'expired', label: 'Đã hết hợp đồng' },
  ] as const;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Danh sách cư dân</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm cư dân..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Expiring Contracts Notification Banner */}
        <Pressable style={styles.banner}>
          <View style={styles.bannerLeft}>
            <View style={styles.bellCircle}>
              <MaterialIcons name="notifications-none" size={22} color="#3b82f6" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>3 hợp đồng sắp hết hạn trong tuần này</Text>
              <Text style={styles.bannerSubtitle}>Kiểm tra danh sách và nhắc khách gia hạn</Text>
            </View>
          </View>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="#3b82f6" />
        </Pressable>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Không có thông tin</Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.addBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="add" size={24} color={theme.colors.onPrimary} />
          <Text style={styles.addBtnText}>Thêm cư dân</Text>
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
    padding: theme.spacing.marginMobile,
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.onSurface,
    padding: 0,
  },
  banner: {
    backgroundColor: '#eff6ff',
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
    marginBottom: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  bellCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextContainer: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    ...theme.typography.bodyMd,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#3b82f6',
  },
  pillsScroll: {
    gap: 10,
    marginBottom: 24,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onSurfaceVariant,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.marginMobile,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 14,
    gap: 8,
  },
  addBtnText: {
    ...theme.typography.bodyLg,
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
});

export default TenantsList;
```

---

### Task 3: Hook up Routes in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `TenantsManagement` and `TenantsList` in `App.tsx`**

```typescript
import TenantsManagement from './src/screens/TenantsManagement';
import TenantsList from './src/screens/TenantsList';
```

- [ ] **Step 2: Replace tab screen content for route `'cu-dan'`**

Replace:
```typescript
        <Tab.Screen 
          name="cu-dan" 
          options={{
            tabBarLabel: 'Cư dân',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="people" size={size} color={color} />
            ),
          }}
        >
          {() => (
            <GenericScreen 
              title="Quản lý Cư dân" 
              type="tenant" 
              description="Danh sách cư dân, thông tin liên lạc, hợp đồng và lịch sử cư trú." 
            />
          )}
        </Tab.Screen>
```
With:
```typescript
        <Tab.Screen 
          name="cu-dan" 
          component={TenantsManagement}
          options={{
            tabBarLabel: 'Cư dân',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="people" size={size} color={color} />
            ),
          }}
        />
```

- [ ] **Step 3: Register stack screen `cu-dan/danh-sach`**

Inside Stack Navigator in `App.tsx`:
```typescript
          <Stack.Screen name="cu-dan/danh-sach" component={TenantsList} />
```

- [ ] **Step 4: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
