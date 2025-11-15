/**
 * Customer Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard Customer Management Interface
 * Figma Design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=281-367
 *
 * EXACT SPECIFICATIONS:
 * - 1440x1024 admin dashboard baseline
 * - Clash Grotesk Variable typography
 * - Exact TindaGo color palette
 * - Customer-focused interface with order history and spending data
 * - Table columns: Customer, Issued, Status, Actions
 * - Pixel-perfect positioning and spacing
 * - Professional pagination footer
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CustomerUser } from '@/types/userManagement';
import { CustomerService, CustomerStats } from '@/lib/customerService';
import { StatusChangeModal } from '@/components/admin/StatusChangeModal';
import { ViewDetailsModal } from '@/components/admin/ViewDetailsModal';

interface CustomerManagementProps {
  className?: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'pending' | 'open'>('all');
  const [filterVerification] = useState<'all' | 'verified' | 'pending' | 'unverified'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [processing, setProcessing] = useState(false);

  // Professional Modal State
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
    data: CustomerUser | null;
  }>({
    isOpen: false,
    data: null
  });

  // Load customers and stats on component mount
  useEffect(() => {
    loadCustomers();
    loadStats();

    // Set up real-time subscriptions
    const unsubscribeCustomers = CustomerService.subscribeToCustomers((updatedCustomers) => {
      setCustomers(updatedCustomers);
      setLoading(false);
    });

    const unsubscribeStats = CustomerService.subscribeToCustomerStats((updatedStats) => {
      setStats(updatedStats);
    });

    return () => {
      unsubscribeCustomers();
      unsubscribeStats();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const customerData = await CustomerService.getAllCustomers();
      setCustomers(customerData);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers. Please try again.');
      // Fallback to sample data for demonstration
      loadSampleData();
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await CustomerService.getCustomerStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading customer stats:', err);
      // Fallback to calculated stats from customer data
      if (customers.length > 0) {
        const fallbackStats: CustomerStats = {
          totalCustomers: customers.length,
          activeCustomers: customers.filter(c => c.status === 'active').length,
          inactiveCustomers: customers.filter(c => c.status === 'inactive').length,
          bannedCustomers: customers.filter(c => c.status === 'banned').length,
          verifiedCustomers: customers.filter(c => c.verificationStatus === 'verified').length,
          pendingVerifications: customers.filter(c => c.verificationStatus === 'pending').length,
          unverifiedCustomers: customers.filter(c => c.verificationStatus === 'unverified').length,
          totalOrders: customers.reduce((sum, c) => sum + c.totalOrders, 0),
          totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
          averageOrderValue: 0,
          newCustomersThisMonth: 0,
          averageCustomerValue: 0
        };
        setStats(fallbackStats);
      }
    }
  }, [customers]);

  // Generate support ticket type based on customer index
  const getTicketType = (userId: string) => {
    const types = [
      'Payment Failed',
      'Account Access',
      'Profile Issue',
      'Login Problem',
      'Billing Inquiry',
      'Feature Request',
      'Bug Report',
      'Password Reset'
    ];
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return types[hash % types.length];
  };

  // Generate support ticket status based on customer index
  const getTicketStatus = (userId: string) => {
    const statuses = ['Resolved', 'Pending', 'Open'];
    const hash = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return statuses[hash % statuses.length];
  };

  // Sample customer data fallback
  const loadSampleData = () => {
    const sampleCustomers: CustomerUser[] = [
      {
        userId: 'customer-001',
        email: 'maria.santos@gmail.com',
        displayName: 'Maria Santos',
        phone: '+63 917 234 5678',
        address: '123 Rizal Street, Quezon City, Metro Manila',
        status: 'active',
        createdAt: '2024-08-10T14:20:00Z',
        lastLoginAt: '2024-09-19T19:45:00Z',
        totalOrders: 45,
        totalSpent: 12750.50,
        avatar: '/images/avatars/maria-santos.jpg',
        verificationStatus: 'verified',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-002',
        email: 'jose.delaCruz@gmail.com',
        displayName: 'Jose Dela Cruz',
        phone: '+63 918 345 6789',
        address: '456 Taft Avenue, Manila, Metro Manila',
        status: 'inactive',
        createdAt: '2024-07-20T10:15:00Z',
        lastLoginAt: '2024-08-15T14:30:00Z',
        totalOrders: 12,
        totalSpent: 3250.00,
        verificationStatus: 'unverified',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-003',
        email: 'ana.martinez@gmail.com',
        displayName: 'Ana Martinez',
        phone: '+63 921 789 0123',
        address: '789 Katipunan Avenue, Quezon City, Metro Manila',
        status: 'active',
        createdAt: '2024-09-01T16:20:00Z',
        lastLoginAt: '2024-09-19T08:45:00Z',
        totalOrders: 28,
        totalSpent: 8940.75,
        verificationStatus: 'verified',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-004',
        email: 'carlos.rivera@gmail.com',
        displayName: 'Carlos Rivera',
        phone: '+63 922 345 6789',
        address: '321 EDSA, Makati City, Metro Manila',
        status: 'banned',
        createdAt: '2024-06-15T09:30:00Z',
        lastLoginAt: '2024-07-10T11:20:00Z',
        totalOrders: 8,
        totalSpent: 1890.25,
        verificationStatus: 'pending',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-005',
        email: 'lucia.garcia@gmail.com',
        displayName: 'Lucia Garcia',
        phone: '+63 915 678 9012',
        address: '654 Shaw Boulevard, Pasig City, Metro Manila',
        status: 'active',
        createdAt: '2024-08-25T11:00:00Z',
        lastLoginAt: '2024-09-18T16:30:00Z',
        totalOrders: 67,
        totalSpent: 18450.00,
        verificationStatus: 'verified',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-006',
        email: 'pedro.gonzales@gmail.com',
        displayName: 'Pedro Gonzales',
        phone: '+63 913 456 7890',
        address: '987 Commonwealth Avenue, Quezon City, Metro Manila',
        status: 'active',
        createdAt: '2024-09-10T08:15:00Z',
        lastLoginAt: '2024-09-19T12:00:00Z',
        totalOrders: 15,
        totalSpent: 4320.50,
        verificationStatus: 'pending',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-007',
        email: 'isabella.ramos@gmail.com',
        displayName: 'Isabella Ramos',
        phone: '+63 920 567 8901',
        address: '159 Ortigas Avenue, Pasig City, Metro Manila',
        status: 'active',
        createdAt: '2024-07-05T13:45:00Z',
        lastLoginAt: '2024-09-17T20:15:00Z',
        totalOrders: 92,
        totalSpent: 25630.75,
        verificationStatus: 'verified',
        storeOwnership: {
          hasStore: false
        }
      },
      {
        userId: 'customer-008',
        email: 'miguel.torres@gmail.com',
        displayName: 'Miguel Torres',
        phone: '+63 916 234 5678',
        address: '753 España Boulevard, Manila, Metro Manila',
        status: 'inactive',
        createdAt: '2024-05-20T15:30:00Z',
        lastLoginAt: '2024-06-25T10:45:00Z',
        totalOrders: 6,
        totalSpent: 1450.25,
        verificationStatus: 'unverified',
        storeOwnership: {
          hasStore: false
        }
      }
    ];

    setCustomers(sampleCustomers);
  };

  // Filter and search logic
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Apply ticket status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(customer => getTicketStatus(customer.userId).toLowerCase() === filterStatus);
    }

    // Apply verification filter
    if (filterVerification !== 'all') {
      filtered = filtered.filter(customer => customer.verificationStatus === filterVerification);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.displayName.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
        (customer.address && customer.address.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [customers, filterStatus, filterVerification, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = filteredCustomers.slice(startIndex, startIndex + pageSize);

  // Professional Action Handlers
  const handleView = (customer: CustomerUser) => {
    setViewModal({
      isOpen: true,
      data: customer
    });
  };

  const handleEdit = (customerId: string) => {
    router.push(`/customers/edit/${customerId}`);
  };

  const handleProfile = (customerId: string) => {
    router.push(`/customers/profile/${customerId}`);
  };

  const handleDeactivate = (customer: CustomerUser) => {
    setStatusModal({
      isOpen: true,
      action: 'deactivate',
      itemId: customer.userId,
      itemName: customer.displayName || customer.email,
      currentStatus: customer.status || 'unknown'
    });
  };

  const handleReactivate = (customer: CustomerUser) => {
    setStatusModal({
      isOpen: true,
      action: 'reactivate',
      itemId: customer.userId,
      itemName: customer.displayName || customer.email,
      currentStatus: customer.status || 'unknown'
    });
  };

  const confirmStatusChange = async (reason?: string) => {
    if (!statusModal.itemId) return;

    try {
      setProcessing(true);
      const newStatus = statusModal.action === 'reactivate' ? 'active' : 'inactive';

      await CustomerService.updateCustomerStatus(statusModal.itemId, newStatus);

      if (reason) console.log(`Status change reason: ${reason}`);
      await loadCustomers();

      setStatusModal({
        isOpen: false,
        action: 'deactivate',
        itemId: null,
        itemName: '',
        currentStatus: ''
      });

      console.log('✅ Customer status updated successfully');
    } catch (error) {
      console.error('❌ Status change error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Status update failed'}`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    // Support ticket status colors
    const statusStyles = {
      resolved: {
        backgroundColor: '#22C55E', // Green for resolved
        color: '#FFFFFF'
      },
      pending: {
        backgroundColor: '#EAB308', // Yellow for pending
        color: '#FFFFFF'
      },
      open: {
        backgroundColor: '#3B82F6', // Blue for open
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
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      fontFamily: 'Clash Grotesk Variable',
      border: 'none',
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  };

  const getVerificationBadge = (status: string) => {
    const statusStyles = {
      verified: {
        backgroundColor: '#22C55E',
        color: '#FFFFFF'
      },
      pending: {
        backgroundColor: '#EAB308',
        color: '#FFFFFF'
      },
      unverified: {
        backgroundColor: 'rgba(30, 30, 30, 0.3)',
        color: '#FFFFFF'
      }
    };

    const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.unverified;

    return {
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
      backgroundColor: style.backgroundColor,
      color: style.color
    };
  };

  const exportCustomers = async () => {
    try {
      setLoading(true);
      const csvData = await CustomerService.exportCustomersToCSV();

      // Create and download CSV file
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      console.log('Customer data exported successfully');
    } catch (error) {
      console.error('Error exporting customers:', error);
      setError('Failed to export customer data. Please try again.');
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
                Customer Management
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
                Manage customers, view order history, and track customer engagement across the TindaGo platform
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

        {/* Customer Stats Cards - Proper spacing below header */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '120px',
            width: '1095px',
            height: '150px'
          }}
        >
          {/* Customer Stats Cards - Admin Dashboard Style */}
          <div
            className="relative"
            style={{
              width: '1095px',
              height: '150px'
            }}
          >
          {/* Total Customers Card */}
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
                  Total Customers
                </p>
              </div>

              {/* Value */}
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
                    fontSize: '28px',
                    lineHeight: '1.1em',
                    color: '#1E1E1E',
                    margin: 0
                  }}
                >
                  {(stats?.totalCustomers || customers.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Active Customers Card */}
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
                  Active Customers
                </p>
              </div>

              {/* Value */}
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
                    fontSize: '28px',
                    lineHeight: '1.1em',
                    color: '#1E1E1E',
                    margin: 0
                  }}
                >
                  {(stats?.activeCustomers || customers.filter(c => c.status === 'active').length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Support Tickets Card */}
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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
                  Support Tickets
                </p>
              </div>

              {/* Value */}
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
                    fontSize: '28px',
                    lineHeight: '1.1em',
                    color: '#1E1E1E',
                    margin: 0
                  }}
                >
                  {customers.length.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Average Rating Card */}
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
                  backgroundColor: '#A855F7'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
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
                  Average Rating
                </p>
              </div>

              {/* Value */}
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
                    fontSize: '28px',
                    lineHeight: '1.1em',
                    color: '#1E1E1E',
                    margin: 0
                  }}
                >
                  4.8
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
              placeholder="Search support tickets by customer name or issue..."
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
              {(['all', 'resolved', 'pending', 'open'] as const).map((status) => {
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
                        ({customers.filter(c => getTicketStatus(c.userId).toLowerCase() === status).length})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Export CSV Button */}
            <button
              onClick={exportCustomers}
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
                  src="/images/admin-dashboard/customer-icon.png"
                  alt="No customers"
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
                No customers found
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
                {searchTerm || filterStatus !== 'all' || filterVerification !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No customers have been added yet.'}
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
                        Customer
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
                        Issue Type
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
                    {currentData.map((customer, index) => (
                      <tr
                        key={customer.userId}
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
                        {/* Customer Column */}
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
                              {customer.displayName}
                            </div>
                            <div
                              style={{
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 400,
                                fontSize: '14px',
                                color: 'rgba(30, 30, 30, 0.6)'
                              }}
                            >
                              {customer.email}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '4px'
                              }}
                            >
                              <span style={getVerificationBadge(customer.verificationStatus)}>
                                {customer.verificationStatus}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Issue Type Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <div
                            style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 500,
                              fontSize: '14px',
                              color: '#1E1E1E',
                              padding: '6px 12px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '6px',
                              border: '1px solid rgba(59, 130, 246, 0.2)',
                              display: 'inline-block'
                            }}
                          >
                            {getTicketType(customer.userId)}
                          </div>
                        </td>

                        {/* Status Column */}
                        <td style={{ padding: '25px 20px' }}>
                          <span style={getStatusBadge(getTicketStatus(customer.userId))}>
                            {getTicketStatus(customer.userId)}
                          </span>
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
                            {/* VIEW Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(customer);
                              }}
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
                              title="View customer details"
                            >
                              <Image
                                src="/images/admin-dashboard/user-icon.png"
                                alt="View"
                                width={18}
                                height={18}
                                className="object-contain"
                                style={{ filter: 'brightness(0.4)' }}
                              />
                            </button>

                            {/* EDIT Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(customer.userId);
                              }}
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
                              title="Edit customer"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>

                            {/* DEACTIVATE / REACTIVATE Button (status-based) */}
                            {customer.status === 'active' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeactivate(customer);
                                }}
                                title="Deactivate customer"
                                disabled={processing}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0, 0, 0, 0.05)',
                                  backgroundColor: '#FFFFFF',
                                  cursor: processing ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                                  opacity: processing ? 0.5 : 1
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
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReactivate(customer);
                                }}
                                title="Reactivate customer"
                                disabled={processing}
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(0, 0, 0, 0.05)',
                                  backgroundColor: '#FFFFFF',
                                  cursor: processing ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
                                  opacity: processing ? 0.5 : 1
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
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers
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

      {/* Professional Modals */}
      <StatusChangeModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        onConfirm={confirmStatusChange}
        action={statusModal.action}
        resourceName={statusModal.itemName}
        resourceType="customer"
        currentStatus={statusModal.currentStatus}
      />

      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, data: null })}
        title={viewModal.data?.displayName || 'Customer Details'}
        subtitle={viewModal.data?.email}
        badge={{
          text: viewModal.data?.status === 'active' ? 'Active' : viewModal.data?.status === 'banned' ? 'Banned' : 'Inactive',
          color: viewModal.data?.status === 'active' ? '#22C55E' : viewModal.data?.status === 'banned' ? '#EF4444' : '#F59E0B',
          bgColor: viewModal.data?.status === 'active' ? '#D1FAE5' : viewModal.data?.status === 'banned' ? '#FEE2E2' : '#FEF3C7'
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
              { label: 'Customer ID', value: viewModal.data?.userId || '—', fullWidth: true },
              { label: 'Name', value: viewModal.data?.displayName || '—' },
              { label: 'Email', value: viewModal.data?.email || '—' },
              { label: 'Phone', value: viewModal.data?.phone || '—' },
              { label: 'Address', value: viewModal.data?.address || '—', fullWidth: true }
            ]
          },
          {
            title: 'Account Status',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0077BE" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ),
            fields: [
              { label: 'Status', value: viewModal.data?.status || 'Unknown', highlight: true },
              { label: 'Verification', value: viewModal.data?.verificationStatus || 'Unknown' },
              { label: 'Joined', value: viewModal.data?.createdAt ? new Date(viewModal.data.createdAt).toLocaleDateString() : 'N/A' },
              { label: 'Last Login', value: viewModal.data?.lastLoginAt ? new Date(viewModal.data.lastLoginAt).toLocaleDateString() : 'N/A' }
            ]
          },
          {
            title: 'Purchase History',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            ),
            fields: [
              { label: 'Total Orders', value: viewModal.data?.totalOrders?.toString() || '0' },
              { label: 'Total Spent', value: `₱${viewModal.data?.totalSpent?.toFixed(2) || '0.00'}` },
              { label: 'Average Order', value: viewModal.data?.totalOrders ? `₱${(viewModal.data.totalSpent / viewModal.data.totalOrders).toFixed(2)}` : '₱0.00' }
            ]
          }
        ]}
      />
    </div>
  );
};

export default CustomerManagement;