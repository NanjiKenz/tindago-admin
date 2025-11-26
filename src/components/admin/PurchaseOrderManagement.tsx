/**
 * Purchase Order Management Component - Pixel-Perfect Admin Dashboard Implementation
 *
 * TindaGo Admin Dashboard Purchase Order Management Interface
 * Matches design system from Transaction Management and Store Management
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
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Button } from '@/components/ui/Button';

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

const CashLogo = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    backgroundColor: '#10B981',
    borderRadius: '8px',
    minWidth: '90px',
    height: '32px'
  }}>
    <span style={{
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: 'Clash Grotesk Variable'
    }}>Cash</span>
  </div>
);

const DebtLogo = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    backgroundColor: '#F97316',
    borderRadius: '8px',
    minWidth: '90px',
    height: '32px'
  }}>
    <span style={{
      color: 'white',
      fontSize: '14px',
      fontWeight: 600,
      fontFamily: 'Clash Grotesk Variable'
    }}>Debt</span>
  </div>
);

const getPaymentMethodLogo = (method: string) => {
  const methodLower = method.toLowerCase();
  if (methodLower.includes('gcash')) return <GCashLogo />;
  if (methodLower.includes('paymaya')) return <PayMayaLogo />;
  if (methodLower.includes('debt')) return <DebtLogo />;
  return <CashLogo />;
};

interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string;
  storeId: string;
  storeName?: string;
  supplierName: string;
  supplierContact?: string;
  totalCost: number;
  paymentMethod: 'cash' | 'gcash' | 'paymaya' | 'debt';
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  status: 'pending' | 'received' | 'cancelled'; // ✅ FIXED: Changed 'delivered' to 'received' to match mobile app
  items: any[];
  totalItems?: number;
  totalQuantity?: number;
  createdAt: string;
  receivedDate?: string; // Date when order was marked as received
  invoiceUrl?: string; // Xendit invoice URL if payment was made via Xendit
  storeInfo?: {
    name: string;
    address: string;
    ownerName: string;
  };
}

export default function PurchaseOrderManagement() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  // Load purchase orders
  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/purchase-orders', { cache: 'no-store' });

      if (!res.ok) throw new Error('Failed to fetch purchase orders');

      const data = await res.json();
      setPurchaseOrders(data.purchaseOrders || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
    // Auto-refresh disabled to reduce Firebase read costs
    // Use the manual Refresh button instead
  }, []);

  // Calculate stats
  const stats = {
    total: purchaseOrders.length,
    paid: purchaseOrders.filter(po => po.paymentStatus === 'paid').length,
    unpaid: purchaseOrders.filter(po => po.paymentStatus === 'unpaid' || po.paymentStatus === 'pending').length,
    totalAmount: purchaseOrders.reduce((sum, po) => sum + (po.totalCost || 0), 0),
    paidAmount: purchaseOrders
      .filter(po => po.paymentStatus === 'paid')
      .reduce((sum, po) => sum + (po.totalCost || 0), 0),
  };

  // Filter purchase orders
  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = !searchTerm ||
      po.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.storeInfo?.name || po.storeName)?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPaymentStatus = paymentStatusFilter === 'all' || po.paymentStatus === paymentStatusFilter;
    const matchesPaymentMethod = paymentMethodFilter === 'all' || po.paymentMethod === paymentMethodFilter;

    return matchesSearch && matchesPaymentStatus && matchesPaymentMethod;
  });

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
                Purchase Orders
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
                Monitor B2B purchase transactions where store owners buy inventory from suppliers
              </p>
            </div>

            {/* Refresh Button */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <RefreshButton 
                onClick={() => loadPurchaseOrders()} 
                loading={loading} 
              />
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
            {/* Total Orders Card */}
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
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
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
                    Total Orders
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

            {/* Total Amount Card */}
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
                <div
                  className="absolute rounded-xl flex items-center justify-center"
                  style={{
                    right: '20px',
                    top: '20px',
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#FF8D2F',
                    color: '#FFFFFF',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    fontFamily: 'Clash Grotesk Variable'
                  }}
                >
                  ₱
                </div>
                <div
                  className="absolute"
                  style={{
                    left: '20px',
                    top: '20px',
                    width: '180px'
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
                    Total Purchase Value
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
                      fontSize: '28px',
                      lineHeight: '1.1em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    ₱{stats.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
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

            {/* Paid Amount Card */}
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
                    ₱{stats.paidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Unpaid Amount Card */}
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
                    Unpaid
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
                    {stats.unpaid.toLocaleString()}
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
                    ₱{(stats.totalAmount - stats.paidAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
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
                placeholder="Search by PO number, store, or supplier..."
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

            {/* Payment Status Filter Badges */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {(['all', 'paid', 'unpaid', 'pending'] as const).map((status) => {
                const isActive = paymentStatusFilter === status;
                const displayName = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
                return (
                  <button
                    key={status}
                    onClick={() => setPaymentStatusFilter(status)}
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
                    {displayName}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Purchase Orders Table */}
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
                  Loading purchase orders...
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
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
                  No purchase orders found
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
                        PO Number
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
                        Supplier
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
                        Items
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
                        Payment
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
                    {filteredOrders.map((po, index) => (
                  <tr
                    key={po.id}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1E293B'
                    }}>{po.purchaseOrderNumber}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '14px',
                      color: '#475569'
                    }}>{po.storeInfo?.name || po.storeName || 'Unknown'}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '14px',
                      color: '#475569'
                    }}>{po.supplierName}</td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '14px',
                      color: '#475569'
                    }}>
                      {po.totalItems || po.items?.length || 0} items
                      <span style={{ color: '#94A3B8', fontSize: '12px', display: 'block' }}>
                        Qty: {po.totalQuantity || 0}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1E293B',
                      textAlign: 'right'
                    }}>₱{po.totalCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 }) || '0.00'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      {getPaymentMethodLogo(po.paymentMethod)}
                      <div style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        fontFamily: 'Clash Grotesk Variable',
                        color: po.paymentStatus === 'paid' ? '#10B981' : '#EF4444',
                        fontWeight: 600
                      }}>
                        {po.paymentStatus.toUpperCase()}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 14px',
                        backgroundColor: po.status === 'received' ? '#22C55E' : po.status === 'cancelled' ? '#EF4444' : '#F59E0B',
                        borderRadius: '8px',
                        fontFamily: 'Clash Grotesk Variable',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'white'
                      }}>
                        {po.status === 'received' ? 'DELIVERED' : po.status === 'cancelled' ? 'CANCELLED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{
                      padding: '16px 20px',
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '13px',
                      color: '#64748B'
                    }}>
                      {new Date(po.createdAt).toLocaleDateString('en-PH')}
                      <span style={{ display: 'block', fontSize: '12px', color: '#94A3B8' }}>
                        {new Date(po.createdAt).toLocaleTimeString('en-PH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(po)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#3BB77E',
                          border: '2px solid #3BB77E',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          fontFamily: 'Clash Grotesk Variable',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F0FDF4';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        View
                      </button>
                    </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '0',
              maxWidth: '540px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              fontFamily: 'Clash Grotesk Variable'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                fontFamily: 'Clash Grotesk Variable',
                color: '#1F2937',
                margin: 0
              }}>
                Purchase Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: 1,
                  fontWeight: 300
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px 32px' }}>
              {/* ID */}
              <div style={{ marginBottom: '20px', fontSize: '14px', color: '#6B7280' }}>
                {selectedOrder.purchaseOrderNumber}
              </div>

              {/* Order Number */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Order Number</div>
                <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>{selectedOrder.purchaseOrderNumber}</div>
              </div>

              {/* Store */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Store</div>
                <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>{selectedOrder.storeInfo?.name || selectedOrder.storeName}</div>
              </div>

              {/* Supplier */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Supplier</div>
                <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>{selectedOrder.supplierName}</div>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Amount</div>
                <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
                  ₱{selectedOrder.totalCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>Status</div>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  backgroundColor: selectedOrder.paymentStatus === 'paid' ? '#22C55E' : '#EF4444',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>

              {/* Created At */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Created At</div>
                <div style={{ fontSize: '15px', color: '#111827', fontWeight: 500 }}>
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                  }) : '—'}
                </div>
              </div>

              {/* Xendit Invoice Link */}
              {selectedOrder.paymentInfo?.invoiceUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Xendit Invoice</div>
                  <a 
                    href={selectedOrder.paymentInfo.invoiceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      color: '#3BB77E',
                      textDecoration: 'underline',
                      fontSize: '15px',
                      fontWeight: 500,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    View Xendit Invoice →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
