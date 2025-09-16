/**
 * Admin Header Component
 *
 * Modern header for TindaGo Admin Dashboard with branding, navigation, and user profile
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onSidebarToggle,
  isSidebarOpen = false
}) => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white shadow-soft border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Left Section: Logo and Navigation Toggle */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo and Brand */}
            <div className="flex items-center ml-2 lg:ml-0">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-tindago-500 to-tindago-600 rounded-xl shadow-medium">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-secondary-900 tracking-tight">TindaGo Admin</h1>
                <p className="text-secondary-600 text-sm font-medium">Store Management Portal</p>
              </div>
            </div>
          </div>

          {/* Center Section: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search stores, registrations..."
                className="block w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg bg-secondary-50 text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Section: Actions and User Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 7.5h-6a4 4 0 000 8h6m0-8a4 4 0 108 0m-8 0v8m8-8v8" />
              </svg>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Quick Actions */}
            <Button variant="primary" size="sm" className="hidden sm:inline-flex">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Quick Action
            </Button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-secondary-900">
                    {user?.displayName || 'Administrator'}
                  </p>
                  <p className="text-xs text-secondary-600">{user?.email}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tindago-100 text-tindago-800">
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-tindago-500 to-tindago-600 rounded-full flex items-center justify-center shadow-medium">
                  <span className="text-white text-sm font-semibold">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <svg className="w-4 h-4 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-medium border border-secondary-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-secondary-200">
                    <p className="text-sm font-medium text-secondary-900">
                      {user?.displayName || 'Administrator'}
                    </p>
                    <p className="text-xs text-secondary-600">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tindago-100 text-tindago-800 mt-1">
                      {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                  <div className="py-2">
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Settings
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documentation
                    </a>
                  </div>
                  <div className="border-t border-secondary-200 pt-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search stores, registrations..."
              className="block w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg bg-secondary-50 text-secondary-900 placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};