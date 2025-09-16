/**
 * Authentication Context for TindaGo Admin
 *
 * Provides authentication state management throughout the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AdminUser, AuthState } from '@/lib/authService';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    authenticated: false
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setAuthState({
        user,
        loading: false,
        authenticated: !!user
      });
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, loading: true }));

      const user = await AuthService.signIn(email, password);

      setAuthState({
        user,
        loading: false,
        authenticated: true
      });
    } catch (error: any) {
      setError(error.message);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setError(null);
      await AuthService.signOut();

      setAuthState({
        user: null,
        loading: false,
        authenticated: false
      });
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    try {
      setError(null);
      await AuthService.sendPasswordResetEmail(email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signOut,
    sendPasswordResetEmail,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to check if user is authenticated
 */
export const useAuthGuard = (): boolean => {
  const { authenticated, loading } = useAuth();
  return authenticated && !loading;
};

/**
 * Hook to get current admin user
 */
export const useAdminUser = (): AdminUser | null => {
  const { user } = useAuth();
  return user;
};