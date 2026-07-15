import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '@services/authService';
import type { User, AuthContextType, RegisterData } from '@types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const data = await loginUser(email, password);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await registerUser(userData);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};