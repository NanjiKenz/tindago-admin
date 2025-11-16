/**
 * Login Page - TindaGo Admin Dashboard
 *
 * Figma Design: node-id=759-44184
 * Pixel-perfect implementation matching exact Figma specifications
 * Two-column layout: White login form + Image with quote card
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // Update last login timestamp in admin record
      const user = userCredential.user;
      if (user) {
        try {
          const { ref, update } = await import('firebase/database');
          const { database } = await import('@/lib/firebase');
          const adminRef = ref(database, `admins/${user.uid}`);
          await update(adminRef, {
            lastLoginAt: new Date().toISOString(),
            status: 'active' // Ensure admin is active when they log in
          });
        } catch (updateError) {
          console.error('Error updating last login:', updateError);
          // Don't block login if update fails
        }
      }

      // Redirect to Dashboard page
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      
      const error = err as { code?: string };
      // User-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This account has been disabled. Contact support for assistance.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (error) setError('');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        backgroundColor: '#F3F5F9'
      }}
    >
      {/* Two-Column Container - Exact Figma Layout */}
      <div
        className="flex gap-0"
        style={{
          maxWidth: '1118px', // 500px + 136px gap + 482px
          width: '100%',
          padding: '0 40px'
        }}
      >
        {/* Left Side - White Login Form Box */}
        <div
          className="bg-white flex flex-col items-center"
          style={{
            width: '500px',
            minHeight: '650px',
            padding: '81px 110px 50px 110px'
          }}
        >
          {/* TindaGo Logo - Centered at top */}
          <div className="mb-8">
            <Image
              src="/images/admin/login/tindago-logo.png"
              alt="TindaGo"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>

          {/* Welcome Title - Centered */}
          <h1
            className="mb-4"
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '24px',
              lineHeight: '29.52px',
              color: '#1E1E1E',
              textAlign: 'center'
            }}
          >
            Welcome back
          </h1>

          {/* Subtitle */}
          <p
            className="mb-12"
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '14.76px',
              color: 'rgba(30, 30, 30, 0.5)',
              textAlign: 'center',
              width: '280px',
              padding: '5px 0', // Added vertical padding for spacing
              margin: '0 auto', // Center align horizontally
            }}
          >
            Welcome back admin! Please enter your details.
          </p>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full"
            style={{
              maxWidth: '280px',
              margin: '0 auto',
              padding: '20px', // Added form padding
              boxSizing: 'border-box',
            }}
          >
            {/* Email Field */}
            <div className="mb-8">
              <label
                htmlFor="email"
                style={{
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '17.22px',
                  color: '#1E1E1E',
                  display: 'block',
                  marginBottom: '10px',
                  paddingLeft: '2px', // Small left padding for consistency
                }}
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  border: '1px solid rgba(30, 30, 30, 0.5)',
                  borderRadius: '10px',
                  padding: '0 15px',
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontSize: '12px',
                  color: '#1E1E1E',
                }}
                className="focus:outline-none focus:ring-2 focus:ring-tindago-500 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label
                htmlFor="password"
                style={{
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '17.22px',
                  color: '#1E1E1E',
                  display: 'block',
                  marginBottom: '2px',
                  paddingLeft: '2px',
                   padding: '10px 0', // Added padding top & bottom // Small padding for alignment
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid rgba(30, 30, 30, 0.5)',
                    borderRadius: '10px',
                    padding: '0 15px',
                    paddingRight: '40px',
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontSize: '12px',
                    color: '#1E1E1E',
                  }}
                  className="focus:outline-none focus:ring-2 focus:ring-tindago-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password - Right aligned */}
            <div className="flex justify-end mb-10" style={{ paddingRight: '4px' }}>
              <button
                type="button"
                onClick={() => router.push('/auth/forgot-password')}
                style={{
                  fontFamily: 'Clash Grotesk Variable, sans-serif',
                  fontSize: '12px',
                  color: '#3BB77E',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px 0', // Adds spacing consistency
                }}
                className="hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-4 p-3 rounded-lg"
                style={{
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #EF4444',
                  padding: '10px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable, sans-serif',
                    fontSize: '12px',
                    color: '#991B1B',
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Login Button - Blue */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#0077BE',
                borderRadius: '10px',
                border: 'none',
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px',
                padding: '10px 0', // Button padding
              }}
              className="hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Right Side - Image with Glass Quote Card */}
        <div
          className="hidden lg:block relative ml-[136px]"
          style={{
            width: '482px',
            height: '614px'
          }}
        >
          {/* Background Store Image */}
          <div
            className="absolute inset-0 rounded-[20px] overflow-hidden"
            style={{
              width: '482px',
              height: '614px'
            }}
          >
            <Image
              src="/images/admin/login/store-background.png"
              alt="Store background"
              width={482}
              height={614}
              className="object-cover"
              priority
            />
            {/* Dark Overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: 'rgba(30, 30, 30, 0.2)'
              }}
            />
          </div>

          {/* Glass Quote Card Overlay */}
          <div
            className="absolute"
            style={{
              left: '18px',
              bottom: '18px',
              width: '446px',
              height: '175px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '20px'
            }}
          >
            {/* Quote Text */}
            <p
              className="mb-4"
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '22.14px',
                color: '#FFFFFF'
              }}
            >
              &quot;Quality is never an accident it is always the result of high intention, sincere effort, intelligent direction and skillful execution.&quot;
            </p>

            {/* Author */}
            <p
              className="mb-1"
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '22.14px',
                color: '#FFFFFF'
              }}
            >
              William A. Foster
            </p>

            {/* Title */}
            <p
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '17.22px',
                color: '#FFFFFF'
              }}
            >
              Operations Director Premium Grocery Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
