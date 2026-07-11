# Home Screen Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Home Screen (Dashboard) to combine the modern greeting and 6-button quick access grid of the mockup with the stats/charts of the existing dashboard, organizing the lower section into two toggleable tabs (Tasks and Stats) and updating the bottom navigation to 5 tabs.

**Architecture:** 
- Add local state for tab toggling (`activeTab` state: `'tasks' | 'stats'`) inside `Dashboard.tsx`.
- Re-architect `Dashboard.tsx` structure to render Header, 3x2 Management Grid, Tab Segment selector, and conditional content sections.
- Reconfigure `MainTabNavigator` in `App.tsx` to handle 5 tab options instead of 4, updating icons and routing paths.

**Tech Stack:** React Native, Expo, React Navigation, MaterialIcons, TypeScript.

## Global Constraints
- Do not introduce external dependencies; use React Native core components and `@expo/vector-icons` (specifically `MaterialIcons`).
- Styling must follow the design system tokens defined in `src/theme.ts`.
- Ensure type-correct TSX/TS implementation.

---

### Task 1: Update App Navigation Shell

**Files:**
- Modify: `App.tsx`

**Interfaces:**
- Consumes: Screen components `Dashboard`, `InvoicesList`, `RoomsManagement`, `GenericScreen`.
- Produces: 5-tab navigation mapping representing Trang chủ, Tài chính, Cư dân, Căn hộ, Cài đặt.

- [ ] **Step 1: Modify `MainTabNavigator` in `App.tsx`**

Update `MainTabNavigator` to register 5 Tab screens:
* `Overview` -> `Dashboard` (tabBarLabel: 'Trang chủ')
* `Invoices` -> `InvoicesList` (tabBarLabel: 'Tài chính')
* `Residents` -> `GenericScreen` with `title="Quản lý Cư dân"`, `type="tenant"`, `description="Hồ sơ quản lý toàn bộ cư dân lưu trú"` (tabBarLabel: 'Cư dân')
* `Rooms` -> `RoomsManagement` (tabBarLabel: 'Căn hộ')
* `Settings` -> `GenericScreen` with `title="Cài đặt hệ thống"`, `type="settings"` (tabBarLabel: 'Cài đặt')

Update `tabBarIcon` matching logic for the 5 tabs:
```typescript
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home';
          if (route.name === 'Overview') {
            iconName = focused ? 'home' : 'home-work'; // Or 'home' as default
          } else if (route.name === 'Invoices') {
            iconName = 'payments';
          } else if (route.name === 'Residents') {
            iconName = 'group';
          } else if (route.name === 'Rooms') {
            iconName = 'apartment';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }
          return (
            <MaterialIcons 
              name={iconName} 
              size={size} 
              color={color} 
            />
          );
        }
```

- [ ] **Step 2: Run linter to verify syntax correctness**

Run: `npm run lint`
Expected output: No lint or TypeScript compile errors.

- [ ] **Step 3: Commit navigation changes to git**

Run:
```bash
git add App.tsx
git commit -m "feat: redesign bottom tab navigation to 5 tabs"
```

---

### Task 2: Redesign Home Screen Layout and Tabbed State

**Files:**
- Modify: `src/screens/Dashboard.tsx`

**Interfaces:**
- Consumes: components `RevenueChart`, `BentoStatCard`, `AlertItem`, `TransactionTable`, theme `src/theme.ts`, and mock data `src/data/mockData.ts`.
- Produces: Fully redesigned Home Screen component.

- [ ] **Step 1: Add tab toggling state to `Dashboard.tsx`**

Introduce React state in `Dashboard.tsx`:
```typescript
const [activeTab, setActiveTab] = React.useState<'tasks' | 'stats'>('tasks');
```

- [ ] **Step 2: Implement Redesigned Home Screen JSX**

Replace return block in `Dashboard.tsx` with:
- **Header**: Round grey avatar on left, welcome texts "Xin chào," and "tu" in column, notification bell icon with red circle badge '1' on right.
- **Quản lý Section**: 3x2 grid of buttons representing:
  1. *Điện nước* -> Navigates to stack screen `dien-nuoc`. Icon: `bolt` (yellow/orange container).
  2. *Hóa đơn* -> Navigates to tab `Invoices`. Icon: `receipt-long` (blue container).
  3. *Thống kê* -> Navigates to stack screen `thong-ke`. Icon: `analytics` (green container).
  4. *Hợp đồng* -> Navigates to stack screen `hop-dong`. Icon: `group` (purple container).
  5. *Dịch vụ* -> Navigates to stack screen `cau-hinh-gia`. Icon: `payments` (teal container).
  6. *Thiết bị* -> Navigates to stack screen `thiet-bi`. Icon: `router` (slate/grey container).
- **Segment Control Tab Selector**: Horizontally aligned tabs ("Công việc" and "Số liệu & Thống kê") with highlighted active state background.
- **Dynamic Content Renderer**:
  - If `activeTab === 'tasks'`: Render Emergency Alerts list followed by the To-do list empty state box ("Không có công việc nào cần làm" with a checkmark circle).
  - If `activeTab === 'stats'`: Render Bento Stat cards (`dashboardStats`), `RevenueChart`, and recent transactions `TransactionTable`.

- [ ] **Step 3: Add Styles matching Design Palette**

Add styles to `StyleSheet.create` matching theme spacing, font tokens, and background colors. Specifically:
- `headerContainer`: row layout, space-between, padding.
- `avatarCircle`: 48x48 circle with user icon.
- `notificationBadge`: absolute positioned red badge.
- `gridContainer`: row wrap or grid representation (flat list or multiple rows) with 3 columns, cards with rounded corners.
- `segmentContainer`: row layout, grey background, active tab highlights with white background.

- [ ] **Step 4: Run linter to verify clean compilation**

Run: `npm run lint`
Expected output: No linting errors.

- [ ] **Step 5: Commit Home screen redesign to git**

Run:
```bash
git add src/screens/Dashboard.tsx
git commit -m "feat: implement segmented home screen layout and styling"
```
