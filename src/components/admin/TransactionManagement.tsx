/**
 * Transaction Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard Transaction Management Interface
 * Matches design system from Store Management and Customer Management
 *
 * EXACT SPECIFICATIONS:
 * - 1440x1024 admin dashboard baseline
 * - Clash Grotesk Variable typography
 * - Exact TindaGo color palette
 * - Stats cards: 270px x 150px with colored icon squares
 * - Table with rounded-20px card, shadow, hover effects
 * - Pixel-perfect positioning and spacing
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { processRefund, exportToCSV, formatCurrency } from '@/lib/transactionService';
import { getCommissionRate, setCommissionRate } from '@/lib/commission';

// Payment Method Logo Components - Styled badges matching Figma design
const GCashLogo = () => (
  <div style={{ 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    backgroundColor: '#2F7FED',
    borderRadius: '8px',
    minWidth: '110px',
    height: '32px'
  }}>
    {/* GCash G icon */}
    <div style={{
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#1E5FCC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '14px',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      G
    </div>
    <span style={{ 
      color: 'white', 
      fontSize: '14px', 
      fontWeight: 600, 
      fontFamily: 'sans-serif'
    }}>Gcash</span>
  </div>
);

const PayMayaLogo = () => (
  <div style={{ 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    backgroundColor: '#00D632',
    borderRadius: '8px',
    minWidth: '120px',
    height: '32px'
  }}>
    {/* maya text watermark */}
    <span style={{ 
      color: 'rgba(255, 255, 255, 0.4)', 
      fontSize: '11px', 
      fontWeight: 600, 
      fontFamily: 'sans-serif',
      fontStyle: 'italic'
    }}>maya</span>
    <span style={{ 
      color: 'white', 
      fontSize: '14px', 
      fontWeight: 600, 
      fontFamily: 'sans-serif'
    }}>PayMaya</span>
  </div>
);

const CardLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#6B7280', borderRadius: '6px' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
    <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, fontFamily: 'Clash Grotesk Variable' }}>Card</span>
  </div>
);

const OnlineLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#8B5CF6', borderRadius: '6px' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
    <span style={{ color: 'white', fontSize: '11px', fontWeight: 600, fontFamily: 'Clash Grotesk Variable' }}>Online</span>
  </div>
);

const getPaymentMethodLogo = (method: string) => {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('gcash')) return <GCashLogo />;
  if (methodLower.includes('paymaya')) return <PayMayaLogo />;
  if (methodLower.includes('card')) return <CardLogo />;
  // Default to GCash for all other payment methods (including 'online')
  return <GCashLogo />;
};

interface Transaction {
  id: string;
  invoiceId: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  amount: number;
  commission: number;
  commissionRate: number;
  storeAmount: number;
  method: string;
  status: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  paidAt?: string;
  invoiceUrl?: string;
}

