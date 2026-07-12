---
name: firebase-agent-skills
description: Use when configuring Firebase services, setting up Email/password Authentication, registering apps, or referencing project 530902362759.
---

# Firebase Agent Skills

## Overview
Guidelines for integrating Firebase services (Authentication, Firestore) into the Home247 application using the Firebase project `530902362759`.

## When to Use
- Implementing Firebase Authentication flows.
- Connecting or migrating data to/from Firestore.
- Configuring environment variables or registering client apps (Android/iOS/Web) for the Firebase project.

## Project Details
- **Firebase Project ID / Number:** `530902362759`
- **Authentication Method:** Email/Password Authentication.
- **Client Platforms:** Android App (`com.home247.propertymanagement`).

## Core Configuration & Integration Patterns

### 1. Environment Configuration
Always load credentials from `.env` using Expo's public variables:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=<api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<auth-domain>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<storage-bucket>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=530902362759
EXPO_PUBLIC_FIREBASE_APP_ID=<app-id>
```

### 2. Email/Password Authentication
Verify logins with Firebase Auth:
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// Usage inside screens
await signInWithEmailAndPassword(auth, email, password);
```

### 3. Android App Registration
To register an Android app in the Firebase project:
```bash
firebase apps:create ANDROID "Home247 Android" --package-name com.home247.propertymanagement --project 530902362759
```
