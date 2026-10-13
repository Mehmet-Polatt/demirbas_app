'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { username_or_email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isITOrAdmin: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('it_token');
    const storedUser = localStorage.getItem('it_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Verify with /me
        api.getMe()
          .then((freshUser) => {
            setUser(freshUser);
            localStorage.setItem('it_user', JSON.stringify(freshUser));
          })
          .catch(() => {
            // Token might be expired
            localStorage.removeItem('it_token');
            localStorage.removeItem('it_user');
            setUser(null);
            setToken(null);
          })
          .finally(() => setLoading(false));
        return;
      } catch {
        localStorage.removeItem('it_token');
        localStorage.removeItem('it_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { username_or_email: string; password: string }) => {
    const data = await api.login(credentials);
    const receivedToken = data.access_token;
    const receivedUser = data.user;

    localStorage.setItem('it_token', receivedToken);
    localStorage.setItem('it_user', JSON.stringify(receivedUser));

    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('it_token');
      localStorage.removeItem('it_user');
      setUser(null);
      setToken(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isITOrAdmin = user?.role === 'ADMIN' || user?.role === 'IT_SPECIALIST';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isITOrAdmin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
