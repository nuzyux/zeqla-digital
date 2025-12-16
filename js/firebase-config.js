import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// 1. IMPORT STORAGE
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBT57eVnplohmKS82w0Z7Fw8l3snbUJLms",
  authDomain: "zeqla-digital.firebaseapp.com",
  projectId: "zeqla-digital",
  storageBucket: "zeqla-digital.firebasestorage.app",
  messagingSenderId: "846884344782",
  appId: "1:846884344782:web:079821d8a1750d3d95519f",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // 2. INITIALIZE STORAGE
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { 
    auth, 
    db, 
    storage, // 3. EXPORT STORAGE
    googleProvider, 
    githubProvider,
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    doc,
    setDoc,
    getDoc,
    // Export Storage helper functions for ease of use
    ref,
    uploadBytesResumable,
    getDownloadURL
};