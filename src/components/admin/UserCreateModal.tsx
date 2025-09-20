/**
 * User Create Modal Component - Pixel Perfect Implementation
 *
 * Modal for creating new admin users in TindaGo Admin Dashboard
 * Follows exact design patterns from existing admin components
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { UserFormData, UserPermission } from '@/types/userManagement';
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
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    role: 'admin',
    phone: '',
    department: '',
    permissions: [],
    status: 'active',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availablePermissions: UserPermission[] = [
    { resource: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'stores', actions: ['read', 'update'] },
    { resource: 'registrations', actions: ['read', 'update'] },
    { resource: 'analytics', actions: ['read'] },
    { resource: 'settings', actions: ['read', 'update'] }
  ];

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await UserManagementService.createAdminUser(formData);

      // Reset form
      setFormData({
        email: '',
        displayName: '',
        role: 'admin',
        phone: '',
        department: '',
        permissions: [],
        status: 'active',
        notes: ''
      });

      onUserCreated();
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors({ submit: 'Failed to create user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permission: UserPermission) => {
    setFormData(prev => {
      const existingIndex = prev.permissions?.findIndex(p => p.resource === permission.resource) || -1;
      const newPermissions = [...(prev.permissions || [])];

      if (existingIndex >= 0) {
        newPermissions.splice(existingIndex, 1);
      } else {
        newPermissions.push(permission);
      }

      return { ...prev, permissions: newPermissions };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-xl transform transition-all"
          style={{
            width: '600px',
            maxHeight: '90vh',
            maxWidth: '90vw'
          }}
        >
          {/* Header */}
          <div
            className="border-b border-gray-200"
            style={{
              padding: '24px 32px 20px 32px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '24px',
                    lineHeight: '1.2em',
                    color: '#1E1E1E',
                    margin: 0
                  }}
                >
                  Create New Admin User
                </h2>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '1.23em',
                    color: 'rgba(30, 30, 30, 0.6)',
                    margin: '4px 0 0 0'
                  }}
                >
                  Add a new administrator to the TindaGo platform
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{ width: '24px', height: '24px' }}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1E1E'
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px'
                  }}
                  placeholder="admin@tindago.com"
                />
                {errors.email && (
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '4px 0 0 0'
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1E1E'
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all ${
                    errors.displayName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px'
                  }}
                  placeholder="John Administrator"
                />
                {errors.displayName && (
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '4px 0 0 0'
                    }}
                  >
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Role and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#1E1E1E'
                    }}
                  >
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all ${
                      errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px'
                    }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#1E1E1E'
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Phone and Department Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#1E1E1E'
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px'
                    }}
                    placeholder="+63 912 345 6789"
                  />
                </div>

                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#1E1E1E'
                    }}
                  >
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px'
                    }}
                    placeholder="IT Administration"
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label
                  className="block mb-3"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1E1E'
                  }}
                >
                  Permissions
                </label>
                <div className="space-y-2">
                  {availablePermissions.map((permission, index) => (
                    <label key={index} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.permissions?.some(p => p.resource === permission.resource) || false}
                        onChange={() => handlePermissionToggle(permission)}
                        className="rounded border-gray-300 text-tindago-500 focus:ring-tindago-500"
                      />
                      <span
                        style={{
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 400,
                          fontSize: '14px',
                          color: '#1E1E1E',
                          textTransform: 'capitalize'
                        }}
                      >
                        {permission.resource} ({permission.actions.join(', ')})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block mb-2"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: '#1E1E1E'
                  }}
                >
                  Notes
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-tindago-500 focus:border-transparent transition-all resize-none"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px'
                  }}
                  placeholder="Additional notes about this admin user..."
                />
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#DC2626'
                  }}
                >
                  {errors.submit}
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div
            className="border-t border-gray-200 flex justify-end space-x-3"
            style={{
              padding: '20px 32px 24px 32px',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                height: '40px',
                padding: '0 20px'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                height: '40px',
                padding: '0 20px',
                backgroundColor: '#3BB77E'
              }}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Admin User'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};