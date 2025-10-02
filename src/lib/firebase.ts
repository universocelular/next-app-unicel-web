
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validar configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with optimized settings
let db: ReturnType<typeof getFirestore>;

try {
  if (!getApps().length || !getApps()[0]) {
    // Primera inicialización con configuración optimizada
    db = initializeFirestore(app, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      experimentalForceLongPolling: false, // Usar WebSocket cuando sea posible
    });
  } else {
    db = getFirestore(app);
  }
} catch (error) {
  // Fallback a configuración estándar si falla la optimizada
  console.warn('Failed to initialize optimized Firestore, falling back to default:', error);
  db = getFirestore(app);
}

// Initialize Storage
const storage = getStorage(app);

// Connect to emulators in development (solo si están disponibles)
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Verificar si ya está conectado al emulador usando una variable global
    if (!(globalThis as any).__FIREBASE_EMULATOR_CONNECTED__) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
      (globalThis as any).__FIREBASE_EMULATOR_CONNECTED__ = true;
    }
  } catch (error) {
    // Ignorar errores si los emuladores ya están conectados o no están disponibles
    if (!(error as Error).message?.includes('already been called')) {
      console.warn('Firebase emulators not available:', error);
    }
  }
}

export { app, db, storage };

// Exportar tipos útiles para TypeScript
export type { Firestore } from "firebase/firestore";
export type { FirebaseStorage } from "firebase/storage";