export const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PAID' | 'PENDING' | 'REFUNDED'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refunding, setRefunding] = useState(false);
  const [commissionRate, setCommissionRateState] = useState(0.10);
  const [showEditFee, setShowEditFee] = useState(false);
  const [newCommissionRate, setNewCommissionRate] = useState('10');

  // Row-specific edit states
  const [showReplaceInvoice, setShowReplaceInvoice] = useState(false);
  const [replaceRatePct, setReplaceRatePct] = useState(''); // optional, %
  const [replaceFeeAmount, setReplaceFeeAmount] = useState(''); // optional, ₱ absolute
  const [savingReplace, setSavingReplace] = useState(false);

  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustDelta, setAdjustDelta] = useState(''); // can be + or -
  const [adjustReason, setAdjustReason] = useState('');
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Load commission rate
  useEffect(() => {
    const loadCommissionRate = async () => {
      try {
        const rate = await getCommissionRate();
        setCommissionRateState(rate);
        setNewCommissionRate((rate * 100).toString());
      } catch (error) {
        console.error('Error loading commission rate:', error);
      }
    };
    loadCommissionRate();
  }, []);

  // Load transactions from API route (bypasses Firebase security rules)
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/transactions', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to fetch transactions');
        }
        const data = await res.json();
        setTransactions(data.transactions || []);
        setLoading(false);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setLoading(false);
      }
    };

    loadTransactions();

    // Refresh every 30 seconds
    const interval = setInterval(loadTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const stats = {
    total: transactions.length,
    paid: transactions.filter(t => t.status === 'PAID' || t.status === 'SETTLED').length,
    pending: transactions.filter(t => t.status === 'PENDING').length,
    refunded: transactions.filter(t => t.status === 'REFUNDED').length,
    totalRevenue: transactions.filter(t => t.status === 'PAID' || t.status === 'SETTLED').reduce((sum, t) => sum + t.amount, 0),
    totalCommission: transactions.filter(t => t.status === 'PAID' || t.status === 'SETTLED').reduce((sum, t) => sum + t.commission, 0),
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = !searchTerm ||
      t.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRefund = async (transaction: Transaction) => {
    const reason = prompt('Reason for refund:');
    if (!reason) return;

    if (!confirm(`Are you sure you want to refund this transaction?\n\nInvoice: ${transaction.invoiceId}\nAmount: ₱${transaction.amount.toFixed(2)}\n\nThis action cannot be undone.`)) {
      return;
    }

    setRefunding(true);
    try {
      await processRefund(transaction.invoiceId, transaction.storeId, reason);
      alert('Transaction refunded successfully!');
      setSelectedTransaction(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setRefunding(false);
    }
  };

  const handleExport = () => {
    const csv = exportToCSV(filteredTransactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCommissionRate = async () => {
    try {
      const rateValue = parseFloat(newCommissionRate);
      if (isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
        alert('Please enter a valid commission rate between 0 and 100');
        return;
      }
      const rateDecimal = rateValue / 100;
      await setCommissionRate(rateDecimal);
      setCommissionRateState(rateDecimal);
      setShowEditFee(false);
      alert(`Commission rate updated to ${rateValue}%`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update commission rate';
      alert(`Error: ${errorMessage}`);
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
                Transaction Records
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
                Monitor all payment transactions synchronized with TindaGo mobile app in real-time
              </p>
            </div>

            {/* Commission Fee Status and Edit Fee Button */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Commission Fee Status Button */}
              <div
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 183, 126, 0.3)',
                  backgroundColor: 'rgba(59, 183, 126, 0.1)',
                  color: '#3BB77E',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Commission Fee: {(commissionRate * 100).toFixed(0)}%
              </div>

              {/* Edit Fee Button */}
              <button
                onClick={() => setShowEditFee(true)}
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Fee
              </button>
            </div>
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
            {/* Total Transactions Card */}
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
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
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
                    Total Transactions
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
                  {/* Spacer for alignment with cards that have revenue */}
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'transparent',
                      margin: 0,
                      marginTop: '4px',
                      userSelect: 'none'
                    }}
                  >
                    &nbsp;
                  </p>
                </div>
              </div>
            </div>

            {/* Paid Transactions Card */}
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
              onClick={() => setStatusFilter('PAID')}
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
                    Paid
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
                    {stats.paid.toLocaleString()}
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
                    {formatCurrency(stats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Transactions Card */}
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
              onClick={() => setStatusFilter('PENDING')}
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
                  {/* Spacer for alignment with cards that have revenue */}
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'transparent',
                      margin: 0,
                      marginTop: '4px',
                      userSelect: 'none'
                    }}
                  >
                    &nbsp;
                  </p>
                </div>
              </div>
            </div>

            {/* Refunded Transactions Card */}
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
              onClick={() => setStatusFilter('REFUNDED')}
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
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
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
                    Refunded
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
                    {stats.refunded.toLocaleString()}
                  </p>
                  {/* Spacer for alignment with cards that have revenue */}
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: 'transparent',
                      margin: 0,
                      marginTop: '4px',
                      userSelect: 'none'
                    }}
                  >
                    &nbsp;
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
                placeholder="Search by invoice ID, order number, or store name..."
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
              {(['all', 'PAID', 'PENDING', 'REFUNDED'] as const).map((status) => {
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
                    {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                );
              })}

              {/* Export CSV Button */}
              <button
                onClick={handleExport}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
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
                  gap: '6px',
                  marginLeft: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2E9C66';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3BB77E';
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
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
                  Loading transactions...
                </p>
              </div>
            ) : paginatedTransactions.length === 0 ? (
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
                  No transactions found
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
                        Transaction
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
                        Date
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
                    {paginatedTransactions.map((transaction, index) => (
                      <tr
                        key={transaction.invoiceId}
                        style={{
                          borderBottom: index < paginatedTransactions.length - 1 ? '1px solid #E2E8F0' : 'none',
                          transition: 'background-color 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedTransaction(transaction)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <td style={{ padding: '20px' }}>
                          <div>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 500,
                              fontSize: '14px',
                              color: '#1E1E1E',
                              margin: 0
                            }}>
                              {transaction.invoiceId.slice(0, 16)}...
                            </p>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 400,
                              fontSize: '12px',
                              color: 'rgba(30, 30, 30, 0.6)',
                              margin: 0,
                              marginTop: '4px'
                            }}>
                              {transaction.orderNumber}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#1E1E1E',
                            margin: 0
                          }}>
                            {transaction.storeName}
                          </p>
                        </td>
                        <td style={{ padding: '20px' }}>
                          {getPaymentMethodLogo(transaction.method)}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <div>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#1E1E1E',
                              margin: 0
                            }}>
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p style={{
                              fontFamily: 'Clash Grotesk Variable',
                              fontWeight: 400,
                              fontSize: '12px',
                              color: 'rgba(30, 30, 30, 0.6)',
                              margin: 0,
                              marginTop: '4px'
                            }}>
                              Commission: {formatCurrency(transaction.commission)}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '20px' }}>
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
                            backgroundColor: transaction.status === 'PAID' || transaction.status === 'SETTLED' ? '#22C55E' :
                                           transaction.status === 'PENDING' ? '#EAB308' : '#EF4444',
                            color: '#FFFFFF'
                          }}>
                            {transaction.status}
                          </span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <p style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#1E1E1E',
                            margin: 0
                          }}>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTransaction(transaction);
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
                      Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
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
          onClick={() => setSelectedTransaction(null)}
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
                Transaction Details
              </h2>
              <p style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                color: 'rgba(30, 30, 30, 0.6)',
                margin: 0
              }}>
                {selectedTransaction.invoiceId}
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
                }}>Order Number</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{selectedTransaction.orderNumber}</p>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Store</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{selectedTransaction.storeName}</p>
              </div>

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
                }}>{formatCurrency(selectedTransaction.amount)}</p>
              </div>

              <div>
                <label style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: 'rgba(30, 30, 30, 0.6)',
                  display: 'block',
                  marginBottom: '4px'
                }}>Commission ({(selectedTransaction.commissionRate * 100).toFixed(2)}%)</label>
                <p style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '14px',
                  color: '#1E1E1E',
                  margin: 0
                }}>{formatCurrency(selectedTransaction.commission)}</p>
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
                  backgroundColor: selectedTransaction.status === 'PAID' || selectedTransaction.status === 'SETTLED' ? '#22C55E' :
                                 selectedTransaction.status === 'PENDING' ? '#EAB308' : '#EF4444',
                  color: '#FFFFFF'
                }}>
                  {selectedTransaction.status}
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
                }}>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
              </div>

              {selectedTransaction.invoiceUrl && (
                <div>
                  <a
                    href={selectedTransaction.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#3BB77E',
                      textDecoration: 'none'
                    }}
                  >
                    View Xendit Invoice →
                  </a>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              {selectedTransaction.status === 'PENDING' && (
                <button
                  onClick={() => setShowReplaceInvoice(true)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid #3BB77E',
                    backgroundColor: '#3BB77E',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  Replace Invoice (Edit Fee)
                </button>
              )}

              {(selectedTransaction.status === 'PAID' || selectedTransaction.status === 'SETTLED') && (
                <button
                  onClick={() => setShowAdjustment(true)}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid #3B82F6',
                    backgroundColor: '#3B82F6',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px'
                  }}
                >
                  Add Adjustment
                </button>
              )}

              {(selectedTransaction.status === 'PAID' || selectedTransaction.status === 'SETTLED') && (
                <button
                  onClick={() => handleRefund(selectedTransaction)}
                  disabled={refunding}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid #EF4444',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    cursor: refunding ? 'not-allowed' : 'pointer',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    opacity: refunding ? 0.5 : 1
                  }}
                >
                  {refunding ? 'Processing...' : 'Process Refund'}
                </button>
              )}
              <button
                onClick={() => setSelectedTransaction(null)}
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

      {/* Edit Commission Fee Modal */}
      {showEditFee && (
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
          onClick={() => setShowEditFee(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '500px',
              padding: '32px'
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
                Edit Commission Fee
              </h2>
              <p style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '14px',
                color: 'rgba(30, 30, 30, 0.6)',
                margin: 0
              }}>
                Set the platform commission rate. This will apply to all new transactions in the TindaGo app.
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                color: '#1E1E1E',
                display: 'block',
                marginBottom: '8px'
              }}>
                Commission Rate (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={newCommissionRate}
                  onChange={(e) => setNewCommissionRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Clash Grotesk Variable',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#1E1E1E',
                    outline: 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'rgba(30, 30, 30, 0.6)'
                }}>
                  %
                </div>
              </div>
              <p style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '12px',
                color: 'rgba(30, 30, 30, 0.6)',
                margin: 0,
                marginTop: '8px'
              }}>
                Current rate: {(commissionRate * 100).toFixed(1)}%
              </p>
            </div>

            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE047' }}>
              <p style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '13px',
                color: '#92400E',
                margin: 0
              }}>
                ⚠️ This will affect all new transactions processed through the TindaGo mobile app. Existing transactions will not be modified.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleSaveCommissionRate}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid #3BB77E',
                  backgroundColor: '#3BB77E',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditFee(false)}
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
                Cancel
              </button>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
              <a
                href="/settings/payments"
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '13px',
                  color: '#3BB77E',
                  textDecoration: 'none'
                }}
              >
                Edit default or per-store rate in Payment Settings →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Replace Invoice Modal (Pending only) */}
      {showReplaceInvoice && selectedTransaction && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => !savingReplace && setShowReplaceInvoice(false)}
        >
          <div
            style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', width: '90%', maxWidth: '520px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '20px', fontWeight: 600, margin: 0, marginBottom: '6px' }}>Replace Invoice (Edit Fee)</h3>
            <p style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '12px', color: 'rgba(30,30,30,0.6)', marginTop: 0 }}>
              Enter either a new commission rate (%) or a new platform fee amount (₱). Leave the other blank.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '13px' }}>New Rate (%)</label>
                <input type="number" min="0" max="100" step="0.1" value={replaceRatePct} onChange={(e)=>setReplaceRatePct(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '13px' }}>New Fee (₱)</label>
                <input type="number" min="0" step="0.01" value={replaceFeeAmount} onChange={(e)=>setReplaceFeeAmount(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={async ()=>{
                  if (savingReplace) return;
                  const body: any = {};
                  const rate = parseFloat(replaceRatePct);
                  const fee = parseFloat(replaceFeeAmount);
                  if (!isNaN(rate)) body.newCommissionRate = rate/100;
                  if (!isNaN(fee)) body.newCommissionAmount = fee;
                  if (!body.newCommissionRate && !body.newCommissionAmount){ alert('Enter a rate or a fee'); return; }
                  setSavingReplace(true);
                  try {
                    const res = await fetch(`/api/admin/transactions/${selectedTransaction.invoiceId}/replace-invoice`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
                    });
                    if (!res.ok) throw new Error(await res.text());
                    alert('Invoice replaced successfully.');
                    setShowReplaceInvoice(false);
                    window.location.reload();
                  } catch (e: any) {
                    alert(`Error: ${e?.message || 'Failed to replace invoice'}`);
                  } finally { setSavingReplace(false); }
                }}
                style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', border: '1px solid #3BB77E', backgroundColor: '#3BB77E', color: '#FFFFFF' }}
              >{savingReplace ? 'Saving...' : 'Save'}</button>
              <button onClick={()=>!savingReplace && setShowReplaceInvoice(false)}
                style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#FFFFFF' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjustment Modal (Paid/Settled only) */}
      {showAdjustment && selectedTransaction && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onClick={() => !savingAdjustment && setShowAdjustment(false)}
        >
          <div
            style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', width: '90%', maxWidth: '520px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '20px', fontWeight: 600, margin: 0, marginBottom: '6px' }}>Add Adjustment</h3>
            <p style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '12px', color: 'rgba(30,30,30,0.6)', marginTop: 0 }}>
              Add a positive or negative amount to the store’s earnings for this transaction. Wallets will reconcile automatically.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '13px' }}>Delta (₱)</label>
                <input type="number" step="0.01" value={adjustDelta} onChange={(e)=>setAdjustDelta(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <label style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '13px' }}>Reason</label>
              <input type="text" value={adjustReason} onChange={(e)=>setAdjustReason(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={async ()=>{
                  if (savingAdjustment) return;
                  const delta = parseFloat(adjustDelta);
                  if (isNaN(delta) || delta === 0){ alert('Enter a non-zero delta'); return; }
                  setSavingAdjustment(true);
                  try {
                    const res = await fetch(`/api/admin/transactions/${selectedTransaction.invoiceId}/adjustment`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deltaStoreAmount: delta, reason: adjustReason || 'Adjustment' })
                    });
                    if (!res.ok) throw new Error(await res.text());
                    alert('Adjustment saved.');
                    setShowAdjustment(false);
                    window.location.reload();
                  } catch (e: any) {
                    alert(`Error: ${e?.message || 'Failed to save adjustment'}`);
                  } finally { setSavingAdjustment(false); }
                }}
                style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', border: '1px solid #3B82F6', backgroundColor: '#3B82F6', color: '#FFFFFF' }}
              >{savingAdjustment ? 'Saving...' : 'Save'}</button>
              <button onClick={()=>!savingAdjustment && setShowAdjustment(false)}
                style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', backgroundColor: '#FFFFFF' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
