# Design Spec: Tenants Management & List Flow (Màn hình Cư dân & Danh sách cư dân)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for two screens:
1. **Tenants Management Screen** (`TenantsManagement.tsx`): Replaces the generic screen for bottom tab `cu-dan`. Displays a dashboard style grid of pending tasks (approvals) and list of menus to access lists of residents, vehicles, temporary residences, and feedback.
2. **Tenants List Screen** (`TenantsList.tsx`): Displays the list of residents, search bar, notification banner for expiring contracts, status pills, empty state message, and a bottom "+ Thêm cư dân" button.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for bottom tab `cu-dan` with the new `TenantsManagement` component.
* Register a new stack screen `cu-dan/danh-sach` using `TenantsList` component.

### 2. Tenants Management Screen (`src/screens/TenantsManagement.tsx`)
Create a new tab screen matching the user screenshot:
* **Header Title**: "Công việc cần duyệt"
* **Approvals Grid (4 Cards)**:
  - **Card 1 (Cư dân chờ duyệt)**: Orange group icon, number "0", label "Cư dân chờ duyệt".
  - **Card 2 (Phương tiện chờ duyệt)**: Blue car icon, number "0", label "Phương tiện chờ duyệt".
  - **Card 3 (Tạm trú chờ duyệt)**: Orange document icon, number "0", label "Tạm trú chờ duyệt".
  - **Card 4 (Phản ánh chờ duyệt)**: Red forum icon, number "0", label "Phản ánh chờ duyệt".
* **Section Title**: "Thông tin cư dân"
* **Menus List (4 Cards)**:
  - **Danh sách cư dân**: Grey group icon, text "Danh sách cư dân", chevron-right. Clicking it navigates to `cu-dan/danh-sach`.
  - **Danh sách phương tiện**: Grey car icon, text "Danh sách phương tiện", chevron-right.
  - **Danh sách tạm trú**: Grey document icon, text "Danh sách tạm trú", chevron-right.
  - **Danh sách phản ánh**: Grey forum icon, text "Danh sách phản ánh", chevron-right.

### 3. Tenants List Screen (`src/screens/TenantsList.tsx`) [NEW]
Create a new list screen matching the layout:
* **Header**:
  - Back arrow icon on the left.
  - Centered/Left-aligned title "Danh sách cư dân".
* **Search Bar**:
  - Rounded search input, magnifying glass icon, placeholder "Tìm kiếm cư dân...".
* **Notification Banner**:
  - Blue container with a notification bell icon.
  - Text: "3 hợp đồng sắp hết hạn trong tuần này\nKiểm tra danh sách và nhắc khách gia hạn".
  - Chevron right icon.
* **Filter Horizontal Tabs**:
  - Pills: "Đang ở" (selected), "Sắp hết hợp đồng", "Đã hết hợp đồng".
* **Empty State**:
  - Centered text: "Không có thông tin".
* **Bottom Button**:
  - Blue button `+ Thêm cư dân` at the bottom of the screen.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Cư dân" tab displays the new screen.
* Verify clicking "Danh sách cư dân" navigates to the list screen.
* Verify layout elements, notifications, and filters work correctly.
