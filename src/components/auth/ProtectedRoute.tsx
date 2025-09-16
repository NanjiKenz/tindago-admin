/**
 * ProtectedRoute Component
 *
 * Route protection wrapper for authenticated admin access
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'super_admin';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback
}) => {
  const router = useRouter();
  const { user, loading, authenticated } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      fallback || (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tindago-500 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">
              Loading TindaGo Admin
            </h2>
            <p className="text-secondary-600">
              Verifying authentication...
            </p>
          </div>
        </div>
      )
    );
  }

  // Redirect to login if not authenticated
  if (!authenticated || !user) {
    router.push('/auth/login');
    return null;
  }

  // Check role requirements
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-medium p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-secondary-900 mb-2">
              Access Denied
            </h2>
            <p className="text-secondary-600 mb-6">
              You don't have permission to access this area.
              {requiredRole === 'super_admin' && ' Super admin privileges required.'}
            </p>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-tindago-500 hover:bg-tindago-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};