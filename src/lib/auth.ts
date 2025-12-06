import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initUserProgressIfMissing } from "./progress";

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    console.log("Starting Google sign-in...");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Google sign-in successful:", user.uid);

    // Make sure we also have a user doc in Firestore
    const ref = doc(db, "users", user.uid);
    console.log("Creating user document in Firestore...");
    await setDoc(
      ref,
      {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName,
        createdAt: serverTimestamp(),
      },
      { merge: true } // don't overwrite if it exists
    );
    console.log("User document created successfully");

    // 👇 create progress doc if it doesn't exist
    await initUserProgressIfMissing(user.uid);

    return user;
  } catch (error) {
    console.error("Error in signInWithGoogle:", error);
    throw error;
  }
}

export async function logOut() {
  await signOut(auth)
}

export function listenToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}


