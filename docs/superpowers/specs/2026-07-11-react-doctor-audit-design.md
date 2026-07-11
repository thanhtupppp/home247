# Design Spec: Codebase Quality Optimization & 100/100 React Doctor Score
Date: 2026-07-11
Status: Approved

## Overview
This design spec outlines how we will address all 31 warnings identified by the `react-doctor` audit tool.
Our goal is to reach a perfect quality score of 100/100 by:
1. Moving all static non-state arrays outside component declarations to module scope (`prefer-module-scope-static-value`).
2. Replacing non-virtualized ScrollView-mapped lists with `FlatList` component where appropriate (`rn-no-scrollview-mapped-list`).
3. Deleting unused/dead code files (`deslop/unused-file`).

## Proposed Changes

### 1. Module Scope Static Variables
For the following components, we will move their static array declarations above the component definition:
- `src/screens/AddBankAccount.tsx` (`banks`)
- `src/screens/ContractsList.tsx` (`filters`)
- `src/screens/CreateBuilding.tsx` (`types`, `provinces`, `wards`)
- `src/screens/CreateContract.tsx` (`buildings`, `rooms`, `cycles`)
- `src/screens/CreateDevice.tsx` (`buildings`, `categories`)
- `src/screens/CreateInvoice.tsx` (`buildings`, `rooms`, `months`)
- `src/screens/CreateService.tsx` (`buildings`, `calcMethods`)
- `src/screens/CreateTenant.tsx` (`buildings`, `rooms`)
- `src/screens/InvoicesList.tsx` (`months`, `filters`, `buildings`)
- `src/screens/SettingsScreen.tsx` (`infoGrid`)
- `src/screens/TenantsList.tsx` (`tabs`)
- `src/screens/TenantsManagement.tsx` (`approvals`, `menus`)
- `src/screens/UtilityManagement.tsx` (`months`, `buildings`)
- `src/screens/UtilityRecording.tsx` (`buildings`)

### 2. FlatList Virtualization
For ScrollView lists, replace custom `.map` rendering with FlatList or add ignores/overrides if FlatList breaks scroll layouts (since nested scroll containers can cause issue in React Native, we can also use react-doctor's overrides configuration or safely convert them to FlatList).
Wait, if they are nested inside a ScrollView, we can use `FlatList` or if we need them inside ScrollView, we can declare `scrollEnabled={false}` on FlatList, or just move the arrays to module scope first to see how high the score gets.
Actually, let's convert them to FlatList where possible, or use module scope variables. Moving static variables to module scope is extremely safe and will resolve 27/31 warnings.
For the remaining 3 ScrollView warnings:
- `src/screens/ContractsList.tsx`
- `src/screens/TenantsList.tsx`
- `src/screens/UtilityManagement.tsx`
Let's see if we can convert them to FlatList.

### 3. Delete Unused Files
- Remove `src/screens/SupportRequests.tsx` as it is unused.

## Verification Plan
* Compile project using TypeScript compiler to verify no syntax errors.
* Run `npx -y react-doctor@latest . --score` and check if score reaches 100.
