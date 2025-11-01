/**
 * Payout Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard Payout Management Interface
 * Matches design system from Store Management, Customer Management, and Transaction Management
 *
 * EXACT SPECIFICATIONS:
 * - 1440x1024 admin dashboard baseline
 * - Clash Grotesk Variable typography
 * - Exact TindaGo color palette
 * - Stats cards: 270px x 150px with colored icon squares
 * - Table with rounded-20px card, shadow, hover effects
 * - Bulk selection and approval functionality
 * - Pixel-perfect positioning and spacing
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAllPayoutRequests, approvePayoutRequest, rejectPayoutRequest, getPayoutStats, formatPayoutAmount } from '@/lib/payoutService';
import type { PayoutRequest } from '@/lib/payoutService';

// Payment Method Badge Components
const BankBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#3B82F6', borderRadius: '6px' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M2 20h20v2H2v-2zm2-8h2v7H4v-7zm5 0h2v7H9v-7zm4 0h2v7h-2v-7zm5 0h2v7h-2v-7zM2 7l10-5 10 5v3H2V7z"/>
    </svg>
    <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, fontFamily: 'Clash Grotesk Variable' }}>Bank</span>
  </div>
);

const GCashBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#007DFF', borderRadius: '6px' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="white"/>
    </svg>
    <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, fontFamily: 'Clash Grotesk Variable' }}>GCash</span>
  </div>
);

const PayMayaBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#00D632', borderRadius: '6px' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>
    </svg>
    <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, fontFamily: 'Clash Grotesk Variable' }}>PayMaya</span>
  </div>
);

const getPaymentMethodBadge = (method: string) => {
  const methodLower = method.toLowerCase();
  if (methodLower === 'gcash') return <GCashBadge />;
  if (methodLower === 'paymaya') return <PayMayaBadge />;
  return <BankBadge />;
};

export const PayoutManagement: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Load payouts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await getAllPayoutRequests();
    setPayouts(data);
    setLoading(false);
  };

  // Calculate stats
  const stats = {
    total: payouts.length,
    pending: payouts.filter(p => p.status === 'pending').length,
    approved: payouts.filter(p => p.status === 'approved').length,
    rejected: payouts.filter(p => p.status === 'rejected').length,
    completed: payouts.filter(p => p.status === 'completed').length,
    totalPending: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalApproved: payouts.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0),
  };

  // Filter payouts
  const filteredPayouts = payouts.filter(p => {
    const matchesSearch = !searchTerm ||
      p.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.storeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.accountDetails.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayouts.length / pageSize);
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Selection handlers
  const pendingPayouts = paginatedPayouts.filter(p => p.status === 'pending');
  const allPendingSelected = pendingPayouts.length > 0 && pendingPayouts.every(p => selectedPayouts.has(p.id));

  const togglePayout = (id: string) => {
    const newSelected = new Set(selectedPayouts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPayouts(newSelected);
  };

  const toggleAllPending = () => {
    if (allPendingSelected) {
      setSelectedPayouts(new Set());
    } else {
      setSelectedPayouts(new Set(pendingPayouts.map(p => p.id)));
    }
  };

  const handleApprove = async (payout: PayoutRequest) => {
    if (!confirm(`Approve payout of ${formatPayoutAmount(payout.amount)} for ${payout.storeName}?\n\nThis will debit the store wallet.`)) {
      return;
    }

    setProcessing(true);
    try {
      await approvePayoutRequest({
        payoutId: payout.id,
        adminUserId: 'admin',
        adminNotes: 'Approved by admin',
      });
      alert('Payout approved successfully!');
      setSelectedPayout(null);
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (payout: PayoutRequest) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    setProcessing(true);
    try {
      await rejectPayoutRequest({
        payoutId: payout.id,
        adminUserId: 'admin',
        adminNotes: reason,
      });
      alert('Payout rejected successfully!');
      setSelectedPayout(null);
      await loadData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    const selectedCount = selectedPayouts.size;
    const totalAmount = payouts
      .filter(p => selectedPayouts.has(p.id))
      .reduce((sum, p) => sum + p.amount, 0);

    if (!confirm(`Approve ${selectedCount} payout request${selectedCount > 1 ? 's' : ''}?\n\nTotal amount: ${formatPayoutAmount(totalAmount)}\n\nThis will debit the store wallets.`)) {
      return;
    }

    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const payoutId of Array.from(selectedPayouts)) {
      try {
        await approvePayoutRequest({
          payoutId,
          adminUserId: 'admin',
          adminNotes: 'Bulk approved',
        });
        successCount++;
      } catch (error) {
        console.error(`Failed to approve payout ${payoutId}:`, error);
        failCount++;
      }
    }

    alert(`Bulk approval complete!\n\nApproved: ${successCount}\nFailed: ${failCount}`);
    setSelectedPayouts(new Set());
    await loadData();
    setBulkProcessing(false);
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
                Payout Management
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
                Manage store payout requests and approve fund transfers
              </p>
            </div>

            {/* Bulk Actions */}
            {selectedPayouts.size > 0 && (
              <div
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 183, 126, 0.1)',
                  border: '1px solid rgba(59, 183, 126, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span style={{ fontFamily: 'Clash Grotesk Variable', fontWeight: 500, fontSize: '14px', color: '#1E1E1E' }}>
                  {selectedPayouts.size} selected • {formatPayoutAmount(payouts.filter(p => selectedPayouts.has(p.id)).reduce((sum, p) => sum + p.amount, 0))}
                </span>
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkProcessing}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #3BB77E',
                    backgroundColor: '#3BB77E',
                    color: '#FFFFFF',
                    cursor: bulkProcessing ? 'not-allowed' : 'pointer',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    opacity: bulkProcessing ? 0.5 : 1
                  }}
                >
                  {bulkProcessing ? 'Processing...' : 'Approve All'}
                </button>
                <button
                  onClick={() => setSelectedPayouts(new Set())}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#FFFFFF',
                    color: '#1E1E1E',
                    cursor: 'pointer',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
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
            {/* Pending Payouts Card */}
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
              onClick={() => setStatusFilter('pending')}
            >
              <div className="relative w-full h-full">
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
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
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
                    Pending
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
                    {stats.pending.toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0,
                      marginTop: '4px'
                    }}
                  >
                    {formatPayoutAmount(stats.totalPending)}
                  </p>
                </div>
              </div>
            </div>

            {/* Approved Payouts Card */}
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
              onClick={() => setStatusFilter('approved')}
            >
              <div className="relative w-full h-full">
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
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
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
                    Approved
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
                    {stats.approved.toLocaleString()}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0,
                      marginTop: '4px'
                    }}
                  >
                    {formatPayoutAmount(stats.totalApproved)}
                  </p>
                </div>
              </div>
            </div>

            {/* Completed Payouts Card */}
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
              onClick={() => setStatusFilter('completed')}
            >
              <div className="relative w-full h-full">
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
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
                    Completed
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
                    {stats.completed.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejected Payouts Card */}
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
              onClick={() => setStatusFilter('rejected')}
            >
              <div className="relative w-full h-full">
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
                    {stats.rejected.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
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
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Image
                src="/images/admin-dashboard/search-icon.png"
                alt="Search"
                width={20}
                height={20}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.4
                }}
              />
              <input
                type="text"
                placeholder="Search by store name, ID, or account details..."
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
              {(['all', 'pending', 'approved', 'completed', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: statusFilter === status ? '#3BB77E' : '#FFFFFF',
                    color: statusFilter === status ? '#FFFFFF' : '#1E1E1E',
                    cursor: 'pointer',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payouts Table */}
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
                  Loading payouts...
                </p>
              </div>
            ) : paginatedPayouts.length === 0 ? (
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
                  No payout requests found
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
                          textAlign: 'center',
                          fontFamily: 'Clash Grotesk Variable',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'none',
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          width: '50px'
                        }}
                      >
                        {pendingPayouts.length > 0 && (
                          <input
                            type="checkbox"
                            checked={allPendingSelected}
                            onChange={toggleAllPending}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        )}
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
                        Payment Method
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
                        Account
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
                        Amount
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPayouts.map((payout, index) => (
                      <tr
                        key={payout.id}
                        style={{
                          borderBottom: index < paginatedPayouts.length - 1 ? '1px solid #E2E8F0' : 'none',
                          transition: 'background-color 0.2s ease',
                          cursor: 'pointer',
                          backgroundColor: selectedPayouts.has(payout.id) ? '#F3F4F6' : 'transparent'
                        }}
                        onClick={() => setSelectedPayout(payout)}
                        onMouseEnter={(e) => {
                          if (!selectedPayouts.has(payout.id)) {
                            e.currentTarget.style.backgroundColor = '#F8FAFC';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedPayouts.has(payout.id)) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '20px', textAlign: 'center' }}>
                          {payout.status === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedPayouts.has(payout.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                togglePayout(payout.id);
                              }}
                              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                            />
                          )}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 500,
                              fontSize: '14px',
                              color: '#1E1E1E',
                              margin: 0
                            }}>
                              {payout.storeName}
                            </p>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 400,
                              fontSize: '12px',
                              color: 'rgba(30, 30, 30, 0.6)',
                              margin: 0,
                              marginTop: '4px'
                            }}>
                              {payout.storeId.slice(0, 16)}...
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          {getPaymentMethodBadge(payout.paymentMethod)}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#1E1E1E',
                            margin: 0
                          }}>
                            {payout.accountDetails}
                          </p>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#1E1E1E',
                            margin: 0
                          }}>
                            {formatPayoutAmount(payout.amount)}
                          </p>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: 'rgba(30, 30, 30, 0.6)',
                            margin: 0,
                            marginTop: '4px'
                          }}>
                            {new Date(payout.requestedAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{
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
                            backgroundColor: payout.status === 'approved' ? '#22C55E' :
                                           payout.status === 'completed' ? '#3B82F6' :
                                           payout.status === 'rejected' ? '#EF4444' : '#EAB308',
                            color: '#FFFFFF'
                          }}>
                            {payout.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          {payout.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(payout);
                                }}
                                disabled={processing}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #22C55E',
                                  backgroundColor: 'transparent',
                                  color: '#22C55E',
                                  cursor: processing ? 'not-allowed' : 'pointer',
                                  fontFamily: 'Clash Grotesk Variable',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  transition: 'all 0.2s ease',
                                  opacity: processing ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (!processing) {
                                    e.currentTarget.style.backgroundColor = '#22C55E';
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!processing) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#22C55E';
                                  }
                                }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(payout);
                                }}
                                disabled={processing}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #EF4444',
                                  backgroundColor: 'transparent',
                                  color: '#EF4444',
                                  cursor: processing ? 'not-allowed' : 'pointer',
                                  fontFamily: 'Clash Grotesk Variable',
                                  fontWeight: 500,
                                  fontSize: '12px',
                                  transition: 'all 0.2s ease',
                                  opacity: processing ? 0.5 : 1
                                }}
                                onMouseEnter={(e) => {
                                  if (!processing) {
                                    e.currentTarget.style.backgroundColor = '#EF4444';
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!processing) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#EF4444';
                                  }
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {payout.status !== 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPayout(payout);
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid #3BB77E',
                                backgroundColor: 'transparent',
                                color: '#3BB77E',
                                cursor: 'pointer',
                                fontFamily: 'Clash Grotesk Variable',
                                fontWeight: 500,
                                fontSize: '12px',
                                transition: 'all 0.2s ease'
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
                              View
                            </button>
                          )}
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
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredPayouts.length)} of {filteredPayouts.length} payouts
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

      {/* Payout Detail Modal */}
      {selectedPayout && (
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
          onClick={() => setSelectedPayout(null)}
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
                Payout Request Details
              </h2>
              <p style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                color: 'rgba(30, 30, 30, 0.6)',
                margin: 0
              }}>
                {selectedPayout.storeName}
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
                }}>Amount</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{formatPayoutAmount(selectedPayout.amount)}</p>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Payment Method</label>
                <div>{getPaymentMethodBadge(selectedPayout.paymentMethod)}</div>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Account Details</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{selectedPayout.accountDetails}</p>
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
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 500,
                  fontFamily: 'Clash Grotesk Variable',
                  border: 'none',
                  backgroundColor: selectedPayout.status === 'approved' ? '#22C55E' :
                                 selectedPayout.status === 'completed' ? '#3B82F6' :
                                 selectedPayout.status === 'rejected' ? '#EF4444' : '#EAB308',
                  color: '#FFFFFF'
                }}>
                  {selectedPayout.status.toUpperCase()}
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
                }}>Requested At</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{new Date(selectedPayout.requestedAt).toLocaleString()}</p>
              </div>

              {selectedPayout.processedAt && (
                <div>
                  <label style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: 'rgba(30, 30, 30, 0.6)',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Processed At</label>
                  <p style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#1E1E1E',
                    margin: 0
                  }}>{new Date(selectedPayout.processedAt).toLocaleString()}</p>
                </div>
              )}

              {selectedPayout.notes && (
                <div>
                  <label style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: 'rgba(30, 30, 30, 0.6)',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Store Notes</label>
                  <p style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#1E1E1E',
                    margin: 0
                  }}>{selectedPayout.notes}</p>
                </div>
              )}

              {selectedPayout.adminNotes && (
                <div>
                  <label style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '12px',
                    color: 'rgba(30, 30, 30, 0.6)',
                    display: 'block',
                    marginBottom: '4px'
                  }}>Admin Notes</label>
                  <p style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#1E1E1E',
                    margin: 0
                  }}>{selectedPayout.adminNotes}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              {selectedPayout.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedPayout)}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '1px solid #22C55E',
                      backgroundColor: '#22C55E',
                      color: '#FFFFFF',
                      cursor: processing ? 'not-allowed' : 'pointer',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      opacity: processing ? 0.5 : 1
                    }}
                  >
                    {processing ? 'Processing...' : 'Approve Payout'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedPayout)}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: '12px 24px',
                      borderRadius: '12px',
                      border: '1px solid #EF4444',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      cursor: processing ? 'not-allowed' : 'pointer',
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      opacity: processing ? 0.5 : 1
                    }}
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedPayout(null)}
                style={{
                  flex: selectedPayout.status === 'pending' ? 'none' : 1,
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
    </div>
  );
};
