# Design Spec: Services List Screen (Màn hình Dịch vụ)
Date: 2026-07-11
Status: Draft

## Overview
This design document defines the layout and behavior for the Services screen:
1. **Services Screen** (`ServicesList.tsx`): Replaces the generic `cau-hinh-gia` route. Displays groups of services by building or category using expandable accordion cards. Includes fixed and per-person services, and a bottom "+ Thêm dịch vụ" button.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for `cau-hinh-gia` stack screen with the new `ServicesList` component.

### 2. Services List Screen (`src/screens/ServicesList.tsx`) [NEW]
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
  * Floating-style blue button `+ Thêm dịch vụ` positioned on the bottom right.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Dịch vụ" on Dashboard opens `ServicesList`.
* Verify toggling accordion expansion functions correctly.
