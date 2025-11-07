/**
 * Profile Settings Page - Pixel Perfect Figma Implementation
 * 
 * Based on Figma design: node-id=1337:3597
 * Complete profile management page with personal info, address, and security sections
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';

interface AdminProfile {
  displayName?: string;
  email: string;
  role: string;
  photoURL?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  createdAt?: string;
  lastLogin?: string;
}

export default function ProfileSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin profile data from Firebase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const adminRef = ref(database, `admins/${user.uid}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProfile({
            displayName: data.displayName || data.name || user.displayName,
            email: data.email || user.email,
            role: data.role || user.role,
            photoURL: data.photoURL || user.photoURL,
            dateOfBirth: data.dateOfBirth || '',
            country: data.country || '',
            city: data.city || '',
            postalCode: data.postalCode || '',
            createdAt: data.createdAt,
            lastLogin: data.lastLogin
          });
        } else {
          // Use auth user data if no profile found
          setProfile({
            displayName: user.displayName,
            email: user.email,
            role: user.role,
            photoURL: user.photoURL
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to auth user data
        setProfile({
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          photoURL: user.photoURL
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Use profile data if available, otherwise use auth user data
  const displayName = profile?.displayName || user?.displayName || 'Admin User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = (profile?.role || user?.role) === 'super_admin' ? 'Super Admin' : 'Admin';
  const photoURL = profile?.photoURL || user?.photoURL;
  const initials = displayName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AU';

  return (
    <div
      className="min-h-screen relative"
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        margin: '0 auto'
      }}
    >
      {/* Sidebar - 273px wide */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div
        className="absolute"
        style={{
          left: '273px',
          top: '0px',
          width: '1167px',
          minHeight: '1024px'
        }}
      >
        {/* Header */}
        <div style={{ height: '80px' }}>
          <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Page Content */}
        <div
          style={{
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingTop: '40px'
          }}
        >
          {/* Page Title */}
          <h1
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '48px',
              lineHeight: '59.04px',
              color: '#1E1E1E',
              marginBottom: '40px'
            }}
          >
            My Profile
          </h1>

          {/* Loading State */}
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                fontFamily: 'Clash Grotesk Variable',
                fontSize: '18px',
                color: '#64748B'
              }}
            >
              Loading profile...
            </div>
          ) : (
            <>
          {/* Profile Header Card */}
          <div
            style={{
              width: '1107px',
              height: '160px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
              padding: '30px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            {/* Avatar or Profile Picture */}
            {photoURL ? (
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <Image
                  src={photoURL}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: '#3BB77E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '40px',
                    lineHeight: '49.2px',
                    color: '#FFFFFF'
                  }}
                >
                  {initials}
                </span>
              </div>
            )}

            {/* User Info */}
            <div>
              <h2
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '24px',
                  lineHeight: '29.52px',
                  color: '#1E1E1E',
                  marginBottom: '5px'
                }}
              >
                {displayName}
              </h2>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: 'rgba(30, 30, 30, 0.5)',
                  marginBottom: '5px'
                }}
              >
                {displayRole}
              </p>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: 'rgba(30, 30, 30, 0.8)'
                }}
              >
                {profile?.city && profile?.country 
                  ? `${profile.city}, ${profile.country}` 
                  : (profile?.city || profile?.country || 'Location not set')}
              </p>
            </div>
          </div>

          {/* Personal Information Card */}
          <div
            style={{
              width: '1107px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
              padding: '30px',
              marginBottom: '20px'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '24px',
                  lineHeight: '29.52px',
                  color: '#1E1E1E'
                }}
              >
                Personal Information
              </h3>
              
              {/* Edit Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#3BB77E',
                  borderRadius: '16px',
                  padding: '10px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2E9C66';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3BB77E';
                }}
              >
                <Image
                  src="/images/admin-dashboard/edit-icon.png"
                  alt="Edit"
                  width={15}
                  height={15}
                />
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#FFFFFF'
                  }}
                >
                  Edit
                </span>
              </button>
            </div>

            {/* Separator Line */}
            <div style={{ width: '100%', height: '0.5px', backgroundColor: 'rgba(30, 30, 30, 0.5)', marginBottom: '30px' }} />

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 30px' }}>
              {/* First Name */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  First Name
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {displayName?.split(' ')[0] || 'Maynard'}
                </p>
              </div>

              {/* Last Name */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  Last Name
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {displayName?.split(' ').slice(1).join(' ') || 'Dotarot'}
                </p>
              </div>

              {/* Date of Birth */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  Date of Birth
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {profile?.dateOfBirth || 'Not set'}
                </p>
              </div>

              {/* Email Address */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  Email Address
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {displayEmail}
                </p>
              </div>

              {/* Role */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  Role
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {displayRole}
                </p>
              </div>
            </div>
          </div>

          {/* Address Card */}
          <div
            style={{
              width: '1107px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
              padding: '30px',
              marginBottom: '20px'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '24px',
                  lineHeight: '29.52px',
                  color: '#1E1E1E'
                }}
              >
                Address
              </h3>
              
              {/* Edit Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#3BB77E',
                  borderRadius: '16px',
                  padding: '10px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2E9C66';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3BB77E';
                }}
              >
                <Image
                  src="/images/admin-dashboard/edit-icon.png"
                  alt="Edit"
                  width={15}
                  height={15}
                />
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#FFFFFF'
                  }}
                >
                  Edit
                </span>
              </button>
            </div>

            {/* Separator Line */}
            <div style={{ width: '100%', height: '0.5px', backgroundColor: 'rgba(30, 30, 30, 0.5)', marginBottom: '30px' }} />

            {/* Address Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 30px' }}>
              {/* Country */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  Country
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {profile?.country || 'Not set'}
                </p>
              </div>

              {/* City */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  City
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {profile?.city || 'Not set'}
                </p>
              </div>

              {/* Postal Code */}
              <div>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: 'rgba(30, 30, 30, 0.5)',
                    marginBottom: '5px'
                  }}
                >
                  Postal Code
                </p>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E'
                  }}
                >
                  {profile?.postalCode || 'Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div
            style={{
              width: '1107px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
              padding: '30px',
              marginBottom: '40px'
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h3
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '24px',
                  lineHeight: '29.52px',
                  color: '#1E1E1E'
                }}
              >
                Account Security
              </h3>
              
              {/* Edit Button */}
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#3BB77E',
                  borderRadius: '16px',
                  padding: '10px 20px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2E9C66';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3BB77E';
                }}
              >
                <Image
                  src="/images/admin-dashboard/edit-icon.png"
                  alt="Edit"
                  width={15}
                  height={15}
                />
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#FFFFFF'
                  }}
                >
                  Edit
                </span>
              </button>
            </div>

            {/* Separator Line */}
            <div style={{ width: '100%', height: '0.5px', backgroundColor: 'rgba(30, 30, 30, 0.5)', marginBottom: '30px' }} />

            {/* Password Info */}
            <div>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '19.68px',
                  color: 'rgba(30, 30, 30, 0.5)',
                  marginBottom: '5px'
                }}
              >
                Password
              </p>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '19.68px',
                  color: '#1E1E1E',
                  letterSpacing: '2px'
                }}
              >
                ••••••••••••••••••••••••
              </p>
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
