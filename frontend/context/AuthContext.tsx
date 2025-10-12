'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, displayName: string, role: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      // Force token refresh to ensure latest claims
      await firebaseUser.getIdToken(true);
      const res = await api.get('/api/users/me');
      const data = res.data.data as User;
      setProfile(data);
      return data;
    } catch {
      // User exists in Firebase Auth but not in Firestore — auto-create as user
      try {
        await api.post('/api/users/register', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
          role: 'user',
        });
        const res2 = await api.get('/api/users/me');
        const data = res2.data.data as User;
        setProfile(data);
        return data;
      } catch {
        setProfile(null);
        return null;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // fetchProfile is triggered by onAuthStateChanged automatically
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // fetchProfile + auto-register handled by onAuthStateChanged → fetchProfile fallback
  };

  const register = async (email: string, password: string, displayName: string, role: string, phone?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    // Register in Firestore with correct role
    await api.post('/api/users/register', {
      uid: cred.user.uid,
      email,
      displayName,
      role,
      phone,
    });
    // Force re-fetch profile so role is correct
    await fetchProfile(cred.user);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginWithGoogle, register, logout, resetPassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
