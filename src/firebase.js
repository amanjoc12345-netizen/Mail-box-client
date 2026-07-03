// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-librari

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXalu6wZJc9oyY-WFr4vLLyDSHJXG4nxg",
  authDomain: "mail-box-client-5c701.firebaseapp.com",
  projectId: "mail-box-client-5c701",
  storageBucket: "mail-box-client-5c701.firebasestorage.app",
  messagingSenderId: "806505012342",
  appId: "1:806505012342:web:05638b5c39b994e5de9357",
  measurementId: "G-P7MVJ6T5QR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);