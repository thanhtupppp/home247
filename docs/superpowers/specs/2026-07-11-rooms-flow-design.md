# Design Spec: Rooms (Căn hộ) & Create Building (Thêm nhà) Flow
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for two screens:
1. **Rooms Management Screen** (`RoomsManagement.tsx`): Replaces the current implementation to display the "Quản lý nhà" screen. It features a search input, filter icon, building items list (like "nơ trang long (1)"), and a bottom "+ Thêm toà nhà" button.
2. **Create Building Screen** (`CreateBuilding.tsx`): A form that allows users to register a new building with fields for basic info (building name, type) and address details (province, ward, street address).

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Register a new stack screen `toa-nha/them` using `CreateBuilding` component.

### 2. Rooms Management Screen (`src/screens/RoomsManagement.tsx`)
Redesign this screen matching the user screenshot:
* **Header**:
  - Title "Quản lý nhà".
  - Right: vertical three-dot icon (`more-vert`) inside a round border button.
* **Search Bar Section**:
  - Rounded search input, placeholder "Tìm kiếm phòng/căn hộ", magnifying glass icon.
  - To the right: filter list icon (`filter-list`) inside a rounded border button.
* **Building List**:
  - Item "nơ trang long (1)" with "Chi tiết" blue text link, downward arrow (`keyboard-arrow-down`) on the right.
* **Bottom Action Button**:
  - Blue button `+ Thêm toà nhà` on the bottom right. Clicking it navigates to `'toa-nha/them'`.

### 3. Create Building Screen (`src/screens/CreateBuilding.tsx`) [NEW]
Create a new screen matching the form layout:
* **Header**:
  - Back arrow icon on the left.
  - Centered title "Thêm nhà".
* **Form Inputs**:
  * **Section 1: Thông tin cơ bản** (with checklist icon):
    - Tên nhà: TextInput, placeholder "Vd: Cơ sở 1".
    - Loại nhà: Dropdown select, placeholder "Chọn loại nhà".
  * **Section 2: Địa chỉ** (with location pin icon):
    - Tỉnh thành phố: Dropdown select, placeholder "Chọn tỉnh/thành".
    - Phường/Xã: Dropdown select, placeholder "Vui lòng chọn tỉnh/thành trước".
    - Địa chỉ chi tiết: TextInput, placeholder "Số nhà, tên đường...".
* **Bottom Buttons**:
  - Left button: "Đóng" (white background, blue border, blue text). Clicking it goes back.
  - Right button: "Thêm nhà" (blue background, white text). Clicking it validates, adds building, and goes back.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Căn hộ" tab displays the new "Quản lý nhà" screen.
* Verify clicking "+ Thêm toà nhà" navigates to `CreateBuilding`.
* Verify input fields, dropdown toggles, and buttons work correctly.
