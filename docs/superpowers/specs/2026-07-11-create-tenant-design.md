# Design Spec: Create Tenant Screen (Màn hình Thêm cư dân)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for the Create Tenant screen:
1. **Create Tenant Screen** (`CreateTenant.tsx`): A comprehensive form screen for registering a new resident. It includes sections for basic info (with inline icons and CCCD photo uploads), apartment assignments, contract uploads, toggle options, and a submit button.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Register a new stack screen `cu-dan/them` using `CreateTenant` component.

### 2. Tenants List Screen (`src/screens/TenantsList.tsx`)
* Update the bottom "+ Thêm cư dân" button click action to navigate to `'cu-dan/them'` using React Navigation.

### 3. Create Tenant Screen (`src/screens/CreateTenant.tsx`) [NEW]
Create a new screen matching the multi-page form screenshots:
* **Header**: Back arrow, title "Thêm cư dân".
* **Section 1: Thông tin cơ bản**:
  - Họ và tên: input with person-outline icon.
  - Row of Số điện thoại & Email: inputs with phone/mail icons.
  - Ngày sinh: input with calendar-today icon.
  - CCCD/CMND: Two cards side-by-side (Mặt trước, Mặt sau) with camera plus icon.
  - Giới tính: Horizontal pills "Nam" (checked with checkmark), "Nữ", "Khác".
* **Section 2: Căn hộ**:
  - Row of Dropdowns: Nhà (building dropdown) and Căn hộ (room dropdown).
  - Row of Ngày vào ở (input with calendar/clock icon) and Ghi chú (input with document/tag icon).
* **Section 3: Hợp đồng**:
  - Card for "Tải lên hợp đồng" with a blue PDF icon and sublabel "Chọn file PDF (tối đa 10MB)".
* **Section 4: Tuỳ chọn**:
  - Switch: "Gửi lời mời đăng nhập" (SMS/Email account activation description).
  - Switch: "Nhận thông báo" (Permit updates on processing description).
  - Switch: "Đặt làm liên hệ chính" (Primary notification/OTP description).
* **Action Buttons**:
  - Large blue button `✓ Thêm cư dân`.
  - Text button "Hủy" below it.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "+ Thêm cư dân" on `TenantsList` navigates to `CreateTenant`.
* Verify input fields, dropdown toggles, switches, and buttons work correctly.
