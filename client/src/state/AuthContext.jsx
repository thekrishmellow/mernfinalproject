import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'pathfinder_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
      }
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
      }
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  };

  const acceptInvitation = async (payload) => {
    const res = await api.post('/auth/invitations/accept', payload);
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
      }
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Failed to accept invitation');
  };

  const requestMagicLogin = async ({ email, role }) => {
    const res = await api.post('/auth/magic-login/request', { email, role });
    if (res.success) {
      return res;
    }
    throw new Error(res.message || 'Failed to send login link');
  };

  const verifyMagicLogin = async (token) => {
    const res = await api.post('/auth/magic-login/verify', { token });
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
      }
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Failed to verify login link');
  };

  const loginWithGoogle = async ({ credential, role, profile }) => {
    const res = await api.post('/auth/google', { credential, role, profile });
    if (res.success && res.data?.user) {
      if (res.data.token) {
        localStorage.setItem(TOKEN_KEY, res.data.token);
      }
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Google authentication failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        isClient: user?.role === 'client',
        login,
        register,
        loginWithGoogle,
        requestMagicLogin,
        verifyMagicLogin,
        logout,
        checkAuth,
        acceptInvitation
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
