# Firebase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Google Firebase, configure the connection client in `src/firebase.ts`, and hook up authentication on the Login screen.

**Architecture:**
- Create `src/firebase.ts` to initialize Firebase application services (Auth, Firestore).
- Hook up `LoginScreen.tsx` to handle authentication using the Firebase SDK.

**Tech Stack:** React Native, Expo, Firebase JS SDK, TypeScript.

---

### Task 1: Setup Firebase SDK & Configuration

- [ ] **Step 1: Install Firebase client package**

Run `npm install firebase` to add Firebase SDK dependencies.

- [ ] **Step 2: Create `src/firebase.ts`**

Write `src/firebase.ts` with placeholder credentials that can be replaced by the user's config:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDevelopment123456",
  authDomain: "home247-dev.firebaseapp.com",
  projectId: "home247-dev",
  storageBucket: "home247-dev.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

---

### Task 2: Integrate Authentication on Login Screen

**Files:**
- Modify: `src/screens/LoginScreen.tsx`

- [ ] **Step 1: Hook login action to Firebase Auth**

Import auth client:
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
```
Update `handleLogin` to call `signInWithEmailAndPassword(auth, email, password)` with proper alert dialog on error, then reset routing on success.
Fallback to mock success on development credentials to ensure the prototype runs even with empty credentials.
