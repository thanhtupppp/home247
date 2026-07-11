# Design Spec: Tenants Management Tab Screen (Màn hình Cư dân)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for the main Tenants tab screen:
1. **Tenants Management Screen** (`TenantsManagement.tsx`): Replaces the generic screen for bottom tab `cu-dan`. Displays a dashboard style grid of pending tasks (approvals) and list of menus to access lists of residents, vehicles, temporary residences, and feedback.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for bottom tab `cu-dan` with the new `TenantsManagement` component.

### 2. Tenants Management Screen (`src/screens/TenantsManagement.tsx`) [NEW]
Create a new tab screen matching the user screenshot:
* **Header Title**: "Công việc cần duyệt"
* **Approvals Grid (4 Cards)**:
  - **Card 1 (Cư dân chờ duyệt)**: Orange group icon, number "0", label "Cư dân chờ duyệt".
  - **Card 2 (Phương tiện chờ duyệt)**: Blue car icon, number "0", label "Phương tiện chờ duyệt".
  - **Card 3 (Tạm trú chờ duyệt)**: Orange document icon, number "0", label "Tạm trú chờ duyệt".
  - **Card 4 (Phản ánh chờ duyệt)**: Red forum icon, number "0", label "Phản ánh chờ duyệt".
* **Section Title**: "Thông tin cư dân"
* **Menus List (4 Cards)**:
  - **Danh sách cư dân**: Grey group icon, text "Danh sách cư dân", chevron-right.
  - **Danh sách phương tiện**: Grey car icon, text "Danh sách phương tiện", chevron-right.
  - **Danh sách tạm trú**: Grey document icon, text "Danh sách tạm trú", chevron-right.
  - **Danh sách phản ánh**: Grey forum icon, text "Danh sách phản ánh", chevron-right.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Cư dân" tab displays the new screen.
* Verify layout elements, cards, grids, and typography match the screenshot.
