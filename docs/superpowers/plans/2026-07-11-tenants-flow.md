# Tenants Tab Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the redesigned "Cư dân" tab screen according to the user screenshot.

**Architecture:**
- Create `src/screens/TenantsManagement.tsx` containing the grid of 4 approval cards and the vertical list of 4 resident-related menu items.
- Update `App.tsx` navigation to load this component for the bottom tab route `'cu-dan'`.

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
  - Danh sách cư dân (Grey icon, `people`)
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
              onPress={() => navigation.navigate(menu.route)}
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

### Task 2: Hook up Route in App Navigation

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Import `TenantsManagement` in `App.tsx`**

```typescript
import TenantsManagement from './src/screens/TenantsManagement';
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

- [ ] **Step 3: Run typescript compiler check to verify**

Run `npx tsc --noEmit` and verify it compiles without errors.
