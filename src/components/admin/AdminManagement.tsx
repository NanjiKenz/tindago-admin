/**
 * Admin Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard - Admin User Management Interface
 * Matches design system from Store Management, Customer Management, Transaction Management, and Payout Management
 *
 * EXACT SPECIFICATIONS:
 * - 1440x1024 admin dashboard baseline
 * - Clash Grotesk Variable typography
 * - Exact TindaGo color palette
 * - Stats cards: 270px x 150px with colored icon squares
 * - Table with rounded-20px card, shadow, hover effects
 * - Pixel-perfect positioning and spacing
 * - Manages admin users (super_admin, admin roles)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserManagementService } from '@/lib/userManagementService';
import type { AdminUser } from '@/types/userManagement';
import { UserCreateModal } from '@/components/admin/UserCreateModal';
import { StatusChangeModal } from '@/components/admin/StatusChangeModal';
import { ViewDetailsModal } from '@/components/admin/ViewDetailsModal';
import { RefreshButton } from '@/components/ui/RefreshButton';

export const AdminManagement: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // New Professional Modals State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    action: 'deactivate' | 'suspend' | 'reactivate';
    itemId: string | null;
    itemName: string;
    currentStatus: string;
  }>({
    isOpen: false,
    action: 'deactivate',
    itemId: null,
    itemName: '',
    currentStatus: ''
  });

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    data: AdminUser | null;
  }>({
    isOpen: false,
    data: null
  });

  // Load admin users
  useEffect(() => {
    loadData();
  }, []);

  // Check for URL parameter to open Add Admin modal
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'add') {
      setShowCreateModal(true);
      // Clear the URL parameter after opening modal
      router.replace('/admins');
    }
  }, [searchParams, router]);

  const loadData = async () => {
    setLoading(true);
    const data = await UserManagementService.getAllAdminUsers();
    setAdmins(data);
    setLoading(false);
  };

  // Calculate stats (3 cards only: Total Admin, Active Admin, Inactive Admin)
  const stats = {
    total: admins.length,
    active: admins.filter(a => a.status === 'active').length,
    inactive: admins.filter(a => a.status === 'inactive').length,
  };

  // Filter admins (3 filter options: All, Active, Inactive)
  const filteredAdmins = admins.filter(a => {
    const matchesSearch = !searchTerm ||
      (a.displayName && a.displayName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / pageSize);
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // PROFESSIONAL ACTION HANDLERS

  // 1. VIEW Handler - Opens detailed view modal
  const handleView = (admin: AdminUser) => {
    setViewModal({
      isOpen: true,
      data: admin
    });
  };

  // 2. EDIT Handler - Navigate to edit page
  const handleEdit = (adminId: string) => {
    router.push(`/admins/edit/${adminId}`);
  };

  // 3. DEACTIVATE Handler - Opens status change modal
  const handleDeactivate = (admin: AdminUser) => {
    setStatusModal({
      isOpen: true,
      action: 'deactivate',
      itemId: admin.userId,
      itemName: admin.displayName || admin.email,
      currentStatus: admin.status || 'unknown'
    });
  };

  // 4. REACTIVATE Handler - Opens status change modal
  const handleReactivate = (admin: AdminUser) => {
    setStatusModal({
      isOpen: true,
      action: 'reactivate',
      itemId: admin.userId,
      itemName: admin.displayName || admin.email,
      currentStatus: admin.status || 'unknown'
    });
  };

  // 5. STATUS CHANGE CONFIRM Handler - Processes status change
  const confirmStatusChange = async (reason?: string) => {
    if (!statusModal.itemId) return;

    try {
      setProcessing(true);

      // Determine new status
      const newStatus = statusModal.action === 'reactivate' ? 'active' : 'inactive';

      // Call API
      await UserManagementService.updateUserStatus(statusModal.itemId, newStatus, 'admin');

      // Log reason if provided
      if (reason) {
        console.log(`Status change reason: ${reason}`);
      }

      // Refresh data
      await loadData();

      // Close modal
      setStatusModal({
        isOpen: false,
        action: 'deactivate',
        itemId: null,
        itemName: '',
        currentStatus: ''
      });

      console.log('✅ Admin status updated successfully');

    } catch (error) {
      console.error('❌ Status change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Status update failed';
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className="relative"
      style={{
        width: '100%',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        fontFamily: 'Clash Grotesk Variable'
      }}
    >
      <div
        className="absolute w-full lg:px-5 px-4"
        style={{
          left: '0px',
          top: '40px',
          minHeight: '1200px'
        }}
      >
        {/* Header Section */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '0px',
            width: 'calc(100% - 70px)',
            height: '80px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            paddingBottom: '20px',
            marginBottom: '40px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '48px',
                  lineHeight: '1.2em',
                  color: '#1E1E1E',
                  marginBottom: '8px',
                  margin: 0
                }}
              >
                Admin Management
              </h1>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '16px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  margin: 0,
                  marginTop: '8px'
                }}
              >
                Manage admin users and their permissions
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Refresh Button */}
              <RefreshButton 
                onClick={() => loadData()} 
                loading={loading} 
              />

              {/* Add Admin Button */}
              <button
                onClick={() => setShowCreateModal(true)}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                border: '1px solid #3BB77E',
                backgroundColor: '#3BB77E',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2E9C66';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3BB77E';
              }}
            >
              <Image
                src="/images/shared/icons/plus-icon.png"
                alt="Add"
                width={16}
                height={16}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              Add Admin
            </button>
            </div>
          </div>
        </div>

        {/* Stats Cards - 3 cards only: Total Admin, Active Admin, Inactive Admin */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '120px',
            width: '825px',
            height: '150px'
          }}
        >
          <div
            className="relative"
            style={{
              width: '825px',
              height: '150px'
            }}
          >
            {/* Total Admin Card */}
            <div
              className="absolute bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-tindago-400"
              style={{
                left: '0px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => setStatusFilter('all')}
            >
              <div className="relative w-full h-full">
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '20px'
                  }}
                >
                  <Image
                    src="/images/admin/admin-management/total-admin-icon.svg"
                    alt="Total Admin"
                    width={32}
                    height={32}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    top: '20px',
                    width: '150px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '1.2em',
                      color: '#1E1E1E',
                      marginBottom: '4px'
                    }}
                  >
                    Total Admin
                  </p>
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '20px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '32px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {stats.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Admin Card */}
            <div
              className="absolute bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-tindago-400"
              style={{
                left: '275px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => setStatusFilter('active')}
            >
              <div className="relative w-full h-full">
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '20px'
                  }}
                >
                  <Image
                    src="/images/admin/admin-management/active-admin-icon.svg"
                    alt="Active Admin"
                    width={32}
                    height={32}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    top: '20px',
                    width: '150px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '1.2em',
                      color: '#1E1E1E',
                      marginBottom: '4px'
                    }}
                  >
                    Active Admin
                  </p>
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '20px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '32px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {stats.active.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Inactive Admin Card */}
            <div
              className="absolute bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-tindago-400"
              style={{
                left: '550px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => setStatusFilter('inactive')}
            >
              <div className="relative w-full h-full">
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '20px'
                  }}
                >
                  <Image
                    src="/images/admin/admin-management/inactive-admin-icon.svg"
                    alt="Inactive Admin"
                    width={32}
                    height={32}
                  />
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    top: '20px',
                    width: '150px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '1.2em',
                      color: '#1E1E1E',
                      marginBottom: '4px'
                    }}
                  >
                    Inactive Admin
                  </p>
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '20px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '32px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {stats.inactive.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar - Synchronized with Store/Customer Management */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '290px',
            width: '1095px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Search Input - Left Side */}
          <div
            style={{
              position: 'relative',
              flex: 1
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            >
              <Image
                src="/images/admin-dashboard/search-icon.png"
                alt="Search"
                width={18}
                height={18}
                className="object-contain"
                style={{ opacity: 0.5 }}
              />
            </div>
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 48px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: '#FFFFFF',
                fontFamily: 'Clash Grotesk Variable',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter Badges */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {(['all', 'active', 'inactive'] as const).map((status) => {
              const isActive = statusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: isActive ? '#3BB77E' : '#CBD5E1',
                    backgroundColor: isActive ? '#3BB77E' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F1F5F9';
                      e.currentTarget.style.borderColor = '#94A3B8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#CBD5E1';
                    }
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              );
            })}

            {/* Export CSV Button */}
            <button
              onClick={() => {
                const csvData = filteredAdmins.map(admin => ({
                  Name: admin.displayName || 'Unknown',
                  Email: admin.email,
                  Status: admin.status || 'inactive',
                  Role: admin.role || 'admin',
                  'Last Login': admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'
                }));

                const headers = Object.keys(csvData[0] || {});
                const csv = [
                  headers.join(','),
                  ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
                ].join('\n');

                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tindago-admins-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #3BB77E',
                backgroundColor: '#3BB77E',
                color: '#FFFFFF',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginLeft: '4px',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2E9C66';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#3BB77E';
                }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {loading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
          </div>
        </div>

        {/* Admin Table */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '360px',
            width: '1095px',
            minHeight: '600px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            {loading ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center'
                }}
              >
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    color: '#64748B',
                    margin: 0
                  }}
                >
                  Loading admins...
                </p>
              </div>
            ) : paginatedAdmins.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#1E293B',
                    marginBottom: '8px'
                  }}
                >
                  No admins found
                </h3>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#64748B',
                    margin: 0
                  }}
                >
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              <div>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC'
                      }}
                    >
                      <th
                        style={{
                          padding: '20px 20px',
                          textAlign: 'left',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: '20px 20px',
                          textAlign: 'left',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: '20px 20px',
                          textAlign: 'left',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          padding: '20px 20px',
                          textAlign: 'left',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Last Login
                      </th>
                      <th
                        style={{
                          padding: '20px 20px',
                          textAlign: 'center',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdmins.map((admin, index) => (
                      <tr
                        key={admin.userId}
                        style={{
                          borderBottom: index < paginatedAdmins.length - 1 ? '1px solid #E2E8F0' : 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Name with avatar/icon */}
                        <td style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#3BB77E',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Image
                                src="/images/shared/icons/user-icon.png"
                                alt="User"
                                width={20}
                                height={20}
                                style={{ filter: 'brightness(0) invert(1)' }}
                              />
                            </div>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 500,
                              fontSize: '14px',
                              color: '#1E1E1E',
                              margin: 0
                            }}>
                              {admin.displayName || 'Unknown'}
                            </p>
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: '20px' }}>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#1E1E1E',
                            margin: 0
                          }}>
                            {admin.email}
                          </p>
                        </td>

                        {/* Status badge */}
                        <td style={{ padding: '20px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            paddingLeft: '12px',
                            paddingRight: '12px',
                            paddingTop: '6px',
                            paddingBottom: '6px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            fontFamily: 'Clash Grotesk Variable',
                            border: 'none',
                            backgroundColor: admin.status === 'active' ? '#22C55E' : '#EF4444',
                            color: '#FFFFFF'
                          }}>
                            {admin.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td style={{ padding: '20px' }}>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: 'rgba(30, 30, 30, 0.6)',
                            margin: 0
                          }}>
                            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Never'}
                          </p>
                        </td>

                        {/* Action icons */}
                        <td style={{ padding: '25px 20px' }}>
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>

                            {/* VIEW Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(admin);
                              }}
                              title="View details"
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3BB77E';
                                e.currentTarget.style.borderColor = '#3BB77E';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                              }}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>

                            {/* DEACTIVATE / REACTIVATE Button (status-based) */}
                            {admin.status === 'active' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeactivate(admin);
                                }}
                                title="Deactivate admin"
                                disabled={processing}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0, 0, 0, 0.05)',
                                  backgroundColor: '#FFFFFF',
                                  cursor: processing ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease',
                                  opacity: processing ? 0.5 : 1,
                                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                                }}
                                onMouseEnter={(e) => {
                                  if (!processing) {
                                    e.currentTarget.style.backgroundColor = '#EF4444';
                                    e.currentTarget.style.borderColor = '#EF4444';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                  e.currentTarget.style.transform = 'translateY(0px)';
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="10" y1="15" x2="10" y2="9"/>
                                  <line x1="14" y1="15" x2="14" y2="9"/>
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReactivate(admin);
                                }}
                                title="Reactivate admin"
                                disabled={processing}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0, 0, 0, 0.05)',
                                  backgroundColor: '#FFFFFF',
                                  cursor: processing ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s ease',
                                  opacity: processing ? 0.5 : 1,
                                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                                }}
                                onMouseEnter={(e) => {
                                  if (!processing) {
                                    e.currentTarget.style.backgroundColor = '#22C55E';
                                    e.currentTarget.style.borderColor = '#22C55E';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                  e.currentTarget.style.transform = 'translateY(0px)';
                                }}
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 12h18M15 6l6 6-6 6"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      padding: '20px',
                      borderTop: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <p style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}>
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredAdmins.length)} of {filteredAdmins.length} admins
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#FFFFFF',
                          color: '#1E1E1E',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          opacity: currentPage === 1 ? 0.5 : 1
                        }}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          backgroundColor: '#FFFFFF',
                          color: '#1E1E1E',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Detail Modal */}
      {selectedAdmin && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
          onClick={() => setSelectedAdmin(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '600px',
              padding: '32px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '24px',
                color: '#1E1E1E',
                margin: 0,
                marginBottom: '8px'
              }}>
                Admin Details
              </h2>
              <p style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                color: 'rgba(30, 30, 30, 0.6)',
                margin: 0
              }}>
                {selectedAdmin.email}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Name</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{selectedAdmin.displayName || 'Unknown'}</p>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Role</label>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'Clash Grotesk Variable',
                  border: 'none',
                  backgroundColor: selectedAdmin.role === 'super_admin' ? '#8B5CF6' : '#22C55E',
                  color: '#FFFFFF'
                }}>
                  {selectedAdmin.role === 'super_admin' ? 'SUPER ADMIN' : selectedAdmin.role?.toUpperCase() || 'ADMIN'}
                </span>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Status</label>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '4px',
                  paddingBottom: '4px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'Clash Grotesk Variable',
                  border: 'none',
                  backgroundColor: selectedAdmin.status === 'active' ? '#3BB77E' : '#EF4444',
                  color: '#FFFFFF'
                }}>
                  {selectedAdmin.status.toUpperCase()}
                </span>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Created At</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{selectedAdmin.createdAt ? new Date(selectedAdmin.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  if (selectedAdmin.status === 'active') {
                    handleDeactivate(selectedAdmin);
                  } else {
                    handleReactivate(selectedAdmin);
                  }
                  setSelectedAdmin(null);
                }}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid #3BB77E',
                  backgroundColor: '#3BB77E',
                  color: '#FFFFFF',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px',
                  opacity: processing ? 0.5 : 1
                }}
              >
                {processing ? 'Processing...' : selectedAdmin.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleEdit(selectedAdmin.userId)}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid #0077BE',
                  backgroundColor: '#0077BE',
                  color: '#FFFFFF',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px',
                  opacity: processing ? 0.5 : 1
                }}
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedAdmin(null)}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#FFFFFF',
                  color: '#1E1E1E',
                  cursor: 'pointer',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      <UserCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUserCreated={loadData}
      />

      {/* Status Change Modal (Professional - replaces delete) */}
      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({
          ...statusModal,
          isOpen: false
        })}
        onConfirm={confirmStatusChange}
        action={statusModal.action}
        resourceType="admin"
        resourceName={statusModal.itemName}
        currentStatus={statusModal.currentStatus}
        isProcessing={processing}
      />

      {/* View Details Modal (Professional detailed view) */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        title={viewModal.data?.displayName || viewModal.data?.email || 'Admin Details'}
        subtitle={viewModal.data?.email}
        badge={{
          text: viewModal.data?.status === 'active' ? 'Active' : 'Inactive',
          color: viewModal.data?.status === 'active' ? '#22C55E' : '#EF4444',
          bgColor: viewModal.data?.status === 'active' ? '#D1FAE5' : '#FEE2E2'
        }}
        sections={[
          {
            title: 'Basic Information',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            ),
            fields: [
              { label: 'Full Name', value: viewModal.data?.displayName || '—' },
              { label: 'Email', value: viewModal.data?.email || '—' },
              { label: 'User ID', value: viewModal.data?.userId || '—', fullWidth: true },
              { label: 'Status', value: viewModal.data?.status || 'Unknown', highlight: true },
              { label: 'Role', value: viewModal.data?.role || 'admin' }
            ]
          },
          {
            title: 'Account Details',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3BB77E" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            ),
            fields: [
              {
                label: 'Created At',
                value: viewModal.data?.createdAt ? new Date(viewModal.data.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '—'
              },
              {
                label: 'Last Login',
                value: viewModal.data?.lastLoginAt ? new Date(viewModal.data.lastLoginAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never'
              }
            ]
          }
        ]}
      />
    </div>
  );
};
