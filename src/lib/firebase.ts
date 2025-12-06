import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Replace with your Firebase Web config. For Vite you can inline or use env vars.
const firebaseConfig = {
  apiKey: "AIzaSyB-NwrlQRxiaHSIvJH1P3TC4Dmjh9cAAbo",
  authDomain: "hrextension-f2b64.firebaseapp.com",
  projectId: "hrextension-f2b64",
  storageBucket: "hrextension-f2b64.firebasestorage.app",
  messagingSenderId: "453924179921",
  appId: "1:453924179921:web:a127168b54b6ebfc081af0",
  measurementId: "G-FK8MQX2L0N"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)


