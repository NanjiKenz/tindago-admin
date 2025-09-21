/**
 * Registration Page
 *
 * Store owner registration form for TindaGo platform
 */

'use client';

import React, { useState } from 'react';
import { FormInput } from '@/components/ui/FormInput';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    storeName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false);
      alert('Registration submitted successfully! Please wait for approval.');
    }, 2000);
  };

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/landing">
            <div className="text-3xl font-bold bg-gradient-to-r from-tindago-600 to-tindago-500 bg-clip-text text-transparent mb-2">
              TindaGo
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join TindaGo</h2>
          <p className="text-gray-600">Register your sari-sari store and start growing your business</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              label="Store Name"
              type="text"
              value={formData.storeName}
              onChange={(value) => handleChange('storeName', value)}
              placeholder="Enter your store name"
              required
            />

            <FormInput
              label="Owner Name"
              type="text"
              value={formData.ownerName}
              onChange={(value) => handleChange('ownerName', value)}
              placeholder="Enter your full name"
              required
            />

            <FormInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              placeholder="Enter your email"
              required
            />

            <FormInput
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
              placeholder="Enter your phone number"
              required
            />

            <FormInput
              label="Store Address"
              type="text"
              value={formData.address}
              onChange={(value) => handleChange('address', value)}
              placeholder="Enter your store address"
              required
            />

            <FormInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              placeholder="Create a password"
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => handleChange('confirmPassword', value)}
              placeholder="Confirm your password"
              required
            />

            {/* Blue signup button as specified */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-tindago-600 hover:text-tindago-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center">
          <Link href="/landing" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}