# Design Spec: Settings & Account Profile Flow (Màn hình Cài đặt & Quản lý Tài khoản)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for the Settings/Account flow:
1. **Settings Screen** (`SettingsScreen.tsx`): Replaces the generic bottom tab `Settings` screen. Shows basic user profile summary (avatar, username, phone), 2x2 profile grid (phone, CCCD, DOB, city), edit button, bank accounts section, and avatar selection bottom sheet modal.
2. **Edit Profile Screen** (`EditProfile.tsx`): Form to edit DOB/city, verify CCCD, save info, and change phone number.
3. **Add Bank Account Screen** (`AddBankAccount.tsx`): Form to register a bank account (bank dropdown, account number, branch, owner name).

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace bottom tab screen `Settings` component with `SettingsScreen`.
* Register new stack screen `cai-dat/chinh-sua` using `EditProfile` component.
* Register new stack screen `cai-dat/ngan-hang` using `AddBankAccount` component.

### 2. Settings Screen (`src/screens/SettingsScreen.tsx`) [NEW]
Create a dashboard style profile screen matching screenshots:
* **Header**: Back arrow, title "Thông tin tài khoản".
* **Avatar Card**:
  - Avatar image or circle placeholder with camera overlay button. Clicking it toggles a modal bottom sheet.
  - Text: "tu" (username), phone number with icon.
* **Profile Info Grid (2x2)**:
  - Phone, CCCD, DOB, City with respective icons and values.
* **Edit Button**:
  - Blue button `Chỉnh sửa thông tin` with pencil icon. Navigates to `cai-dat/chinh-sua`.
* **Bank Accounts Section**:
  - Row: "Tài khoản ngân hàng" on the left, "Thêm" text button on the right navigating to `cai-dat/ngan-hang`.
  - Empty text: "Chưa có tài khoản ngân hàng.".
* **Avatar Modal Bottom Sheet**:
  - Modal overlay appearing at the bottom.
  - Three menu rows: "Chụp ảnh mới", "Chọn từ thư viện", "Gỡ ảnh đại diện" with right chevrons and left icons.

### 3. Edit Profile Screen (`src/screens/EditProfile.tsx`) [NEW]
Create form fields matching the layout:
* **Header**: Back arrow, title "Chỉnh sửa thông tin".
* **Form Inputs**:
  - Section: "Thông tin liên hệ" (Ngày sinh, Thành phố).
  - CCCD/CMND buttons: "Xác thực CCCD" and "Lưu thông tin".
  - Section: "Cập nhật số điện thoại" row.

### 4. Add Bank Account Screen (`src/screens/AddBankAccount.tsx`) [NEW]
Create form fields matching the layout:
* **Header**: Back arrow, title "Tài khoản ngân hàng".
* **Form Inputs**:
  - Dropdown: Ngân hàng.
  - Inputs: Số TK, Chi nhánh, Tên chủ tài khoản.
  - Button: "Lưu tài khoản".

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify bottom tab clicks load `SettingsScreen` successfully.
* Verify buttons navigate to `EditProfile` and `AddBankAccount`.
* Verify clicking avatar displays the bottom sheet overlay.
