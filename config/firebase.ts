import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAPf7Phzs9g5ZDMs-rCn5LVnWHvQgIe1qE",
  authDomain: "talabaybayin-5b2b0.firebaseapp.com",
  projectId: "talabaybayin-5b2b0",
  storageBucket: "talabaybayin-5b2b0.firebasestorage.app",
  messagingSenderId: "874965190155",
  appId: "1:874965190155:web:350aea584dab89127ee90e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
