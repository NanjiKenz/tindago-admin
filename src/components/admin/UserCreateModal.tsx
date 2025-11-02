/**
 * User Create Modal Component - Pixel Perfect Figma Implementation
 *
 * Simple Add Admin modal with Name, Email, and Password fields
 * Figma Design: node-id=1283-1669
 * 500x500px modal with clean, minimal design
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
    password: ''
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

    setLoading(true);

    try {
      await UserManagementService.createAdminUser({
        email: formData.email,
        displayName: formData.name,
        role: 'admin',
        status: 'active',
        permissions: []
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: ''
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

      {/* Modal Container - Pixel Perfect 500x500 from Figma */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative transform transition-all"
          style={{
            width: '500px',
            backgroundColor: '#F3F5F9',
            borderRadius: '16px',
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
            padding: '40px'
          }}
        >
          {/* Title - "Add New Admin" */}
          <h2
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '24px',
              lineHeight: '29.52px',
              color: '#1E1E1E',
              textAlign: 'center',
              margin: '0 0 30px 0'
            }}
          >
            Add New Admin
          </h2>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#FEE2E2',
                borderRadius: '8px',
                color: '#DC2626',
                fontSize: '14px',
                fontFamily: 'Clash Grotesk Variable'
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
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '19.68px',
                  color: '#1E1E1E',
                  marginBottom: '5px'
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
                  width: '420px',
                  height: '50px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: 'none',
                  padding: '0 20px',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: '#1E1E1E',
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0px 0px 8px rgba(59, 130, 246, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.25)';
                }}
              />
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '19.68px',
                  color: '#1E1E1E',
                  marginBottom: '5px'
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
                  width: '420px',
                  height: '50px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: 'none',
                  padding: '0 20px',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: '#1E1E1E',
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0px 0px 8px rgba(59, 130, 246, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.25)';
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '40px' }}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '19.68px',
                  color: '#1E1E1E',
                  marginBottom: '5px'
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
                  width: '420px',
                  height: '50px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: 'none',
                  padding: '0 20px',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: '#1E1E1E',
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0px 0px 8px rgba(59, 130, 246, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = '0px 0px 5px rgba(0, 0, 0, 0.25)';
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '30px',
                justifyContent: 'space-between'
              }}
            >
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  width: '195px',
                  height: '42px',
                  backgroundColor: '#E5E7EB',
                  borderRadius: '16px',
                  border: 'none',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: '#8F8F8F',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
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
                  width: '195px',
                  height: '42px',
                  backgroundColor: '#3B82F6',
                  borderRadius: '16px',
                  border: 'none',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  lineHeight: '22.14px',
                  color: '#FFFFFF',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#3B82F6';
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
  );
};
