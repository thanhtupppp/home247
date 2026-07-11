# Design Spec: Utility Management & Recording Screen (Màn hình Điện nước & Ghi chỉ số)
Date: 2026-07-11
Status: Approved

## Overview
This design document defines two new screens for managing and recording electricity and water metrics:
1. **Utility Management Screen** (`UtilityManagement.tsx`): Replaces the generic "dien-nuoc" route. Shows horizontal month selection, building selection, and a bottom button navigating to recording.
2. **Utility Recording Screen** (`UtilityRecording.tsx`): Registered as "dien-nuoc/ghi" route. Contains two tabs: "Ghi theo phòng" (Single room) and "Ghi hàng loạt" (Bulk recording) with building and room selector, toggle buttons, and index inputs.

## Proposed Changes

### 1. Navigation Shell (`App.tsx`)
Update stack routing:
* Modify existing stack screen `dien-nuoc` to load `UtilityManagement` component.
* Register new stack screen `dien-nuoc/ghi` to load `UtilityRecording` component.

### 2. Utility Management Screen (`src/screens/UtilityManagement.tsx`)
Create a new screen matching the layout in screenshot 1:
* **Header**: Back arrow icon, centered title "Điện nước".
* **Months Selector (Horizontal Scroll)**:
  * Selectable months list: `2026`, `09/2026`, `10/2026`, `11/2026`, `12/2026`.
  * Active month highlights with black text, inactive months display in grey.
* **Building Dropdown Button**:
  * Displays building icon, building name "nơ trang long" in blue, badge with count "0", and dropdown chevron icon.
  * Clicking it toggles a dropdown modal/list allowing the user to switch building.
* **Bottom Action Button**:
  * Large rounded button with blue background, text "+ Ghi điện nước" in white with a plus icon.
  * Clicking it navigates to the detailed recording screen (`dien-nuoc/ghi`).

### 3. Utility Recording Screen (`src/screens/UtilityRecording.tsx`)
Create a new screen matching the layouts in screenshots 2 & 3:
* **Header**: Back arrow icon, centered title "Ghi điện nước".
* **Tab Switcher (Segmented Control)**:
  * Tab 1: "Ghi theo phòng"
  * Tab 2: "Ghi hàng loạt"
  * Selected tab has a blue underline and blue text; unselected tab has grey text.
* **Tab 1 Content (Ghi theo phòng)**:
  * **Tòa nhà * dropdown**: Select building (pre-selected to the building from Screen 1).
  * **Chọn phòng * dropdown**: Select room.
  * When a room is selected, renders electricity and water index inputs (Chỉ số cũ, Chỉ số mới, Tiêu thụ, Thành tiền).
* **Tab 2 Content (Ghi hàng loạt)**:
  * **Tòa nhà * dropdown**: Select building.
  * **Rooms List**: Vertical scrollable list of rooms. Each room item card renders:
    - Room name (e.g. "Phòng p1") and a Toggle Switch (on/off).
    - If toggle is on: renders inputs for "Chỉ số cũ" (read-only/greyed out) and "Chỉ số mới" (active text input) for both electricity and water.
* **Bottom Save Button**:
  * Large blue button with text "Ghi điện nước" and a save icon. Clicking it saves the indices and navigates back to Screen 1.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Verify clicking "Điện nước" on Dashboard opens `UtilityManagement`.
* Verify clicking horizontal months and building dropdown updates state.
* Verify "+ Ghi điện nước" button navigates to `UtilityRecording`.
* Verify toggling between "Ghi theo phòng" and "Ghi hàng loạt" tabs changes the view.
* Verify toggle switch in Bulk mode works.
* Verify "Save" button triggers state update and redirects back.
