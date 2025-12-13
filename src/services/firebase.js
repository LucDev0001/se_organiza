// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAY9kqryV_1oUbR5N9tN2x-Kt5jY_ecQSE",
  authDomain: "seorganiza-d4ffd.firebaseapp.com",
  projectId: "seorganiza-d4ffd",
  storageBucket: "seorganiza-d4ffd.firebasestorage.app",
  messagingSenderId: "970910696116",
  appId: "1:970910696116:web:8298918a58a4be65578de1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
