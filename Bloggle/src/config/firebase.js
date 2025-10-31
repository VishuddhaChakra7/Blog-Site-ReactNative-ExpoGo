// src/config/firebase.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";


const firebaseConfig = {
  apiKey: "AIzaSyAqnP-hUZ3pBTGXDiAhwh7LMzsDMbtlmN8",
  authDomain: "bloggle-app.firebaseapp.com",
  projectId: "bloggle-app",
  storageBucket: "bloggle-app.firebasestorage.app",
  messagingSenderId: "724635077968",
  appId: "1:724635077968:web:e15e62d63c96b117773055",
  measurementId: "G-7X0DS29TVD"
};


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
