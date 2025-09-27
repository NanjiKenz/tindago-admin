/**
 * Store Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard Store Management Interface
 * Figma Design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=281-1168
 *
 * EXACT SPECIFICATIONS:
 * - 1440x1024 admin dashboard baseline
 * - Clash Grotesk Variable typography
 * - Exact TindaGo color palette
 * - Store-focused interface with sales data and subscription tracking
 * - Table columns: Store, Owner, Status, Joined, Actions
 * - Pixel-perfect positioning and spacing
 * - Professional pagination footer
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Store, StoreStats } from '@/types/storeManagement';
import { StoreService } from '@/lib/storeService';
import { AdminService } from '@/lib/adminService';

interface StoreManagementProps {
  className?: string;
}

export const StoreManagement: React.FC<StoreManagementProps> = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'rejected' | 'suspended'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

  // View state management for category switching
  const [viewMode, setViewMode] = useState<'overview' | 'active' | 'pending' | 'rejected' | 'suspended'>('overview');
  const [categoryData, setCategoryData] = useState<Store[]>([]);

  // Category-specific data loading functions
  const loadCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Store[] = [];

      switch (viewMode) {
        case 'active':
          // Load active stores from stores collection
          const allStores = await StoreService.getAllStores();
          data = allStores.filter(store => store.status === 'active');
          console.log('Loaded active stores:', data.length);
          break;

        case 'pending':
          // Load pending registrations from store_registrations collection
          const pendingRegistrations = await AdminService.getAllStoreRegistrations();
          // Convert registrations to Store format for consistent table rendering
          data = pendingRegistrations
            .filter(reg => reg.status === 'pending')
            .map(registration => ({
              storeId: registration.userId,
              storeName: registration.storeName,
              ownerName: registration.ownerName,
              ownerEmail: registration.email,
              ownerPhone: registration.phone,
              address: registration.address,
              status: 'pending',
              joinedDate: registration.createdAt,
              documents: registration.documents,
              businessVerification: { status: 'pending' },
              performanceMetrics: {
                totalSales: 0,
                totalOrders: 0,
                rating: 0,
                responseTime: 0
              },
              registrationData: registration // Keep original registration data for actions
            }));
          console.log('Loaded pending registrations:', data.length);
          break;

        case 'rejected':
          // Load rejected registrations from store_registrations collection
          const rejectedRegistrations = await AdminService.getAllStoreRegistrations();
          data = rejectedRegistrations
            .filter(reg => reg.status === 'rejected')
            .map(registration => ({
              storeId: registration.userId,
              storeName: registration.storeName,
              ownerName: registration.ownerName,
              ownerEmail: registration.email,
              ownerPhone: registration.phone,
              address: registration.address,
              status: 'rejected',
              joinedDate: registration.createdAt,
              documents: registration.documents,
              businessVerification: { status: 'rejected' },
              performanceMetrics: {
                totalSales: 0,
                totalOrders: 0,
                rating: 0,
                responseTime: 0
              },
              registrationData: registration
            }));
          console.log('Loaded rejected registrations:', data.length);
          break;

        case 'suspended':
          // Load suspended stores from stores collection
          const suspendedStores = await StoreService.getAllStores();
          data = suspendedStores.filter(store => store.status === 'suspended');
          console.log('Loaded suspended stores:', data.length);
          break;

        default:
          data = [];
      }

      setCategoryData(data);
    } catch (error) {
      console.error('Error loading category data:', error);
      setError(`Failed to load ${viewMode} data. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [viewMode]);

  // Load stores and stats on component mount
  useEffect(() => {
    if (viewMode === 'overview') {
      loadStores();
      loadStats();

      // Set up real-time subscriptions for overview
      const unsubscribeStores = StoreService.subscribeToStores((updatedStores) => {
        console.log('Stores updated:', updatedStores);
        console.log('Pending stores:', updatedStores.filter(s => s.status === 'pending'));
        setStores(updatedStores);
        setLoading(false);
      });

      const unsubscribeStats = StoreService.subscribeToStoreStats((updatedStats) => {
        console.log('Stats updated:', updatedStats);
        setStats(updatedStats);
      });

      return () => {
        unsubscribeStores();
        unsubscribeStats();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Load category-specific data when view mode changes
  useEffect(() => {
    if (viewMode !== 'overview') {
      loadCategoryData();
    }
  }, [viewMode, loadCategoryData]);

  // Set up real-time subscriptions for category views
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (viewMode === 'pending' || viewMode === 'rejected') {
      // Subscribe to store_registrations for pending/rejected data
      unsubscribe = AdminService.subscribeToRegistrations((registrations) => {
        const filteredData = registrations
          .filter(reg => reg.status === viewMode)
          .map(registration => ({
            storeId: registration.userId,
            storeName: registration.storeName,
            ownerName: registration.ownerName,
            ownerEmail: registration.email,
            ownerPhone: registration.phone,
            address: registration.address,
            status: viewMode,
            joinedDate: registration.createdAt,
            documents: registration.documents,
            businessVerification: { status: viewMode },
            performanceMetrics: {
              totalSales: 0,
              totalOrders: 0,
              rating: 0,
              responseTime: 0
            },
            registrationData: registration
          }));
        setCategoryData(filteredData);
        console.log(`Real-time ${viewMode} data updated:`, filteredData.length);
      });
    } else if (viewMode === 'active' || viewMode === 'suspended') {
      // Subscribe to stores for active/suspended data
      unsubscribe = StoreService.subscribeToStores((allStores) => {
        const filteredData = allStores.filter(store => store.status === viewMode);
        setCategoryData(filteredData);
        console.log(`Real-time ${viewMode} data updated:`, filteredData.length);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [viewMode]);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const storeData = await StoreService.getAllStoresWithRegistrations();
      setStores(storeData);
    } catch (err) {
      console.error('Error loading stores:', err);
      setError('Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = useCallback(async () => {
    try {
      const statsData = await StoreService.getStoreStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading store stats:', err);
      // Fallback to calculated stats from store data
      if (stores.length > 0) {
        const fallbackStats: StoreStats = {
          totalStores: stores.length,
          activeStores: stores.filter(s => s.status === 'active').length,
          pendingApproval: stores.filter(s => s.status === 'pending').length,
          rejectedStores: stores.filter(s => s.status === 'rejected').length,
          suspendedStores: stores.filter(s => s.status === 'suspended').length,
          subscribedStores: stores.filter(s => s.subscriptionStatus !== 'free').length,
          totalRevenue: stores.reduce((sum, s) => sum + (s.performanceMetrics?.totalSales || 0), 0),
          averageStoreRating: 4.8,
          newStoresThisMonth: 12,
          verifiedStores: stores.filter(s => s.businessVerification?.status === 'verified').length,
          totalOrders: stores.reduce((sum, s) => sum + (s.performanceMetrics?.totalOrders || 0), 0)
        };
        setStats(fallbackStats);
      }
    }
  }, [stores]);


  // Filter and search logic
  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(store => store.status === filterStatus);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(store =>
        store.storeName.toLowerCase().includes(searchLower) ||
        store.ownerName.toLowerCase().includes(searchLower) ||
        store.ownerEmail.toLowerCase().includes(searchLower) ||
        (store.address && store.address.toLowerCase().includes(searchLower)) ||
        (store.storeCategory && store.storeCategory.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [stores, filterStatus, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStores.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredStores.slice(startIndex, startIndex + pageSize);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };


  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: {
        backgroundColor: '#22C55E', // Green for active
        color: '#FFFFFF'
      },
      pending: {
        backgroundColor: '#EAB308', // Yellow for pending
        color: '#FFFFFF'
      },
      suspended: {
        backgroundColor: '#EF4444', // Red for suspended
        color: '#FFFFFF'
      },
      rejected: {
        backgroundColor: '#6B7280', // Gray for rejected
        color: '#FFFFFF'
      }
    };

    const style = statusStyles[status.toLowerCase() as keyof typeof statusStyles] || statusStyles.pending;

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

  const getSubscriptionBadge = (subscription: string) => {
    const subscriptionStyles = {
      free: {
        backgroundColor: 'rgba(30, 30, 30, 0.3)',
        color: '#FFFFFF'
      },
      premium: {
        backgroundColor: '#3B82F6',
        color: '#FFFFFF'
      },
      enterprise: {
        backgroundColor: '#A855F7',
        color: '#FFFFFF'
      }
    };

    const style = subscriptionStyles[subscription as keyof typeof subscriptionStyles] || subscriptionStyles.free;

    return {
      display: 'inline-flex',
      alignItems: 'center',
      paddingLeft: '12px',
      paddingRight: '12px',
      paddingTop: '4px',
      paddingBottom: '4px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 500,
      fontFamily: 'Clash Grotesk Variable',
      border: 'none',
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  };

  const handleView = (storeId: string) => {
    console.log('View store:', storeId);
    // TODO: Implement store details modal/page
  };

  const handleEdit = async (storeId: string) => {
    console.log('Edit store:', storeId);
    // TODO: Implement edit store modal/form
  };

  const handleUpdateStatus = async (storeId: string, newStatus: 'active' | 'pending' | 'suspended', reason?: string) => {
    try {
      await StoreService.updateStoreStatus(storeId, newStatus, reason);
      console.log(`Store ${storeId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating store status:', error);
      setError('Failed to update store status. Please try again.');
    }
  };

  const handleSuspend = async (storeId: string) => {
    const confirmed = window.confirm('Are you sure you want to suspend this store? This action will prevent them from operating on the platform.');
    if (confirmed) {
      const reason = prompt('Please provide a reason for suspending this store:');
      await handleUpdateStatus(storeId, 'suspended', reason || 'Suspended by admin');
    }
  };

  const exportStores = async () => {
    try {
      setLoading(true);
      const csvData = await StoreService.exportStoresToCSV();

      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stores_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      console.log('Store data exported successfully');
    } catch (error) {
      console.error('Error exporting stores:', error);
      setError('Failed to export store data. Please try again.');
    } finally {
      setLoading(false);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Back to Overview Button */}
              {viewMode !== 'overview' && (
                <button
                  onClick={() => setViewMode('overview')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #3BB77E',
                    backgroundColor: 'transparent',
                    color: '#3BB77E',
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
                    e.currentTarget.style.backgroundColor = '#3BB77E';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#3BB77E';
                  }}
                >
                  ← Back to Overview
                </button>
              )}

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
                  {viewMode === 'overview' ? 'Store Management' :
                   viewMode === 'active' ? 'Active Stores' :
                   viewMode === 'pending' ? 'Pending Approval' :
                   viewMode === 'rejected' ? 'Rejected Applications' :
                   viewMode === 'suspended' ? 'Suspended Stores' : 'Store Management'}
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
                  {viewMode === 'overview' ? 'Manage store registrations, approvals, and monitor store performance across the TindaGo platform' :
                   viewMode === 'active' ? 'View and manage all active stores on the TindaGo platform' :
                   viewMode === 'pending' ? 'Review and approve pending store registration applications' :
                   viewMode === 'rejected' ? 'Review rejected store applications and their rejection reasons' :
                   viewMode === 'suspended' ? 'Manage suspended stores and restoration options' : ''}
                </p>
              </div>
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

        {/* Store Stats Cards - Only show in overview mode */}
        {viewMode === 'overview' && (
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '120px',
              width: '1095px',
              height: '150px'
            }}
          >
          {/* Store Stats Cards Container */}
          <div
            className="relative"
            style={{
              width: '1095px',
              height: '150px'
            }}
          >
            {/* Active Store Card */}
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
              onClick={() => setFilterStatus('active')}
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
                    Active Stores
                  </p>
                </div>

                {/* View All - Active Stores */}
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
                      margin: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('active');
                      console.log('Switching to active stores view');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#22C55E';
                      e.currentTarget.style.fontWeight = '500';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(30, 30, 30, 0.6)';
                      e.currentTarget.style.fontWeight = '400';
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }}
                  >
                    View All
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
                    {(stats?.activeStores || stores.filter(s => s.status === 'active').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Approval Card */}
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
              onClick={() => setFilterStatus('pending')}
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
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
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
                    Pending Approval
                  </p>
                </div>

                {/* View All - Pending Approval */}
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
                      margin: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('pending');
                      console.log('Switching to pending approval view');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EAB308';
                      e.currentTarget.style.fontWeight = '500';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(30, 30, 30, 0.6)';
                      e.currentTarget.style.fontWeight = '400';
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }}
                  >
                    View All
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
                    {(stats?.pendingApproval || stores.filter(s => s.status === 'pending').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Suspended Store Card */}
            <div
              className="absolute bg-white rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-tindago-400"
              style={{
                left: '825px',
                top: '0px',
                width: '270px',
                height: '150px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => setFilterStatus('suspended')}
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
                    backgroundColor: '#F97316'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12h8"/>
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
                    Suspended
                  </p>
                </div>

                {/* View All - Suspended */}
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
                      margin: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('suspended');
                      console.log('Switching to suspended stores view');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F97316';
                      e.currentTarget.style.fontWeight = '500';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(30, 30, 30, 0.6)';
                      e.currentTarget.style.fontWeight = '400';
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }}
                  >
                    View All
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
                    {(stats?.suspendedStores || stores.filter(s => s.status === 'suspended').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejected Card */}
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
              onClick={() => setFilterStatus('rejected')}
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
                    backgroundColor: '#EF4444'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
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
                    Rejected
                  </p>
                </div>

                {/* View All - Rejected */}
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
                      margin: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode('rejected');
                      console.log('Switching to rejected stores view');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444';
                      e.currentTarget.style.fontWeight = '500';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(30, 30, 30, 0.6)';
                      e.currentTarget.style.fontWeight = '400';
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }}
                  >
                    View All
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
                    {(stats?.rejectedStores || stores.filter(s => s.status === 'rejected').length).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Category-Specific Views */}
        {viewMode !== 'overview' && (
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '120px',
              width: '1095px',
              minHeight: '600px'
            }}
          >
            {/* Category Header */}
            <div
              style={{
                marginBottom: '20px',
                padding: '0 20px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '16px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}
                  >
                    {loading ? 'Loading...' : `${categoryData.length} ${viewMode} ${categoryData.length === 1 ? (viewMode === 'pending' ? 'registration' : 'store') : (viewMode === 'pending' ? 'registrations' : 'stores')} found`}
                  </p>
                </div>
              </div>
            </div>

            {/* Category Table */}
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
                    Loading {viewMode} data...
                  </p>
                </div>
              ) : categoryData.length === 0 ? (
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
                    No {viewMode} {viewMode === 'pending' ? 'registrations' : 'stores'} found
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
                    {viewMode === 'pending' ? 'No new store registrations are waiting for approval.' :
                     viewMode === 'active' ? 'No active stores are currently registered.' :
                     viewMode === 'rejected' ? 'No store applications have been rejected.' :
                     viewMode === 'suspended' ? 'No stores are currently suspended.' : ''}
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
                          Store
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
                          Owner
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
                          {viewMode === 'pending' ? 'Submitted' : 'Joined'}
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
                      {categoryData.map((item, index) => (
                        <tr
                          key={item.storeId}
                          style={{
                            borderBottom: index < categoryData.length - 1 ? '1px solid #E2E8F0' : 'none',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {/* Store Column */}
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
                                {item.storeName}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'Clash Grotesk Variable',
                                  fontWeight: 400,
                                  fontSize: '14px',
                                  color: 'rgba(30, 30, 30, 0.6)'
                                }}
                              >
                                {item.address || 'Address not provided'}
                              </div>
                            </div>
                          </td>

                          {/* Owner Column */}
                          <td style={{ padding: '25px 20px' }}>
                            <div>
                              <div
                                style={{
                                  fontFamily: 'Clash Grotesk Variable',
                                  fontWeight: 500,
                                  fontSize: '14px',
                                  color: '#1E1E1E',
                                  marginBottom: '4px'
                                }}
                              >
                                {item.ownerName}
                              </div>
                              <div
                                style={{
                                  fontFamily: 'Clash Grotesk Variable',
                                  fontWeight: 400,
                                  fontSize: '12px',
                                  color: 'rgba(30, 30, 30, 0.6)'
                                }}
                              >
                                {item.ownerEmail}
                              </div>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td style={{ padding: '25px 20px' }}>
                            <span style={getStatusBadge(item.status)}>
                              {item.status === 'pending' ? 'Pending' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>

                          {/* Date Column */}
                          <td style={{ padding: '25px 20px' }}>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 400,
                                fontSize: '14px',
                                color: '#1E1E1E'
                              }}
                            >
                              {formatDate(item.joinedDate)}
                            </div>
                          </td>

                          {/* Actions Column - Will be customized per category later */}
                          <td style={{ padding: '25px 20px' }}>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '12px'
                              }}
                            >
                              <button
                                onClick={() => console.log(`View ${viewMode} item:`, item.storeId)}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0, 0, 0, 0.05)',
                                  backgroundColor: '#FFFFFF',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                                }}
                                title={`View ${viewMode} details`}
                              >
                                👁️
                              </button>
                              {viewMode === 'pending' && (
                                <>
                                  <button
                                    onClick={() => console.log('Approve registration:', item.storeId)}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '10px',
                                      border: '1px solid #22C55E',
                                      backgroundColor: '#22C55E',
                                      color: '#FFFFFF',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                                    }}
                                    title="Approve registration"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => console.log('Reject registration:', item.storeId)}
                                    style={{
                                      width: '40px',
                                      height: '40px',
                                      borderRadius: '10px',
                                      border: '1px solid #EF4444',
                                      backgroundColor: '#EF4444',
                                      color: '#FFFFFF',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)'
                                    }}
                                    title="Reject registration"
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search and Filter Section - Only show in overview mode */}
        {viewMode === 'overview' && (
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
              placeholder="Search stores by name, owner, or category..."
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

          {/* Filters and Export Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Filter Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px'
              }}
            >
              {(['all', 'active', 'pending', 'rejected', 'suspended'] as const).map((status) => {
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
                        ({stores.filter(s => s.status === status).length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Export Button */}
            <button
              onClick={exportStores}
              disabled={loading}
              style={{
                width: '120px',
                height: '50px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                backgroundColor: '#3BB77E',
                color: '#FFFFFF',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#2CA968';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#3BB77E';
                  e.currentTarget.style.transform = 'translateY(0px)';
                }
              }}
            >
              <Image
                src="/images/admin-dashboard/settings-icon.png"
                alt="Export"
                width={16}
                height={16}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              {loading ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>
        )}

        {/* Table Container - Only show in overview mode */}
        {viewMode === 'overview' && (
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
          {currentData.length === 0 ? (
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
                  src="/images/admin-dashboard/store-icon.png"
                  alt="No stores"
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
                No stores found
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
                  : 'No stores have been registered yet.'}
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
                        Store
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
                        Owner
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
                    {currentData.map((store, index) => (
                      <tr
                        key={store.storeId}
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
                        {/* Store Column */}
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
                              {store.storeName}
                            </div>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 400,
                                fontSize: '14px',
                                color: 'rgba(30, 30, 30, 0.6)'
                              }}
                            >
                              {store.storeCategory || 'General Store'}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '4px'
                              }}
                            >
                              <span style={getSubscriptionBadge(store.subscriptionStatus || 'free')}>
                                {store.subscriptionStatus || 'free'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Owner Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 500,
                                fontSize: '14px',
                                color: '#1E1E1E',
                                marginBottom: '4px'
                              }}
                            >
                              {store.ownerName}
                            </div>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 400,
                                fontSize: '12px',
                                color: 'rgba(30, 30, 30, 0.6)'
                              }}
                            >
                              {store.ownerEmail}
                            </div>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <span style={getStatusBadge(store.status)}>
                            {store.status === 'pending' ? 'Pending' : store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                          </span>
                        </td>

                        {/* Joined Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div
                            style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 400,
                              fontSize: '14px',
                              color: '#1E1E1E'
                            }}
                          >
                            {formatDate(store.joinedDate)}
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'center',
                              gap: '12px'
                            }}
                          >
                            <button
                              onClick={() => handleView(store.storeId)}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
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
                                e.currentTarget.style.backgroundColor = '#3BB77E';
                                e.currentTarget.style.borderColor = '#3BB77E';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
                                e.currentTarget.style.transform = 'translateY(0px)';
                              }}
                              title="View store details"
                            >
                              <Image
                                src="/images/admin-dashboard/store-icon.png"
                                alt="View"
                                width={18}
                                height={18}
                                className="object-contain"
                                style={{ filter: 'brightness(0.4)' }}
                              />
                            </button>
                            <button
                              onClick={() => handleEdit(store.storeId)}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
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
                              title="Edit store"
                            >
                              <Image
                                src="/images/admin-dashboard/edit-icon.svg"
                                alt="Edit"
                                width={18}
                                height={18}
                                className="object-contain"
                                style={{ filter: 'brightness(0.4)' }}
                              />
                            </button>
                            <button
                              onClick={() => handleSuspend(store.storeId)}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
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
                              title="Suspend store"
                            >
                              <Image
                                src="/images/admin-dashboard/delete-icon.svg"
                                alt="Suspend"
                                width={18}
                                height={18}
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
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredStores.length)} of {filteredStores.length} stores
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
        )}
      </div>
    </div>
  );
};