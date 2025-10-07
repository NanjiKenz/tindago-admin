/**
 * Forgot Password Page - TindaGo Admin Dashboard
 *
 * Password recovery page with Firebase Authentication
 * Desktop-first responsive design (1440px baseline)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);

      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: '#F3F5F9'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: '600px',
            height: '600px',
            background: 'linear-gradient(135deg, #3BB77E 0%, #16a34a 100%)',
            top: '-200px',
            right: '-200px',
            filter: 'blur(100px)'
          }}
        />
        <div
          className="absolute rounded-full opacity-10"
          style={{
            width: '400px',
            height: '400px',
            background: 'linear-gradient(135deg, #3BB77E 0%, #16a34a 100%)',
            bottom: '-150px',
            left: '-150px',
            filter: 'blur(80px)'
          }}
        />
      </div>

      {/* Forgot Password Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          width: '100%',
          maxWidth: '520px',
          boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.15)',
          padding: '60px 70px'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/shared/logos/tindago-logo.svg"
            alt="TindaGo"
            width={150}
            height={50}
            className="mx-auto mb-6"
            priority
          />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-gray-900 mb-2 text-center"
            style={{
              fontFamily: 'Clash Grotesk Variable, sans-serif',
              fontWeight: 600,
              fontSize: '28px',
              lineHeight: '1.2'
            }}
          >
            Reset Password
          </h2>
          <p
            className="text-gray-600 text-center"
            style={{
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="space-y-6">
            <div
              className="bg-tindago-50 border border-tindago-200 rounded-xl p-6 text-center"
              style={{
                animation: 'fadeIn 0.3s ease-in'
              }}
            >
              <div className="flex justify-center mb-4">
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#3BB77E'
                  }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-tindago-800 font-semibold text-lg mb-2">Check Your Email</h3>
              <p className="text-tindago-700 text-sm">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>

            <button
              onClick={() => router.push('/auth/login')}
              className="w-full text-tindago-600 hover:text-tindago-700 py-3 px-6 rounded-xl font-semibold text-base border-2 border-tindago-600 hover:border-tindago-700 transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 mb-2"
                style={{
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
                  placeholder="admin@tindago.com"
                  required
                  style={{
                    fontSize: '15px'
                  }}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl p-4"
                style={{
                  animation: 'fadeIn 0.3s ease-in'
                }}
              >
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-4 px-6 rounded-xl font-semibold text-base focus:outline-none focus:ring-4 focus:ring-tindago-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #3BB77E 0%, #16a34a 100%)',
                fontSize: '16px'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push('/auth/login')}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Login
                </span>
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © 2024 TindaGo. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
