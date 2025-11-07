/**
 * Admin Header Component - Pixel Perfect Figma Implementation
 *
 * Top header (1167x80) with search bar, notifications, and user profile
 * Exact positioning and styling from Figma design: 281:155-281:170
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AdminProfileDropdown } from './AdminProfileDropdown';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user } = useAuth();

  // Use auth user data if available
  const displayName = user?.displayName || 'Admin User';
  const displayRole = user?.role === 'super_admin' ? 'Super Admin' : (user?.role === 'admin' ? 'Admin' : 'Admin');
  const photoURL = user?.photoURL;
  const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU';

  return (
    <header
      className="bg-white border-b border-gray-200 shadow-sm w-full"
      style={{
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

        {/* Search Bar - Positioned at x:20, y:20 with 300x40 dimensions as per Figma */}
        <div
          className="absolute"
          style={{
            left: '20px',
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
              paddingLeft: '16px',
              paddingRight: '16px'
            }}
          >
            <input
              type="text"
              placeholder="Find something here..."
              className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '1.2em',
                color: 'rgba(30, 30, 30, 0.5)'
              }}
            />
            <div style={{ width: '16px', height: '16px', marginLeft: '12px' }}>
              <Image
                src="/images/admin-dashboard/search-icon.png"
                alt="Search"
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Right Section: Notifications and User Profile - Pixel Perfect Positioning */}
        <div
          className="absolute flex items-center gap-4"
          style={{
            right: '20px', // 20px from right edge of header
            top: '20px',   // 20px from top edge of header
            height: '40px'
          }}
        >
          {/* Notifications - Positioned exactly as in Figma */}
          <div
            className="relative"
            style={{
              width: '40px',
              height: '40px'
            }}
          >
            <button
              className="relative rounded-full shadow-sm flex items-center justify-center transition-all duration-200 hover:shadow-md hover:border-gray-300 active:scale-95"
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB'
              }}
            >
              <div
                style={{
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
                  right: '-2px',
                  top: '-2px',
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

          {/* User Profile - Positioned at x:1222, y:20 (relative to viewport) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center transition-colors duration-200 hover:opacity-80"
              style={{
                width: '158px',
                height: '40px',
                gap: '12px' // 12px gap between text and avatar
              }}
            >
              {/* User Info Text */}
              <div className="text-left" style={{ width: '106px', height: '32px' }}>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '1.23em',
                    color: '#1E1E1E',
                    marginBottom: '2px',
                    textAlign: 'left'
                  }}
                >
                  {displayName}
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '12px',
                    lineHeight: '1.23em',
                    color: 'rgba(30, 30, 30, 0.5)',
                    textAlign: 'left'
                  }}
                >
                  {displayRole}
                </p>
              </div>

              {/* Profile Avatar or Initials */}
              {photoURL ? (
                <div
                  className="rounded-full overflow-hidden border-2 border-gray-200"
                  style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0
                  }}
                >
                  <Image
                    src={photoURL}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div
                  className="rounded-full border-2 border-gray-200 flex items-center justify-center"
                  style={{
                    width: '40px',
                    height: '40px',
                    flexShrink: 0,
                    backgroundColor: '#3BB77E'
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#FFFFFF'
                    }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </button>

            {/* Pixel-Perfect Profile Dropdown from Figma */}
            <AdminProfileDropdown
              isOpen={showUserMenu}
              onClose={() => setShowUserMenu(false)}
              onLogoutClick={() => {
                console.log('Logout clicked');
                // TODO: Implement logout functionality
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};