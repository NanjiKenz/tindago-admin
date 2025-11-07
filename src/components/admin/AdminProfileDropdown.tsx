/**
 * Admin Profile Dropdown Component - Pixel Perfect Figma Implementation
 * 
 * Profile dropdown menu (200x196) with user info, settings, and logout
 * Exact positioning and styling from Figma design: 1337:3718
 * 
 * Design Specifications from Figma:
 * - Container: 200x196px, white background, 16px border radius
 * - Profile section: Avatar (40x40), Name, Role, Email
 * - Separator line at y:77.5 with 0.5px stroke
 * - Menu items: Profile Settings, Logout
 * - Footer: Version info and privacy policy
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userInitials?: string;
  onProfileSettingsClick?: () => void;
  onLogoutClick?: () => void;
}

export const AdminProfileDropdown: React.FC<AdminProfileDropdownProps> = ({
  isOpen,
  onClose,
  userName = 'Admin User',
  userEmail = 'admin@tindago.com',
  userRole = 'Admin',
  userInitials = 'AU',
  onProfileSettingsClick,
  onLogoutClick,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // Use auth user data if available, otherwise fall back to props
  const displayName = user?.displayName || userName;
  const displayEmail = user?.email || userEmail;
  const displayRole = user?.role === 'super_admin' ? 'Super Admin' : (user?.role === 'admin' ? 'Admin' : userRole);
  const photoURL = user?.photoURL;
  const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || userInitials;

  const handleProfileSettingsClick = () => {
    onProfileSettingsClick?.();
    onClose();
    router.push('/profile-settings');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Click to close */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ backgroundColor: 'transparent' }}
      />

      {/* Profile Dropdown Container - Exact Image Layout */}
      <div
        className="absolute z-50"
        style={{
          top: '60px',
          right: '0px',
          width: '300px',
          minHeight: '280px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
          padding: '28px'
        }}
      >
        {/* Profile Section - Matching Image Layout */}
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar Circle or Profile Picture */}
          {photoURL ? (
            <div
              className="flex-shrink-0 rounded-full overflow-hidden"
              style={{
                width: '60px',
                height: '60px'
              }}
            >
              <Image
                src={photoURL}
                alt="Profile"
                width={60}
                height={60}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div
              className="flex-shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#3BB77E',
                fontSize: '24px',
                fontWeight: 500,
                color: '#FFFFFF',
                fontFamily: 'Clash Grotesk Variable'
              }}
            >
              {initials}
            </div>
          )}

          {/* User Information */}
          <div className="flex-1">
            {/* Name */}
            <h3
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '22px',
                lineHeight: '1.3',
                color: '#1A1A1A',
                margin: 0,
                marginBottom: '2px'
              }}
            >
              {displayName}
            </h3>

            {/* Role */}
            <p
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '1.4',
                color: '#999999',
                margin: 0,
                marginBottom: '4px'
              }}
            >
              {displayRole}
            </p>

            {/* Email */}
            <p
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '15px',
                lineHeight: '1.4',
                color: '#333333',
                margin: 0
              }}
            >
              {displayEmail}
            </p>
          </div>
        </div>

        {/* Separator Line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#E5E5E5',
            marginBottom: '16px'
          }}
        />

        {/* Profile Settings Button */}
        <button
          onClick={handleProfileSettingsClick}
          className="w-full hover:bg-gray-50 transition-colors duration-150 active:bg-gray-100"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 0',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '4px'
          }}
        >
          {/* Settings Icon */}
          <div
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image
              src="/images/admin-dashboard/settings-icon.png"
              alt="Settings"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>

          {/* Settings Text */}
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '1.3',
              color: '#1A1A1A'
            }}
          >
            Profile Settings
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={() => {
            onLogoutClick?.();
            onClose();
          }}
          className="w-full hover:bg-gray-50 transition-colors duration-150 active:bg-gray-100"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 0',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          {/* Logout Icon */}
          <div
            style={{
              width: '20px',
              height: '20px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Image
              src="/images/admin-dashboard/logout-icon.png"
              alt="Logout"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>

          {/* Logout Text */}
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '18px',
              lineHeight: '1.3',
              color: '#1A1A1A'
            }}
          >
            Logout
          </span>
        </button>

        {/* Version and Privacy Policy Footer */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: '8px',
            borderTop: 'none'
          }}
        >
          <p
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 400,
              fontSize: '13px',
              lineHeight: '1.4',
              color: '#666666',
              margin: 0
            }}
          >
            Version 1.0.0 ~ Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
};
