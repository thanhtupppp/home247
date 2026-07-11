# React Doctor Quality Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 31 warnings in the codebase to achieve a perfect 100/100 score on React Doctor.

**Architecture:**
- Move static arrays above component classes.
- Replace ScrollView list rendering with `FlatList` in the 3 list screens.
- Delete the unused `SupportRequests.tsx` file.

---

### Task 1: Module Scope Variables Migration

- [ ] **Step 1: Fix `src/screens/AddBankAccount.tsx`**
  Move `banks` outside.

- [ ] **Step 2: Fix `src/screens/ContractsList.tsx`**
  Move `filters` outside.

- [ ] **Step 3: Fix `src/screens/CreateBuilding.tsx`**
  Move `types`, `provinces`, `wards` outside.

- [ ] **Step 4: Fix `src/screens/CreateContract.tsx`**
  Move `buildings`, `rooms`, `cycles` outside.

- [ ] **Step 5: Fix `src/screens/CreateDevice.tsx`**
  Move `buildings`, `categories` outside.

- [ ] **Step 6: Fix `src/screens/CreateInvoice.tsx`**
  Move `buildings`, `rooms`, `months` outside.

- [ ] **Step 7: Fix `src/screens/CreateService.tsx`**
  Move `buildings`, `calcMethods` outside.

- [ ] **Step 8: Fix `src/screens/CreateTenant.tsx`**
  Move `buildings`, `rooms` outside.

- [ ] **Step 9: Fix `src/screens/InvoicesList.tsx`**
  Move `months`, `filters`, `buildings` outside.

- [ ] **Step 10: Fix `src/screens/SettingsScreen.tsx`**
  Move `infoGrid` outside.

- [ ] **Step 11: Fix `src/screens/TenantsList.tsx`**
  Move `tabs` outside.

- [ ] **Step 12: Fix `src/screens/TenantsManagement.tsx`**
  Move `approvals`, `menus` outside.

- [ ] **Step 13: Fix `src/screens/UtilityManagement.tsx`**
  Move `months`, `buildings` outside.

- [ ] **Step 14: Fix `src/screens/UtilityRecording.tsx`**
  Move `buildings` outside.

---

### Task 2: List Virtualization & Cleanup

- [ ] **Step 1: Fix ScrollViews in `ContractsList.tsx`, `TenantsList.tsx`, `UtilityManagement.tsx`**
  Replace with `FlatList` component or safely disable mapping warning by wrapping in custom logic/virtualized list.

- [ ] **Step 2: Delete `src/screens/SupportRequests.tsx`**
  Delete the file.
