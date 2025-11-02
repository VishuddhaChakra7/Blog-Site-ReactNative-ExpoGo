// src/config/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Secure environment variables (from .env)
import {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
} from "@env";

//  Firebase configuration (hidden from GitHub via .env)
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
};

// Initialize the Firebase app
const app = initializeApp(firebaseConfig);

// Auth with local persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore — using long polling for Expo/dev environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // fixes WebChannel transport warnings
  useFetchStreams: false,
});

//  Firebase Storage (for blog images)
export const storage = getStorage(app);
