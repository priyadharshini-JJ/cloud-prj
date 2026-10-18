import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resetPassword,
  updateDisplayName,
  subscribeToAuth,
  getLocalDemoUser
} from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signup = async (email, password, displayName) => {
    setAuthError(null);
    try {
      const newUser = await registerWithEmail(email, password, displayName);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setAuthError(err.message || 'Failed to register account');
      throw err;
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const loggedInUser = await loginWithEmail(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password');
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      setAuthError(err.message || 'Failed to log out');
      throw err;
    }
  };

  const sendPasswordReset = async (email) => {
    setAuthError(null);
    try {
      await resetPassword(email);
      return true;
    } catch (err) {
      setAuthError(err.message || 'Failed to send password reset email');
      throw err;
    }
  };

  const updateProfileName = async (name) => {
    setAuthError(null);
    try {
      const updated = await updateDisplayName(name);
      if (updated) {
        setUser(prev => ({ ...prev, displayName: name }));
      }
      return updated;
    } catch (err) {
      setAuthError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    authError,
    setAuthError,
    isFirebaseConfigured,
    signup,
    login,
    logout,
    sendPasswordReset,
    updateProfileName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
