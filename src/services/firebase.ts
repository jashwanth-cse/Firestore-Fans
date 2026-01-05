import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    browserLocalPersistence,
    setPersistence,
    Auth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { Platform } from 'react-native';

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with Persistence
let auth: Auth;

if (Platform.OS === 'web') {
    console.log('🌐 Initializing Firebase Auth for WEB with localStorage persistence');
    auth = getAuth(app);
    // Web uses localStorage by default, but we explicitly set it for clarity
    setPersistence(auth, browserLocalPersistence)
        .then(() => console.log('✅ Web auth persistence configured'))
        .catch((err) => console.error("❌ Auth Persistence Error:", err));
} else {
    console.log('📱 Initializing Firebase Auth for NATIVE with AsyncStorage persistence');
    try {
        // Use require to avoid web build issues and submodule path errors
        // getReactNativePersistence is now in 'firebase/auth', not 'firebase/auth/react-native'
        const { getReactNativePersistence } = require('firebase/auth');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;

        if (getReactNativePersistence) {
            auth = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
            });
            console.log('✅ Native auth persistence configured');
        } else {
            console.warn('⚠️ getReactNativePersistence not found in firebase/auth, falling back to default');
            auth = getAuth(app);
        }
    } catch (e: any) {
        if (e.code === 'auth/already-initialized') {
            console.log('⚠️ Auth already initialized, using existing instance');
            auth = getAuth(app);
        } else {
            console.error('❌ Firebase Auth Init Error:', e);
            console.log('⚠️ Falling back to default auth (no persistence)');
            auth = getAuth(app);
        }
    }
}

// Initialize Analytics (web only - Analytics JS SDK works best on web)
let analytics: Analytics | null = null;

if (Platform.OS === 'web') {
    try {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized for web');
    } catch (error) {
        console.warn('⚠️ Firebase Analytics initialization failed:', error);
    }
} else {
    console.log('📱 Firebase Analytics: Using JS SDK events for native (limited functionality)');
}

export { auth, analytics };
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
