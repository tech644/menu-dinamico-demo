import { getApp, getApps, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredKeys = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseEnabled = import.meta.env.VITE_USE_FIREBASE === "true";
export const hasRequiredFirebaseConfig = requiredKeys.every(
  (value) => typeof value === "string" && value.trim().length > 0
);
export const isFirebaseConfigured = isFirebaseEnabled && hasRequiredFirebaseConfig;

let db: Firestore | null = null;

if (isFirebaseConfigured) {
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
} else if (isFirebaseEnabled && !hasRequiredFirebaseConfig) {
  console.warn(
    "Firebase is enabled but env vars are incomplete. Falling back to mock data."
  );
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    throw new Error("Firestore is not configured. Check Firebase env variables.");
  }

  return db;
}
