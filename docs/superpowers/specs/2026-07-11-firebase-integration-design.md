# Design Spec: Firebase Backend Integration
Date: 2026-07-11
Status: Approved

## Overview
This design spec outlines how we will integrate Google Firebase into the Home247 application.
We will install the Firebase Web JS SDK, create a central Firebase configuration/initialization file, define database schemas in Firestore, and gradually migrate local React states to read/write from Firebase Auth and Firestore.

## Proposed Changes

### 1. Central Firebase Initialization (`src/firebase.ts`) [NEW]
Create `src/firebase.ts` to initialize the Firebase App, Auth, and Firestore services.
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

### 2. Firestore Collection Schema Definitions
* **`users`** (Document ID: Auth UID)
  - `username`: string
  - `phoneNumber`: string
  - `dob`: string
  - `city`: string
  - `cccdStatus`: string (e.g. "Chưa cập nhật", "Đang xử lý", "Đã xác thực")
* **`buildings`**
  - `id`: string
  - `name`: string
  - `type`: string
  - `city`: string
  - `ward`: string
  - `detailAddress`: string
  - `createdAt`: timestamp
* **`tenants`**
  - `id`: string
  - `fullName`: string
  - `phoneNumber`: string
  - `email`: string
  - `dob`: string
  - `gender`: string
  - `buildingId`: string
  - `roomId`: string
  - `moveInDate`: string
  - `notes`: string
  - `createdAt`: timestamp

### 3. Step-by-Step Migration Plan
1. **Install Firebase SDK**: `npm install firebase`.
2. **Initial Config**: Setup `src/firebase.ts` with placeholder/config inputs.
3. **Login Integration**: Update `LoginScreen.tsx` to perform authentication using `signInWithEmailAndPassword` or `createUserWithEmailAndPassword`.
4. **Profile & Edit Info Integration**: Read and write fields from the `users` Firestore document inside `SettingsScreen.tsx` and `EditProfile.tsx`.
5. **Buildings Integration**: Fetch and insert records into `buildings` collection in `RoomsManagement.tsx` and `CreateBuilding.tsx`.
6. **Tenants Integration**: Fetch and insert records into `tenants` collection in `TenantsList.tsx` and `CreateTenant.tsx`.

## Verification Plan
* Verify compilation with no TypeScript errors.
* Verify successful initialization of Firebase services.
