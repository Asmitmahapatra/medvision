import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, hasFirebaseConfig } from "./firebase";

const AUTH_USER_KEY = "medvision-auth-user";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const ALLOW_DEMO_LOGIN =
  String(import.meta.env.VITE_ALLOW_DEMO_LOGIN ?? "true").toLowerCase() ===
  "true";
const DEMO_EMAIL = (
  import.meta.env.VITE_DEMO_EMAIL ?? "demo@medvision.app"
).toLowerCase();
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? "Demo@123";
const DOCTOR_DEMO_EMAIL = (
  import.meta.env.VITE_DOCTOR_DEMO_EMAIL ?? "doctor@demo.in"
).toLowerCase();

const getStorage = () => {
  if (globalThis.localStorage === undefined) {
    return null;
  }

  return globalThis.localStorage;
};

const getDisplayNameFromEmail = (email) => {
  const localPart = email.split("@")[0] ?? "";
  const clean = localPart.replaceAll(/[._-]+/g, " ").trim();

  if (!clean) {
    return "Medvision User";
  }

  return clean
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

export const isValidEmail = (email) => EMAIL_PATTERN.test(email.trim());

export const getAuthUser = () => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(AUTH_USER_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.email || !isValidEmail(parsed.email)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const loginWithEmail = async (email, password) => {
  const normalizedEmail = email.trim().toLowerCase();
  const storage = getStorage();

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("INVALID_EMAIL");
  }

  if (!storage) {
    throw new Error("STORAGE_UNAVAILABLE");
  }

  if (!password?.trim()) {
    throw new Error("MISSING_PASSWORD");
  }

  if (
    ALLOW_DEMO_LOGIN &&
    normalizedEmail === DEMO_EMAIL &&
    password === DEMO_PASSWORD
  ) {
    const user = {
      uid: "demo-local-user",
      email: DEMO_EMAIL,
      displayName: "Demo User",
      loggedInAt: new Date().toISOString(),
      isDemoUser: true,
    };

    storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  }

  if (!hasFirebaseConfig || !auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    const firebaseUser = credential.user;
    const user = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? normalizedEmail,
      displayName:
        firebaseUser.displayName ??
        getDisplayNameFromEmail(firebaseUser.email ?? normalizedEmail),
      loggedInAt: new Date().toISOString(),
    };

    storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  } catch (error) {
    if (error?.code === "auth/too-many-requests") {
      throw new Error("TOO_MANY_REQUESTS");
    }

    throw new Error("INVALID_CREDENTIALS");
  }
};

const getRoleFromDemoEmail = (email) => {
  if (email === DOCTOR_DEMO_EMAIL) {
    return "doctor";
  }

  return "patient";
};

export const resolveUserRole = async (user) => {
  const normalizedEmail = user?.email?.trim()?.toLowerCase?.() ?? "";

  if (user?.isDemoUser) {
    return getRoleFromDemoEmail(normalizedEmail);
  }

  if (!db || !user?.uid) {
    return null;
  }

  try {
    const snapshot = await getDoc(doc(db, "users", user.uid));
    if (!snapshot.exists()) {
      return null;
    }

    const role = snapshot.data()?.role;
    if (typeof role !== "string") {
      return null;
    }

    return role.trim().toLowerCase();
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  if (auth) {
    await signOut(auth);
  }

  const storage = getStorage();
  storage?.removeItem(AUTH_USER_KEY);
};

export const resetPasswordWithEmail = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidEmail(normalizedEmail)) {
    throw new Error("INVALID_EMAIL");
  }

  if (
    ALLOW_DEMO_LOGIN &&
    normalizedEmail === DEMO_EMAIL
  ) {
    return true;
  }

  if (!hasFirebaseConfig || !auth) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
    return true;
  } catch (error) {
    if (error?.code === "auth/too-many-requests") {
      throw new Error("TOO_MANY_REQUESTS");
    }

    if (error?.code === "auth/user-not-found") {
      throw new Error("RESET_LINK_SENT");
    }

    throw new Error("RESET_FAILED");
  }
};
