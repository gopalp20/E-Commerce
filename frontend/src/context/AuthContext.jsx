import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Load session from localStorage and validate with backend
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Clean up legacy mock tokens if present
        if (storedToken && storedToken.startsWith('mock-')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          return;
        }

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Verify token validity with backend
          try {
            const meRes = await authApi.getMe();
            if (meRes.user) {
              setUser(meRes.user);
              localStorage.setItem('user', JSON.stringify(meRes.user));
            }
          } catch (e) {
            console.warn('Session verification fallback:', e.message);
          }
        }
      } catch (e) {
        console.error('Error reading auth state', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
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
        toast.success(`Account created successfully!`);
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

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
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
