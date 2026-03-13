import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { initUserProgressIfMissing } from "./progress";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/** Call GET /api/users/me so backend syncs this user to Neon. Retries a few times (token can be delayed). */
async function syncUserToNeonWithRetry(maxAttempts = 3, delayMs = 400): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const token = await getTokenForApi();
      if (!token) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      const res = await fetch(`${API_BASE}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) return;
    } catch (_) {
      // retry
    }
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, delayMs));
  }
  console.warn("Sync to Neon did not succeed after retries; user may sync on next API call.");
}

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

    // Sync to Neon so user exists in DB before dashboard (retries if token not ready yet)
    await syncUserToNeonWithRetry();

    // 👇 create progress doc if it doesn't exist
    await initUserProgressIfMissing(user.uid);

    return user;
  } catch (error) {
    console.error("Error in signInWithGoogle:", error);
    throw error;
  }
}

export async function logOut() {
  const { clearWildcardAuth } = await import("./wildcardAuth")
  clearWildcardAuth()
  await signOut(auth)
}

import { getWildcardToken } from "./wildcardAuth";

export function listenToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(firebaseUser)
      return
    }
    if (getWildcardToken()) {
      callback({ email: null, uid: "wildcard", isWildcard: true } as User)
      return
    }
    callback(null)
  })
}

/** Token for backend /api/users/*: Firebase ID token or wildcard JWT */
export async function getTokenForApi(): Promise<string | null> {
  const wildcard = getWildcardToken()
  if (wildcard) return wildcard
  const user = auth.currentUser
  if (user) return user.getIdToken()
  return null
}

export function isWildcardUser(): boolean {
  return !!getWildcardToken()
}


