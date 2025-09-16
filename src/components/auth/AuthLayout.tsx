/**
 * Clean Professional Authentication Layout
 *
 * Modern, minimalist auth layout with professional design
 */

'use client';

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-tindago-600 relative">
        <div className="flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-6">
              <span className="text-tindago-600 font-bold text-xl">T</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              TindaGo Admin
            </h1>
            <p className="text-xl text-tindago-100 leading-relaxed">
              Manage your sari-sari store marketplace with professional administrative tools
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-tindago-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-tindago-100">Store Registration Management</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-tindago-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-tindago-100">Real-time Analytics Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-tindago-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span className="text-tindago-100">User & Content Moderation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-tindago-600 rounded-lg mb-4">
              <span className="text-xl font-bold text-white">T</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">TindaGo Admin</h1>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-600">{subtitle}</p>
            )}
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 TindaGo. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};