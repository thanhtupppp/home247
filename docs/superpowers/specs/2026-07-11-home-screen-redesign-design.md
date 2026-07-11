# Design Spec: Home Screen Redesign (Trang chủ phân tab thông minh)
Date: 2026-07-11
Status: Approved

## Overview
This design document specifies the redesign of the Home Screen (Trang chủ) of the Home247 application. The goal is to merge the aesthetic greeting and 6-button quick access grid of the design mockup with the detailed statistics and charts from the existing Admin Dashboard. 

To prevent information overload on small mobile screens, the redesigned Home Screen implements a tabbed layout (Segmented Control) dividing operational tasks ("Công việc") from business intelligence ("Thống kê").

Additionally, the bottom tab bar is updated to map 5 tabs in total (Trang chủ, Tài chính, Cư dân, Căn hộ, Cài đặt) instead of 4, resolving the navigation discrepancy between current code and design requirements.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
Modify `App.tsx` to expand the bottom navigation from 4 tabs to 5 tabs:
* **Trang chủ** (`Overview` tab) -> points to `Dashboard` component.
* **Tài chính** (`Invoices` tab) -> points to `InvoicesList` component.
* **Cư dân** (`Residents` tab) -> [NEW Tab] points to `GenericScreen` with `type="tenant"`, title="Quản lý Cư dân", description="Hồ sơ quản lý toàn bộ cư dân lưu trú".
* **Căn hộ** (`Rooms` tab) -> points to `RoomsManagement` component.
* **Cài đặt** (`Settings` tab) -> [NEW Tab] points to `GenericScreen` with `type="settings"`, title="Cài đặt hệ thống".

Update the tab icons (`MaterialIcons`) accordingly:
* Trang chủ -> `home` (filled when focused)
* Tài chính -> `payments`
* Cư dân -> `group`
* Căn hộ -> `apartment`
* Cài đặt -> `settings`

### 2. Dashboard Layout (`src/screens/Dashboard.tsx`)
Redesign `Dashboard.tsx` with three vertically stacked sections:

#### Section 1: Greeting Header
* Profile avatar on the left, displaying a placeholder user image.
* Welcome copy: "Xin chào," and user name: "tu" (font weight bold).
* Notification bell icon button on the right inside a light blue rounded square container. Displays a badge with count '1' in a red circle at the top-right.

#### Section 2: Management Grid (Quản lý)
A 3x2 grid of buttons:
1. **Điện nước**: Navigates to `dien-nuoc`. Icon: `bolt` (yellow background).
2. **Hoá đơn**: Navigates to `Invoices` tab. Icon: `description` (blue background).
3. **Thống kê**: Navigates to `thong-ke`. Icon: `analytics` (green background).
4. **Hợp đồng**: Navigates to `hop-dong`. Icon: `group` (purple background).
5. **Dịch vụ**: Navigates to `cau-hinh-gia`. Icon: `account-balance-wallet` (teal background).
6. **Thiết bị**: Navigates to `thiet-bi`. Icon: `router` (gray background).

#### Section 3: Segmented Control & Dynamic Tabs
Implement a segment selector tab bar for two views:
* **Tab 1: Công việc** (Default):
  * Displays high-priority emergency alerts list (`emergencyAlerts`).
  * Displays the To-do list section. If no active tasks, shows a white container card with a checkmark circle and the Vietnamese label: "Không có công việc nào cần làm".
* **Tab 2: Số liệu & Thống kê**:
  * Displays bento cards summarizing KPIs (`dashboardStats`: Total revenue, occupancy rate, new requests).
  * Displays the `RevenueChart` component.
  * Displays a brief recent transactions summary widget (`TransactionTable`).

## Verification Plan
* Validate navigation transition when clicking the bottom tabs.
* Verify the 6 quick-access buttons in the grid navigate to their respective screens or tabs correctly.
* Verify tab selection in the Segmented Control correctly swaps between "Công việc" (Emergency alerts, To-do card) and "Số liệu & Thống kê" (Bento stats, Revenue chart, Transactions).
* Verify layout styling is clean, responsive, and fits within mobile margins on different screen aspect ratios.
