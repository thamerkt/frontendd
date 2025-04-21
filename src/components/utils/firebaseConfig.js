// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Safely load environment variables (create-react-app / Vite compatible)
const firebaseConfig = {
  apiKey: "AIzaSyCCNTwoeqyFArPqGkLvZju5RgUOnDmBldM",
  authDomain: "pfee-3777d.firebaseapp.com",
  projectId: "pfee-3777d",
  storageBucket: "pfee-3777d.firebasestorage.app",
  messagingSenderId: "43554331610",
  appId: "1:43554331610:web:dfc937c915fd1846fe3ee3",
  measurementId: "G-8QYE9QHC6N"
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