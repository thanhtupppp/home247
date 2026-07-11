# Design Spec: Contract Management & Creation Flow (Màn hình Hợp đồng & Tạo hợp đồng)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for two screens:
1. **Contract List Screen** (`ContractsList.tsx`): Displays search bar, horizontal filter pills for contract status, and a list of contracts / empty state. Also includes a "+ Tạo HĐ" button on the header to create a new contract.
2. **Create Contract Screen** (`CreateContract.tsx`): A multi-section form that allows users to register a new contract. It collects tenant information, citizen ID card photos, contract details (building, room, start/sign/end dates, rent, deposit, rent cycle, collection day, and paid-to date), Fixed Devices status, and Services.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for `hop-dong` stack screen with the new `ContractsList` component.
* Replace the generic screen for `hop-dong/moi` stack screen with the new `CreateContract` component.

### 2. Contract List Screen (`src/screens/ContractsList.tsx`)
Create a new screen matching the user screenshot:
* **Header**:
  * Back arrow icon on the left.
  * Centered title "Hợp đồng".
  * Blue text "+ Tạo HĐ" on the right. Clicking it navigates to `hop-dong/moi`.
* **Search Bar & Filter Icon**:
  * Input with rounded corners, placeholder text "Tìm kiếm hợp đồng" and search icon.
  * Square button next to search bar with a filter adjustment icon (`tune`) and a blue badge dot.
* **Filter Pills (Horizontal Scroll)**:
  * `Tất cả` (All)
  * `Đang ở` (Active) - default active (blue background, white text).
  * `Sắp đến hạn` (Expiring soon)
  * `Đã hết hạn` (Expired)
* **Content Area**:
  * Default: Empty state "Không có hợp đồng nào".
  * Displays list cards of contracts showing room code, client name, status, and duration.

### 3. Create Contract Screen (`src/screens/CreateContract.tsx`) [NEW]
Create a new screen matching the multi-section form layout:
* **Header**:
  * Back arrow icon on the left.
  * Centered title "Tạo hợp đồng".
* **Section 1: Thông tin khách thuê** (Tenant Info)
  * Họ và tên: TextInput, placeholder "Nhập họ và tên".
  * Số điện thoại: TextInput, placeholder "09xx xxx xxx".
  * Địa chỉ (Ghi chú): TextInput, placeholder "Nhập địa chỉ hoặc ghi chú (tùy chọn)".
* **Section 2: Căn cước công dân** (Citizen ID Card)
  * Double card column:
    - Card "Mặt trước" with camera-plus icon, subtext "Chạm để chụp".
    - Card "Mặt sau" with camera-plus icon, subtext "Chạm để chụp".
* **Section 3: Thông tin hợp đồng** (Contract Info)
  * Tòa nhà Dropdown: "Chọn tòa nhà".
  * Phòng Dropdown: Displays "Vui lòng chọn toà nhà trước" in a grey box until a building is selected. Once selected, displays room list dropdown.
  * Ngày bắt đầu hợp đồng: Date selector, placeholder "Chọn ngày bắt đầu" with calendar icon.
  * Ngày ký hợp đồng: Date selector, value "11/07/2026" with calendar icon.
  * Hạn hợp đồng: Date selector, placeholder "Chọn ngày hết hạn" with calendar icon.
  * Tiền phòng: TextInput, placeholder "Vd: 5.500.000".
  * Tiền cọc (Tùy chọn): TextInput, placeholder "Vd: 5.500.000".
  * Chu kỳ trả tiền phòng: Dropdown, placeholder "Chọn chu kỳ".
  * Ngày thu tiền phòng: TextInput, placeholder "Nhập ngày (1-31)".
  * Đã trả đến ngày (Tùy chọn): Date selector, placeholder "Chọn ngày đã trả đến" with calendar icon.
* **Section 4: Thiết bị** (Devices)
  * Display Banner: "Vui lòng chọn phòng để xem danh sách thiết bị" in a grey box until a room is selected.
* **Section 5: Dịch vụ** (Services)
  * Display Banner: "Vui lòng chọn toà nhà để xem dịch vụ" in a grey box until a building is selected.
* **Bottom Action Button**:
  * Rounded blue button `+ Tạo hợp đồng`. Clicking it validates input, saves the contract, and navigates back.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Hợp đồng" on Dashboard opens `ContractsList`.
* Verify clicking "+ Tạo HĐ" on Header opens `CreateContract`.
* Verify form inputs, dropdown toggles, and state changes function correctly in `CreateContract`.
