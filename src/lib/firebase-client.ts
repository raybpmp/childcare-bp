import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

/**
 * Firebase Client SDK Config
 * These are public values — safe for client-side code.
 * The apiKey is NOT a secret; it identifies the project to Google's servers.
 */
const firebaseConfig = {
  apiKey: "AIzaSyBAyO5koa2npQNbP55u0N64D759qSWdWfM",
  authDomain: "childcare-bp.firebaseapp.com",
  projectId: "childcare-bp",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { 
    app, 
    auth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup, 
    googleProvider, 
    signOut, 
    onAuthStateChanged 
};

