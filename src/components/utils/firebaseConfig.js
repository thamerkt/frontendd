// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Safely load environment variables (create-react-app / Vite compatible)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCGYwfSf0m-yjtoCidOoEIOwi7w1x_B6FQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "myapplication-79ce1.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "myapplication-79ce1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "myapplication-79ce1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "975433917261",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:975433917261:web:5510abb95e945129ad0d04",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-B9TSGM1HBJ"
};

// Initialize Firebase
let app;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Initialize Analytics only if supported and in client-side
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) analytics = getAnalytics(app);
    });
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

// Export initialized services
export { db, analytics };

// Optional: Export Firebase app instance if needed for other services
export default app;