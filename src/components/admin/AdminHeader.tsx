/**
 * Admin Header Component - Pixel Perfect Figma Implementation
 *
 * Top header (1167x80) with search bar, notifications, and user profile
 * Exact positioning and styling from Figma design: 281:155-281:170
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className="bg-white border-b border-gray-200 shadow-sm"
      style={{
        width: '1167px',
        height: '80px'
      }}
    >
      <div className="flex items-center justify-between h-full px-5 relative">
        {/* Left Section: Mobile Menu Button (Hidden on desktop as per Figma) */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Search Bar - Positioned at x:293, y:21 with 300x40 dimensions as per Figma */}
        <div
          className="absolute"
          style={{
            left: '20px', // Adjusted for container padding
            top: '20px',
            width: '300px',
            height: '40px'
          }}
        >
          <div
            className="relative flex items-center rounded-2xl"
            style={{
              backgroundColor: '#F1F1F1',
              width: '100%',
              height: '100%',
              padding: '10px'
            }}
          >
            <input
              type="text"
              placeholder="Find something here..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '10px',
                lineHeight: '1.23em',
                color: 'rgba(30, 30, 30, 0.5)'
              }}
            />
            <div style={{ width: '15px', height: '15px', marginLeft: '160px' }}>
              <Image
                src="/images/admin-dashboard/search-icon.png"
                alt="Search"
                width={15}
                height={15}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Notifications and User Profile */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications - Positioned at x:1162, y:19 as per Figma */}
          <div className="relative">
            <button
              className="relative rounded-full shadow-sm"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#FFFFFF'
              }}
            >
              <div
                className="absolute"
                style={{
                  left: '10px',
                  top: '10px',
                  width: '20px',
                  height: '20px'
                }}
              >
                <Image
                  src="/images/admin-dashboard/notification-icon.png"
                  alt="Notifications"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              {/* Notification Badge */}
              <div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  right: '0px',
                  top: '0px',
                  width: '15px',
                  height: '15px',
                  backgroundColor: '#FFBA02'
                }}
              >
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '8px',
                    lineHeight: '1.23em',
                    color: '#1E1E1E'
                  }}
                >
                  3
                </span>
              </div>
            </button>
          </div>

          {/* User Profile - Positioned at x:1222, y:20 as per Figma */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 transition-colors"
              style={{ width: '158px', height: '40px' }}
            >
              {/* User Info Text */}
              <div className="text-left" style={{ width: '108px', height: '32px' }}>
                <p
                  className="text-left"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '1.23em',
                    color: '#1E1E1E',
                    marginBottom: '2px'
                  }}
                >
                  Maynard Dotarot
                </p>
                <p
                  className="text-right"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '1.23em',
                    color: 'rgba(30, 30, 30, 0.5)'
                  }}
                >
                  Admin
                </p>
              </div>

              {/* Profile Avatar */}
              <div
                className="rounded-full overflow-hidden"
                style={{ width: '40px', height: '40px' }}
              >
                <Image
                  src="/images/admin-dashboard/profile-avatar.png"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Maynard Dotarot</p>
                  <p className="text-xs text-gray-600">admin@tindago.com</p>
                </div>
                <div className="py-2">
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </a>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};