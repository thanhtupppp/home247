import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "REMOVED_FROM_HISTORY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "home247.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "home247",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "home247.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "530902362759",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:530902362759:android:83df6bfe7334722d8ee622"
};

const alreadyInitialized = getApps().length > 0;
const app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

export const auth = alreadyInitialized 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });

export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-east1');

if (__DEV__) {
  const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || '192.168.2.6';
  connectFunctionsEmulator(functions, host, 5001);
}
// Firebase app initialized.
