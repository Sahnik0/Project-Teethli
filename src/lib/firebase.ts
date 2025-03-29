
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOFv_f7FiK13r2-kjhXh9zZR-GTC9MSqE",
  authDomain: "teethli.firebaseapp.com",
  projectId: "teethli",
  storageBucket: "teethli.appspot.com", 
  messagingSenderId: "452781943568",
  appId: "1:452781943568:web:eb098f3ab068e6073775395",
  measurementId: "G-3R1HRX1V02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// CORS Configuration for Vercel deployment
// Note: You still need to set up CORS in Firebase Console
// Go to Firebase Console > Storage > Rules and update the rules

export default app;
