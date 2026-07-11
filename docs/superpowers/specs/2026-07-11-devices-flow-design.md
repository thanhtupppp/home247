# Design Spec: Devices List & Creation Flow (Màn hình Thiết bị & Thêm thiết bị)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for two screens:
1. **Devices Screen** (`DevicesList.tsx`): Replaces the generic `thiet-bi` route. Displays groups of devices by building or category using expandable accordion cards. Includes home appliances, bathroom utilities, furniture categories, and a bottom "+ Thêm thiết bị" button.
2. **Create Device Screen** (`CreateDevice.tsx`): A form that allows users to register a new device with fields for building, name, category, and optional description.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for `thiet-bi` stack screen with the new `DevicesList` component.
* Register a new stack screen `thiet-bi/them` using `CreateDevice` component.

### 2. Devices List Screen (`src/screens/DevicesList.tsx`) [NEW]
Create a new screen matching the user screenshot:
* **Header**:
  * Back arrow icon on the left.
  * Title block: Title "Trang thiết bị" next to a blue router icon, subtitle "Quản lý thiết bị tòa nhà".
* **Accordion List**:
  * **Card 1 (Chưa gán tòa nhà - Expanded)**:
    * Header: apartment icon, text "Chưa gán tòa nhà", subtitle "8 thiết bị", chevron-up icon.
    * Expanded Content:
      - Category 1: "Gia dụng" (Home appliances) with number "3" on the right.
        - Item Card: "Máy giặt" (Máy giặt tiêu chuẩn.), chevron-right.
        - Item Card: "Máy lạnh" (Máy lạnh treo tường.), chevron-right.
        - Item Card: "Tủ lạnh" (Tủ lạnh tiêu chuẩn.), chevron-right.
      - Category 2: "Phòng tắm" (Bathroom) with number "1" on the right.
        - Item Card: "Máy nước nóng" (Máy nước nóng phòng tắm.), chevron-right.
      - Category 3: "Nội thất" (Furniture) with number "3" on the right.
        - Item Card: "Bàn làm việc" (Bàn làm việc/học tập.), chevron-right.
        - Item Card: "Giường" (Giường tiêu chuẩn cho 1 người...), chevron-right.
        - Item Card: "Tủ quần áo", chevron-right.
* **Bottom Action Button**:
  * Floating-style blue button `+ Thêm thiết bị` positioned on the bottom right. Clicking it navigates to `thiet-bi/them`.

### 3. Create Device Screen (`src/screens/CreateDevice.tsx`) [NEW]
Create a new screen matching the form layout:
* **Header**:
  * Back arrow icon on the left.
  * Centered/Left-aligned title "Thêm thiết bị".
* **Form Inputs**:
  * **Tòa nhà**: Dropdown select, placeholder "Chọn...".
  * **Tên thiết bị**: TextInput, placeholder "Nhập tên thiết bị", with router icon.
  * **Danh mục**: Dropdown select, placeholder "Chọn danh mục".
  * **Mô tả**: TextInput (multiline), placeholder "Nhập mô tả thiết bị (tùy chọn)", with document icon.
* **Bottom Button**:
  * Large blue button `Tạo thiết bị` (blue background, white text). Clicking it validates, adds device, and goes back.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Thiết bị" on Dashboard opens `DevicesList`.
* Verify clicking "+ Thêm thiết bị" opens `CreateDevice`.
* Verify toggling accordion expansion functions correctly.
