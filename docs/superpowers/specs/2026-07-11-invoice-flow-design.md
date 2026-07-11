# Design Spec: Invoice Management & Creation Flow (Màn hình Hóa đơn & Tạo hóa đơn)
Date: 2026-07-11
Status: Draft

## Overview
This design document defines the layout and behavior for two screens:
1. **Invoice Management Screen** (`InvoicesList.tsx`): Displays horizontal month selection, status filters, building selector card, empty/loaded states for invoices, and a bottom action button to create invoices.
2. **Create Invoice Screen** (`CreateInvoice.tsx`): A multi-section form that allows users to select a building and a room, check contract status, toggles for room rent (with date ranges), services, utility meters, and a save button at the bottom.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
* Register a new stack screen `hoa-don/them` using `CreateInvoice` component.
* Ensure `Invoices` in tab bar or stack navigations loads the redesigned `InvoicesList` component.
* Update `Dashboard.tsx` to handle "Hoá đơn" navigation correctly (navigating to `'Invoices'`).

### 2. Invoice Management Screen (`src/screens/InvoicesList.tsx`)
Redesign this screen to match the user screenshot:
* **Header**: Back arrow icon, centered title "Hoá đơn".
* **Months Selector (Horizontal Scroll)**:
  * Months: `2026`, `09/2026`, `10/2026`, `11/2026`, `12/2026`.
* **Filter Pills (Horizontal Scroll)**:
  * `Tất cả` (All) - default active (blue background, white text).
  * `Đã thu tiền` (Collected) - inactive (grey border/background, dark text).
  * `Chưa thu đủ` (Not fully collected) - inactive.
* **Building Selector Card**:
  * Displays building icon, building name "nơ trang long" in blue, badge with count "0", and dropdown arrow icon.
  * Clicking it toggles a dropdown modal/list allowing the user to switch building.
* **Content Area**:
  * If the selected building is "nơ trang long", it currently has 0 invoices. Shows empty state: "Không có hoá đơn".
  * If another building is selected or mock data has invoices, displays card-based details of invoices containing Room code, Tenant name, Amount, and status badge.
* **Bottom Button**:
  * Rounded blue action button `+ Tạo hoá đơn` in a bottom bar container. Clicking it navigates to `hoa-don/them`.

### 3. Create Invoice Screen (`src/screens/CreateInvoice.tsx`)
Create a new screen matching the multi-section form layout:
* **Header**: Back arrow icon, centered title "Tạo hoá đơn".
* **Building Select Dropdown**:
  * Label: "Tòa nhà *"
  * Value: "nơ trang long" (pre-selected building).
* **Room Select Dropdown**:
  * Label: "Phòng *"
  * Value: "p1" (pre-selected room).
* **Contract Section**:
  * Label: "Hợp đồng"
  * Display Banner: "Phòng này chưa có hợp đồng" in a grey container.
* **Room Rent Section (Tiền phòng)**:
  * Title: "Tiền phòng"
  * Toggle: "Bao gồm tiền phòng" (ON/OFF).
  * Input field: "Vd: 5.500.000" (placeholder).
  * Date Picker 1: "Thu tiền phòng từ ngày:" with a calendar icon, value "01/07/2026".
  * Date Picker 2: "Đến ngày:" with a calendar icon, value "31/07/2026".
* **Service Section (Dịch vụ)**:
  * Title: "Dịch vụ"
  * Toggle: "Bao gồm dịch vụ" (ON/OFF).
  * Display Banner: "Vui lòng chọn hợp đồng để xem dịch vụ" in a grey container.
* **Meter Section (Đồng hồ)**:
  * Title: "Đồng hồ"
  * Toggle: "Bao gồm chỉ số đồng hồ" (ON/OFF).
  * Dropdown: "Tháng chốt *" displaying "Tháng 7 2026".
  * Display Banner: "Không có chỉ số đồng hồ cho tháng này" in a grey container.
* **Bottom Action Button**:
  * Large blue button `+ Tạo hoá đơn` in a bottom bar container. Clicking it triggers validation, adds invoice to mock list, and goes back.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Hoá đơn" on Dashboard opens `InvoicesList`.
* Verify changing month, filter pills, and building updates the view.
* Verify clicking "+ Tạo hoá đơn" on `InvoicesList` opens `CreateInvoice`.
* Verify toggles and inputs in `CreateInvoice` function correctly.
* Verify saving an invoice adds it to the list and navigates back.
