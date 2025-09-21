/**
 * User Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard User Management Interface
 * Figma Design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=281-980
 *
 * EXACT SPECIFICATIONS:
 * - 1440x1024 admin dashboard baseline
 * - Clash Grotesk Variable typography
 * - Exact TindaGo color palette
 * - Clean design without profile avatars
 * - Table columns: User, Role, Status, Joined, Actions
 * - Pixel-perfect positioning and spacing
 * - Professional pagination footer
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { UserManagementService } from '@/lib/userManagementService';
import { UserStats } from '@/types/userManagement';


interface UserDisplay {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
  createdAt: string;
  lastLoginAt?: string;
  phone?: string;
  userType: 'admin' | 'customer' | 'store_owner';
}

interface UserManagementProps {
  className?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ className }) => {
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending' | 'suspended' | 'banned'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [error, setError] = useState<string | null>(null);

  // Load real user data from Firebase
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const allUsers = await UserManagementService.getAllUsers();

        // Transform users into display format
        const displayUsers: UserDisplay[] = allUsers.map(user => {
          // Determine user type and role based on actual Firebase userType field
          let userType: 'admin' | 'customer' | 'store_owner';
          let role: string;

          if ('role' in user) {
            // Admin user
            userType = 'admin';
            role = user.role === 'super_admin' ? 'Super Admin' :
                   user.role === 'admin' ? 'Admin' :
                   user.role === 'moderator' ? 'Moderator' : 'Viewer';
          } else {
            // For non-admin users, check their actual userType field from Firebase
            // This should be either 'customer' or 'store_owner'

            if (user.userType === 'store_owner') {
              userType = 'store_owner';
              role = 'Store Owner';
            } else if (user.userType === 'customer') {
              userType = 'customer';
              role = 'Customer (App User)';
            } else {
              // Fallback: determine by presence of stores property
              if ('stores' in user) {
                userType = 'store_owner';
                role = 'Store Owner';
              } else {
                userType = 'customer';
                role = 'Customer';
              }
            }
          }

          return {
            userId: user.userId,
            email: user.email,
            displayName: user.displayName,
            role,
            status: user.status as 'active' | 'inactive' | 'pending' | 'suspended' | 'banned',
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
            phone: user.phone,
            userType
          };
        });

        setUsers(displayUsers);

        // Load user stats
        const userStats = await UserManagementService.getUserStats();
        setStats(userStats);
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();

    // Set up real-time subscription
    const unsubscribe = UserManagementService.subscribeToUsers((updatedUsers) => {
      const displayUsers: UserDisplay[] = updatedUsers.map(user => {
        let userType: 'admin' | 'customer' | 'store_owner';
        let role: string;

        if ('role' in user) {
          userType = 'admin';
          role = user.role === 'super_admin' ? 'Super Admin' :
                 user.role === 'admin' ? 'Admin' :
                 user.role === 'moderator' ? 'Moderator' : 'Viewer';
        } else {
          // For non-admin users, check their actual userType field from Firebase

          if (user.userType === 'store_owner') {
            userType = 'store_owner';
            role = 'Store Owner';
          } else if (user.userType === 'customer') {
            userType = 'customer';
            role = 'Customer (App User)';
          } else {
            // Fallback: determine by presence of stores property
            if ('stores' in user) {
              userType = 'store_owner';
              role = 'Store Owner';
            } else {
              userType = 'customer';
              role = 'Customer';
            }
          }
        }

        return {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          role,
          status: user.status as 'active' | 'inactive' | 'pending' | 'suspended' | 'banned',
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          phone: user.phone,
          userType
        };
      });

      setUsers(displayUsers);
    });

    // Set up real-time stats subscription
    const unsubscribeStats = UserManagementService.subscribeToUserStats((updatedStats) => {
      setStats(updatedStats);
    });

    return () => {
      unsubscribe();
      unsubscribeStats();
    };
  }, []);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [users, filterStatus, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredUsers.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    // Exact TindaGo admin dashboard colors for status badges
    const statusStyles = {
      active: {
        backgroundColor: '#22C55E', // Exact green
        color: '#FFFFFF'
      },
      pending: {
        backgroundColor: '#EAB308', // Exact yellow
        color: '#FFFFFF'
      },
      inactive: {
        backgroundColor: 'rgba(30, 30, 30, 0.3)', // Exact gray
        color: '#FFFFFF'
      }
    };

    const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive;

    return {
      display: 'inline-flex',
      alignItems: 'center',
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '6px',
      paddingBottom: '6px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: 'Clash Grotesk Variable',
      border: 'none',
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  };

  const handleView = (userId: string) => {
    console.log('View user:', userId);
    // TODO: Implement view functionality
  };

  const handleEdit = (userId: string) => {
    console.log('Edit user:', userId);
    // TODO: Implement edit functionality
  };

  const handleProfile = (userId: string) => {
    console.log('View profile:', userId);
    // TODO: Implement profile view functionality
  };

  const handleDelete = (userId: string) => {
    console.log('Delete user:', userId);
    // TODO: Implement delete functionality with confirmation
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
          top: '80px',
          minHeight: '1200px'
        }}
      >
        {/* Header Section - Exact positioning */}
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
                User Management
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
                Manage users, roles, and permissions across the TindaGo platform
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '8px',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '400px'
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#EF4444',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#DC2626'
                  }}
                >
                  {error}
                </span>
                <button
                  onClick={() => setError(null)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Stats Cards - Proper spacing below header */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '120px',
            width: '1095px',
            height: '150px'
          }}
        >
          <div
            className="relative"
            style={{
              width: '1095px',
              height: '150px'
            }}
          >
            <div
              className="absolute bg-white rounded-2xl"
              style={{
                left: '0px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="relative w-full h-full">
                {/* Icon in top right */}
                <div
                  className="absolute rounded-xl flex items-center justify-center"
                  style={{
                    right: '20px',
                    top: '20px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#64748B'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>

                {/* Title */}
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
                    Total Users
                  </p>
                </div>

                {/* View All */}
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '60px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}
                  >
                    view all
                  </p>
                </div>

                {/* Value */}
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '45px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '28px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {(stats?.totalUsers || users.length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute bg-white rounded-2xl"
              style={{
                left: '275px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="relative w-full h-full">
                {/* Icon in top right */}
                <div
                  className="absolute rounded-xl flex items-center justify-center"
                  style={{
                    right: '20px',
                    top: '20px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#22C55E'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>

                {/* Title */}
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
                    Customers
                  </p>
                </div>

                {/* View All */}
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '60px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}
                  >
                    view all
                  </p>
                </div>

                {/* Value */}
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '45px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '28px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {(stats?.totalCustomers || users.filter(u => u.userType === 'customer').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute bg-white rounded-2xl"
              style={{
                left: '550px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="relative w-full h-full">
                {/* Icon in top right */}
                <div
                  className="absolute rounded-xl flex items-center justify-center"
                  style={{
                    right: '20px',
                    top: '20px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#3B82F6'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>

                {/* Title */}
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
                    Store Owners
                  </p>
                </div>

                {/* View All */}
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '60px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}
                  >
                    view all
                  </p>
                </div>

                {/* Value */}
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '45px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '28px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {(stats?.totalStoreOwners || users.filter(u => u.userType === 'store_owner').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="absolute bg-white rounded-2xl"
              style={{
                left: '825px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="relative w-full h-full">
                {/* Icon in top right */}
                <div
                  className="absolute rounded-xl flex items-center justify-center"
                  style={{
                    right: '20px',
                    top: '20px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#EAB308'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12" y2="17"/>
                  </svg>
                </div>

                {/* Title */}
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
                    Pending Verifications
                  </p>
                </div>

                {/* View All */}
                <div
                  className="absolute"
                  style={{
                    right: '20px',
                    top: '60px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}
                  >
                    view all
                  </p>
                </div>

                {/* Value */}
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    bottom: '45px'
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 700,
                      fontSize: '28px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {(stats?.pendingVerifications || users.filter(u => u.status === 'pending').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section - Below Cards */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '290px',
            width: '1095px',
            height: '50px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '30px'
          }}
        >
          {/* Search Input - Exact styling */}
          <div
            style={{
              position: 'relative',
              width: '400px',
              height: '50px'
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
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                height: '50px',
                paddingLeft: '44px',
                paddingRight: '16px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '12px',
                backgroundColor: '#FFFFFF',
                color: '#1E1E1E',
                fontSize: '14px',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                outline: 'none',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0077BE';
                e.target.style.boxShadow = '0px 4px 20px rgba(0, 119, 190, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                e.target.style.boxShadow = '0px 4px 20px rgba(0, 0, 0, 0.1)';
              }}
            />
          </div>

          {/* Filter Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            {(['all', 'active', 'inactive', 'pending', 'suspended', 'banned'] as const).map((status) => {
              const isActive = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
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
                  {status !== 'all' && (
                    <span
                      style={{
                        marginLeft: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        opacity: 0.8
                      }}
                    >
                      ({filteredUsers.filter(u => u.status === status).length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Container - Aligned with cards */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '360px',
            width: '1095px',
            minHeight: '600px',
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
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '18px',
                  color: '#1E293B'
                }}
              >
                Loading users...
              </div>
            </div>
          ) : error ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#EF4444',
                  marginBottom: '8px'
                }}
              >
                Error Loading Users
              </div>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#64748B',
                  margin: 0
                }}
              >
                {error}
              </p>
            </div>
          ) : currentData.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Image
                  src="/images/admin-dashboard/user-icon.png"
                  alt="No users"
                  width={48}
                  height={48}
                  className="object-contain"
                  style={{ opacity: 0.3 }}
                />
              </div>
              <h3
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#1E293B',
                  marginBottom: '8px'
                }}
              >
                No users found
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
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No users have been added yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
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
                        User
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
                        Role
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
                        Joined
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.map((user, index) => (
                      <tr
                        key={user.userId}
                        style={{
                          borderBottom: index < currentData.length - 1 ? '1px solid #E2E8F0' : 'none',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* User Column - Clean without avatar as requested */}
                        <td style={{ padding: '25px 20px' }}>
                          <div>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 500,
                                fontSize: '16px',
                                color: '#1E1E1E',
                                marginBottom: '4px'
                              }}
                            >
                              {user.displayName}
                            </div>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 400,
                                fontSize: '14px',
                                color: 'rgba(30, 30, 30, 0.6)'
                              }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div
                            style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 500,
                              fontSize: '16px',
                              color: '#1E1E1E'
                            }}
                          >
                            {user.role}
                          </div>
                        </td>

                        {/* Status Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <span style={getStatusBadge(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>

                        {/* Joined Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div
                            style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 400,
                              fontSize: '16px',
                              color: 'rgba(30, 30, 30, 0.6)'
                            }}
                          >
                            {formatDate(user.createdAt)}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                          >
                            {/* View Button */}
                            <button
                              onClick={() => handleView(user.userId)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#22C55E';
                                e.currentTarget.style.borderColor = '#22C55E';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                              }}
                              title="View user details"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(user.userId)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#0077BE';
                                e.currentTarget.style.borderColor = '#0077BE';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                              }}
                              title="Edit user"
                            >
                              <Image
                                src="/images/admin-dashboard/edit-icon.svg"
                                alt="Edit"
                                width={16}
                                height={16}
                                className="object-contain"
                                style={{ filter: 'brightness(0.4)' }}
                              />
                            </button>

                            {/* Profile Button */}
                            <button
                              onClick={() => handleProfile(user.userId)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#A855F7';
                                e.currentTarget.style.borderColor = '#A855F7';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                              }}
                              title="View profile"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(user.userId)}
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#EF4444';
                                e.currentTarget.style.borderColor = '#EF4444';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                              }}
                              title="Delete user"
                            >
                              <Image
                                src="/images/admin-dashboard/delete-icon.svg"
                                alt="Delete"
                                width={16}
                                height={16}
                                className="object-contain"
                                style={{ filter: 'brightness(0.4)' }}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer - Exact styling */}
              <div
                style={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                  padding: '25px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF',
                  minHeight: '80px'
                }}
              >
                <div
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '16px',
                    color: 'rgba(30, 30, 30, 0.6)'
                  }}
                >
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredUsers.length)} of {filteredUsers.length} users
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      backgroundColor: currentPage === 1 ? '#F3F5F9' : '#FFFFFF',
                      color: currentPage === 1 ? 'rgba(30, 30, 30, 0.3)' : '#1E1E1E',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: currentPage === 1 ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    Previous
                  </button>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: currentPage === page ? '#0077BE' : 'rgba(0, 0, 0, 0.05)',
                          backgroundColor: currentPage === page ? '#0077BE' : '#FFFFFF',
                          color: currentPage === page ? '#FFFFFF' : '#1E1E1E',
                          cursor: 'pointer',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '16px',
                          minWidth: '45px',
                          transition: 'all 0.2s ease',
                          boxShadow: currentPage === page ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 0, 0, 0.05)',
                      backgroundColor: currentPage === totalPages ? '#F3F5F9' : '#FFFFFF',
                      color: currentPage === totalPages ? 'rgba(30, 30, 30, 0.3)' : '#1E1E1E',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '16px',
                      transition: 'all 0.2s ease',
                      boxShadow: currentPage === totalPages ? 'none' : '0px 2px 8px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};