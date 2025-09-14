// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDoJBcJsI9FJ9zh2FFBrmnMsSZBn4Lpiak",
  authDomain: "studentattendance-29930.firebaseapp.com",
  projectId: "studentattendance-29930",
  storageBucket: "studentattendance-29930.appspot.com", // ✅ fixed
  messagingSenderId: "442980804746",
  appId: "1:442980804746:web:e2d5cf1b3b541c3cf12573"
};

// Initialize Firebase with duplicate check
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore, Storage, and Auth
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };