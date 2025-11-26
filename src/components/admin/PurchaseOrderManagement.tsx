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
    // Refresh every 5 minutes
    const interval = setInterval(loadPurchaseOrders, 300000);
    return () => clearInterval(interval);
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

  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#666', fontFamily: 'Clash Grotesk Variable' }}>
          Loading purchase orders...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 32px 32px 32px' }}>
      {/* Stats Cards Row - 270px x 150px each */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Orders */}
        <div style={{
          width: '100%',
          maxWidth: '270px',
          height: '150px',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#E3F2FD',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2196F3" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '14px',
              color: '#64748B',
              marginBottom: '4px'
            }}>Total Orders</p>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '32px',
              fontWeight: 700,
              color: '#1E293B'
            }}>{stats.total}</p>
          </div>
        </div>

        {/* Total Amount */}
        <div style={{
          width: '100%',
          maxWidth: '270px',
          height: '150px',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#FFF3E0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8D2F" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '14px',
              color: '#64748B',
              marginBottom: '4px'
            }}>Total Purchase Value</p>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '28px',
              fontWeight: 700,
              color: '#1E293B'
            }}>₱{stats.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Paid Amount */}
        <div style={{
          width: '100%',
          maxWidth: '270px',
          height: '150px',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#E8F5E9',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
              <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '14px',
              color: '#64748B',
              marginBottom: '4px'
            }}>Paid ({stats.paid} orders)</p>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '28px',
              fontWeight: 700,
              color: '#10B981'
            }}>₱{stats.paidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Unpaid Amount */}
        <div style={{
          width: '100%',
          maxWidth: '270px',
          height: '150px',
          background: 'white',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#FFEBEE',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F44336" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
          </div>
          <div>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '14px',
              color: '#64748B',
              marginBottom: '4px'
            }}>Unpaid ({stats.unpaid} orders)</p>
            <p style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '28px',
              fontWeight: 700,
              color: '#EF4444'
            }}>₱{(stats.totalAmount - stats.paidAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748B',
              marginBottom: '8px'
            }}>Search</label>
            <input
              type="text"
              placeholder="PO number, store, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Clash Grotesk Variable',
                outline: 'none'
              }}
            />
          </div>

          {/* Payment Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748B',
              marginBottom: '8px'
            }}>Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Clash Grotesk Variable',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label style={{
              display: 'block',
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '13px',
              fontWeight: 500,
              color: '#64748B',
              marginBottom: '8px'
            }}>Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: 'Clash Grotesk Variable',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="gcash">GCash</option>
              <option value="paymaya">PayMaya</option>
              <option value="debt">Debt</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadPurchaseOrders}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Clash Grotesk Variable',
              cursor: 'pointer',
              height: '42px'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div style={{
        marginBottom: '16px',
        fontFamily: 'Clash Grotesk Variable',
        fontSize: '14px',
        color: '#64748B'
      }}>
        Showing {filteredOrders.length} of {purchaseOrders.length} purchase orders
      </div>

      {/* Table Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>PO Number</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Store</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Supplier</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Items</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'right',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Amount</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Payment</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Status</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'left',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Date</th>
                <th style={{
                  padding: '16px 20px',
                  textAlign: 'center',
                  fontFamily: 'Clash Grotesk Variable',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#64748B',
                  backgroundColor: '#F8FAFC'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: '#94A3B8',
                      fontFamily: 'Clash Grotesk Variable'
                    }}
                  >
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
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
                        fontFamily: 'Clash Grotesk Variable',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: po.status === 'received' ? '#10B981' : po.status === 'cancelled' ? '#EF4444' : '#F59E0B'
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
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedOrder(po)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: 'Clash Grotesk Variable',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{
              marginBottom: '24px',
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'Clash Grotesk Variable',
              color: '#1E293B'
            }}>
              Purchase Order Details
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontFamily: 'Clash Grotesk Variable' }}>PO Number:</strong>{' '}
              <span style={{ fontFamily: 'Clash Grotesk Variable', color: '#64748B' }}>
                {selectedOrder.purchaseOrderNumber}
              </span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontFamily: 'Clash Grotesk Variable' }}>Store:</strong>{' '}
              <span style={{ fontFamily: 'Clash Grotesk Variable', color: '#64748B' }}>
                {selectedOrder.storeInfo?.name || selectedOrder.storeName}
              </span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontFamily: 'Clash Grotesk Variable' }}>Supplier:</strong>{' '}
              <span style={{ fontFamily: 'Clash Grotesk Variable', color: '#64748B' }}>
                {selectedOrder.supplierName}
              </span>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontFamily: 'Clash Grotesk Variable' }}>Payment Method:</strong>{' '}
              {getPaymentMethodLogo(selectedOrder.paymentMethod)}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong style={{ fontFamily: 'Clash Grotesk Variable' }}>Total Amount:</strong>{' '}
              <span style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>
                ₱{selectedOrder.totalCost?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <h3 style={{
              marginTop: '24px',
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: 'Clash Grotesk Variable',
              color: '#1E293B'
            }}>
              Items ({selectedOrder.items?.length || 0})
            </h3>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              {selectedOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    fontFamily: 'Clash Grotesk Variable'
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#1E293B' }}>{item.productName}</div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                    Qty: {item.quantity} × ₱{item.costPerUnit?.toFixed(2)} = ₱{item.totalCost?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                marginTop: '24px',
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'Clash Grotesk Variable',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
