# Design Spec: Services List & Creation Flow (Màn hình Dịch vụ & Tạo dịch vụ)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines the layout and behavior for two screens:
1. **Services Screen** (`ServicesList.tsx`): Replaces the generic `cau-hinh-gia` route. Displays groups of services by building or category using expandable accordion cards. Includes fixed and per-person services, and a bottom "+ Thêm dịch vụ" button.
2. **Create Service Screen** (`CreateService.tsx`): A form that allows users to register a new service with fields for name, building, calculation method, optional unit, and unit price.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for `cau-hinh-gia` stack screen with the new `ServicesList` component.
* Register a new stack screen `cau-hinh-gia/them` using `CreateService` component.

### 2. Services List Screen (`src/screens/ServicesList.tsx`)
Create a new screen matching the user screenshot:
* **Header**:
  * Back arrow icon on the left.
  * Title block: Title "Dịch vụ" next to a blue layout icon, subtitle "Quản lý các loại dịch vụ".
* **Accordion List**:
  * **Card 1 (Khác - Expanded)**:
    * Header: apartment icon, text "Khác", subtitle "2 dịch vụ", chevron-up icon.
    * Expanded Content:
      - Category 1: "Cố định" (Fixed) with number "1" on the right.
        - Item Card: "Internet" (90 đ), chevron-right.
      - Category 2: "Theo người" (Per person) with number "1" on the right.
        - Item Card: "Gửi xe" (0 đ/unit), chevron-right.
  * **Card 2 (nơ trang long - Collapsed)**:
    * Header: apartment icon, text "nơ trang long", subtitle "1 dịch vụ", chevron-down icon.
    * Collapsed Content: hidden until expanded.
* **Bottom Action Button**:
  * Floating-style blue button `+ Thêm dịch vụ` positioned on the bottom right. Clicking it navigates to `cau-hinh-gia/them`.

### 3. Create Service Screen (`src/screens/CreateService.tsx`) [NEW]
Create a new screen matching the form layout:
* **Header**:
  * Back arrow icon on the left.
  * Centered/Left-aligned title "Tạo dịch vụ".
* **Form Inputs**:
  * **Tên dịch vụ**: TextInput, placeholder "Vd: Điện, Nước, Internet".
  * **Tòa nhà**: Dropdown select, placeholder "Chọn tòa nhà".
  * **Phương thức tính**: Dropdown select, placeholder "Chọn phương thức tính".
  * **Đơn vị (tùy chọn)**: TextInput, placeholder "Vd: kWh, m³, tháng".
  * **Giá đơn vị**: TextInput, placeholder "Vd: 3500".
* **Bottom Buttons**:
  * Left button: "Đóng" (white background with blue border, blue text). Clicking it goes back.
  * Right button: "+ Tạo dịch vụ" (blue background, white text). Clicking it validates, adds service, and goes back.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Dịch vụ" on Dashboard opens `ServicesList`.
* Verify clicking "+ Thêm dịch vụ" opens `CreateService`.
* Verify toggling accordion expansion functions correctly.
