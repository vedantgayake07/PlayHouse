import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [stats, setStats] = useState({ uploads: 0, favorites: 0, playlists: 0, history: 0 });
  const [userSettings, setUserSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const loadCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      if (res.success && res.data) {
        setUser(res.data.user);
        setStats(res.data.stats || {});
        setUserSettings(res.data.settings || {});
      }
    } catch (err) {
      console.warn('Failed to restore session:', err.message);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        await loadCurrentUser();
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
      throw err;
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await api.auth.register({ name, email, password, confirmPassword });
      if (res.success && res.data) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        toast.success('Account created successfully!');
        await loadCurrentUser();
        return res.data.user;
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.info('You have been logged out.');
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.auth.updateProfile(profileData);
      if (res.success) {
        setUser(res.data);
        toast.success('Profile updated successfully.');
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.auth.changePassword({ currentPassword, newPassword });
      toast.success(res.message || 'Password changed successfully.');
      return true;
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
      throw err;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await api.auth.uploadAvatar(fd);
      if (res.success && res.data) {
        setUser((prev) => ({ ...prev, avatar: res.data.avatar }));
        toast.success('Avatar updated successfully.');
        return res.data.avatar;
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        stats,
        userSettings,
        isLoading,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user && user.role === 'ADMIN'),
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        uploadAvatar,
        refreshUser: loadCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
