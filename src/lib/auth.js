import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

const LOCAL_STORAGE_USER_KEY = 'echocloud_demo_user';

// Mock user for offline / test preview mode when Firebase is not configured yet
export const getLocalDemoUser = () => {
  const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

export const setLocalDemoUser = (user) => {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
};

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email, password, displayName = '') {
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  }

  // Local demo fallback
  const demoUser = {
    uid: 'demo-user-' + Math.random().toString(36).substring(2, 9),
    email,
    displayName: displayName || email.split('@')[0],
    isDemo: true,
    createdAt: new Date().toISOString()
  };
  setLocalDemoUser(demoUser);
  return demoUser;
}

/**
 * Login with Email and Password
 */
export async function loginWithEmail(email, password) {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // Local demo fallback
  const demoUser = {
    uid: 'demo-user-active',
    email,
    displayName: email.split('@')[0],
    isDemo: true
  };
  setLocalDemoUser(demoUser);
  return demoUser;
}

/**
 * Sign out
 */
export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  setLocalDemoUser(null);
}

/**
 * Reset Password
 */
export async function resetPassword(email) {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
    return true;
  }
  // Local demo fallback simulates sending reset email
  return true;
}

/**
 * Update Profile Display Name
 */
export async function updateDisplayName(name) {
  if (isFirebaseConfigured && auth && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
    return auth.currentUser;
  }

  const local = getLocalDemoUser();
  if (local) {
    local.displayName = name;
    setLocalDemoUser(local);
    return local;
  }
  return null;
}

/**
 * Auth state listener
 */
export function subscribeToAuth(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user);
    });
  }

  // Offline demo check
  const localUser = getLocalDemoUser();
  callback(localUser);
  return () => {};
}
