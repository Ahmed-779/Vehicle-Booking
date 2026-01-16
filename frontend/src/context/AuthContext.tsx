import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types';
import { authApi, adminApi, getErrorMessage } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status
  const checkAdminStatus = useCallback(async () => {
    try {
      await adminApi.checkAdmin();
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { user } = await authApi.getMe();
        setUser(user);
        await checkAdminStatus();
      } catch {
        // Token is invalid or expired
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [checkAdminStatus]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const { user, token } = await authApi.login(credentials);
      localStorage.setItem('token', token);
      setUser(user);
      await checkAdminStatus();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [checkAdminStatus]);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    try {
      const { user, token } = await authApi.signup(credentials);
      localStorage.setItem('token', token);
      setUser(user);
      await checkAdminStatus();
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, [checkAdminStatus]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await authApi.getMe();
      setUser(user);
      await checkAdminStatus();
    } catch {
      // If refresh fails, log out
      localStorage.removeItem('token');
      setUser(null);
      setIsAdmin(false);
    }
  }, [checkAdminStatus]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
