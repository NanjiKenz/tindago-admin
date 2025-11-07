/**
 * User Create Modal Component - Pixel Perfect Figma Implementation
 *
 * Complete Add Admin modal with Name, Email, Password, DOB, Country, City, Postal Code
 * Figma Design: node-id=1337-5019
 * Mobile-first responsive modal with clean design
 */

'use client';

import React, { useState } from 'react';
import { UserManagementService } from '@/lib/userManagementService';

interface UserCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export const UserCreateModal: React.FC<UserCreateModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dateOfBirth: '',
    country: '',
    city: '',
    postalCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!formData.dateOfBirth.trim()) {
      setError('Date of Birth is required');
      return;
    }
    if (!formData.country.trim()) {
      setError('Country is required');
      return;
    }

    setLoading(true);

    try {
      await UserManagementService.createAdminUser({
        email: formData.email,
        displayName: formData.name,
        password: formData.password,
        role: 'admin',
        status: 'active',
        permissions: []
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        dateOfBirth: '',
        country: '',
        city: '',
        postalCode: ''
      });

      onUserCreated();
      onClose();
    } catch (error) {
      console.error('Error creating admin:', error);
      setError('Failed to create admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Centered popup design */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative transform transition-all w-full"
          style={{
            maxWidth: '522px',
            backgroundColor: '#F3F5F9',
            borderRadius: '20px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 24px 20px 24px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Title - "Add New Admin" */}
            <h2
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '24.6px',
                color: '#1E1E1E',
                margin: 0,
                flex: 1
              }}
            >
              Add New Admin
            </h2>

            {/* Close X Button */}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                borderRadius: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Form Container */}
          <div 
            style={{ 
              padding: '24px 36px 24px 36px',
              maxHeight: 'calc(90vh - 80px)',
              overflowY: 'auto'
            }}
          >
            {/* Error Message */}
            {error && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '12px 16px',
                  backgroundColor: '#FEE2E2',
                  borderRadius: '12px',
                  color: '#DC2626',
                  fontSize: '14px',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    marginBottom: '8px'
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Enter admin name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '0 20px',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  className="placeholder:text-gray-400"
                />
              </div>

              {/* Email Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    marginBottom: '8px'
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '0 20px',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  className="placeholder:text-gray-400"
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    marginBottom: '8px'
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  placeholder="*************"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '0 20px',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  className="placeholder:text-gray-400"
                />
              </div>

              {/* Date of Birth Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    marginBottom: '8px'
                  }}
                >
                  Date of Birth
                </label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '0 20px',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  className="placeholder:text-gray-400"
                />
              </div>

              {/* Country Field */}
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    marginBottom: '8px'
                  }}
                >
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Philippines"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  style={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: 'none',
                    padding: '0 20px',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#1E1E1E',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  className="placeholder:text-gray-400"
                />
              </div>

              {/* City and Postal Code in Row */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                {/* City Field */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '19.68px',
                      color: '#1E1E1E',
                      marginBottom: '8px'
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: 'none',
                      padding: '0 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '19.68px',
                      color: '#1E1E1E',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    className="placeholder:text-gray-400"
                  />
                </div>

                {/* Postal Code Field */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '19.68px',
                      color: '#1E1E1E',
                      marginBottom: '8px'
                    }}
                  >
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter postal code"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    style={{
                      width: '100%',
                      height: '50px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: 'none',
                      padding: '0 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '19.68px',
                      color: '#1E1E1E',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    className="placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '8px'
                }}
              >
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: '48px',
                    backgroundColor: '#E5E7EB',
                    borderRadius: '16px',
                    border: 'none',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#6B7280',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#D1D5DB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#E5E7EB';
                    }
                  }}
                >
                  Cancel
                </button>

                {/* Add Admin Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: '48px',
                    backgroundColor: '#3BB77E',
                    borderRadius: '16px',
                    border: 'none',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '19.68px',
                    color: '#FFFFFF',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#2F9A5F';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.backgroundColor = '#3BB77E';
                    }
                  }}
                >
                  {loading ? 'Creating...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
