# Design Spec: Contract List Screen (Màn hình Hợp đồng)
Date: 2026-07-11
Status: Draft

## Overview
This design document defines the layout and behavior for the contract list screen:
1. **Contract List Screen** (`ContractsList.tsx`): Displays a search bar, filter icon, horizontal filter pills for contract status, and a list of contracts / empty state. Also includes a "+ Tạo HĐ" button on the header to create a new contract.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Replace the generic screen for `hop-dong` stack screen with the new `ContractsList` component.
* Ensure `hop-dong/moi` route is registered (currently points to `GenericScreen`, which is fine, but can be updated later if needed).

### 2. Contract List Screen (`src/screens/ContractsList.tsx`) [NEW]
Create a new screen matching the user screenshot:
* **Header**:
  * Back arrow icon on the left.
  * Centered title "Hợp đồng".
  * Blue text "+ Tạo HĐ" on the right. Clicking it navigates to `hop-dong/moi`.
* **Search Bar & Filter Icon**:
  * Input with rounded corners, placeholder text "Tìm kiếm hợp đồng" and search icon.
  * Square button next to search bar with a filter adjustment icon (e.g. `tune`) and a blue badge dot.
* **Filter Pills (Horizontal Scroll)**:
  * `Tất cả` (All)
  * `Đang ở` (Active) - default active (blue background, white text).
  * `Sắp đến hạn` (Expiring soon)
  * `Đã hết hạn` (Expired)
* **Content Area**:
  * If no contracts exist under the active filter, displays empty state: **"Không có hợp đồng nào"**.
  * If contracts are present, displays detailed list cards of contracts showing room code, client name, status, and duration.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Hợp đồng" on Dashboard opens `ContractsList`.
* Verify search input, filter pills update local state.
* Verify clicking "+ Tạo HĐ" on Header navigates to `hop-dong/moi`.
