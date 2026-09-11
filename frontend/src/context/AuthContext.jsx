import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { mockStorage, INITIAL_USERS } from '../api/mockData';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Load session from localStorage or default to sample Customer on initial run
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // Provide seamless first-time onboarding demo account
        const defaultUser = INITIAL_USERS[0]; // Alex Johnson (Customer)
        const mockToken = `mock-token-${defaultUser.id}`;
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(defaultUser));
        localStorage.setItem('demo_mode', 'true');
        setToken(mockToken);
        setUser(defaultUser);
      }
    } catch (e) {
      console.error('Error reading auth state', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const res = await authApi.login(email, password);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name}!`);
        return res.user;
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password, role }) => {
    try {
      setIsLoading(true);
      const res = await authApi.register({ name, email, password, role });
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success(`Account created successfully as ${res.user.role}!`);
        return res.user;
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('You have been logged out.');
  };

  // Quick switch role utility for reviewer demonstration
  const switchRole = useCallback((targetRole) => {
    const users = mockStorage.getUsers();
    let target = users.find((u) => u.role === targetRole);
    if (!target) {
      target = INITIAL_USERS.find((u) => u.role === targetRole) || INITIAL_USERS[0];
    }
    const mockToken = `mock-token-${target.id}-${target.role}`;
    setToken(mockToken);
    setUser(target);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(target));
    toast.success(`Switched role to ${targetRole} (${target.name})`, 'Demo Profile Activated');
  }, [toast]);

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
