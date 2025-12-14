import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  arrayUnion,
  enableIndexedDbPersistence,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY9kqryV_1oUbR5N9tN2x-Kt5jY_ecQSE",
  authDomain: "seorganiza-d4ffd.firebaseapp.com",
  projectId: "seorganiza-d4ffd",
  storageBucket: "seorganiza-d4ffd.firebasestorage.app",
  messagingSenderId: "970910696116",
  appId: "1:970910696116:web:8298918a58a4be65578de1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Habilitar Persistência Offline
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == "failed-precondition") {
    console.log("Persistência falhou: Múltiplas abas abertas.");
  } else if (err.code == "unimplemented") {
    console.log("Navegador não suporta persistência.");
  }
});
const googleProvider = new GoogleAuthProvider();

export {
  auth,
  db,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  arrayUnion,
  enableIndexedDbPersistence,
  analytics,
};
