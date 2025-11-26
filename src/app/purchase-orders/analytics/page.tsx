'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

/**
 * PURCHASE ORDERS ANALYTICS PAGE
 *
 * Comprehensive analytics dashboard for purchase orders
 * Shows trends, top stores, top suppliers, payment breakdowns
 *
 * Design Baseline: 1440x1024
 */

interface Analytics {
  totalOrders: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  paymentStatusBreakdown: Record<string, number>;
  paymentMethodBreakdown: Record<string, number>;
  topStores: Array<{
    storeId: string;
    storeName: string;
    totalAmount: number;
    orderCount: number;
  }>;
  topSuppliers: Array<{
    supplierName: string;
    orderCount: number;
  }>;
  recentActivity: any[];
  averageOrderValue: number;
}

export default function PurchaseOrdersAnalyticsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/purchase-orders/analytics', {
        cache: 'no-store',
      });

      if (!res.ok) throw new Error('Failed to fetch analytics');

      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: '100vw',
          maxWidth: '1440px',
          minHeight: '1024px',
          backgroundColor: '#F3F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '18px', color: '#666' }}>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div
        style={{
          width: '100vw',
          maxWidth: '1440px',
          minHeight: '1024px',
          backgroundColor: '#F3F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: '18px', color: '#666' }}>Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} currentPage="purchase-orders" />

      {/* Main Content */}
      <div
        className="absolute lg:left-[273px]"
        style={{
          top: '0px',
          width: 'calc(100% - 273px)',
          minHeight: '1024px',
        }}
      >
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <div
          style={{
            position: 'relative',
            top: '80px',
            minHeight: '944px',
            padding: '32px',
          }}
        >
          {/* Page Title */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => router.push('/purchase-orders')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #E0E0E0',
                borderRadius: '12px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              ← Back to Purchase Orders
            </button>
            <h1
              style={{
                fontFamily: 'Clash Grotesk Variable, sans-serif',
                fontSize: '32px',
                fontWeight: 600,
                color: '#1A1A1A',
              }}
            >
              Purchase Orders Analytics
            </h1>
          </div>

          {/* Summary Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {/* Total Orders */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Total Orders
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1A1A1A' }}>
                {analytics.totalOrders}
              </div>
            </div>

            {/* Total Amount */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Total Purchase Value
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1A1A1A' }}>
                ₱{analytics.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Average Order Value */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Average Order Value
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#1A1A1A' }}>
                ₱{analytics.averageOrderValue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Paid Amount */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Paid Amount
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#4CAF50' }}>
                ₱{analytics.paidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {((analytics.paidAmount / analytics.totalAmount) * 100).toFixed(1)}% of total
              </div>
            </div>

            {/* Unpaid Amount */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Unpaid Amount
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#F44336' }}>
                ₱{analytics.unpaidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {((analytics.unpaidAmount / analytics.totalAmount) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>

          {/* Payment Breakdowns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
              marginBottom: '32px',
            }}
          >
            {/* Payment Status Breakdown */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Payment Status
              </h3>
              {Object.entries(analytics.paymentStatusBreakdown).map(([status, count]) => (
                <div
                  key={status}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count} orders</span>
                </div>
              ))}
            </div>

            {/* Payment Method Breakdown */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
                Payment Methods
              </h3>
              {Object.entries(analytics.paymentMethodBreakdown).map(([method, count]) => (
                <div
                  key={method}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#F8F9FA',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{method}</span>
                  <span style={{ fontWeight: 700 }}>{count} orders</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Stores */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              Top Stores by Purchase Volume
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F8F9FA' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Rank</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Store Name</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Orders</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topStores.map((store, idx) => (
                    <tr key={store.storeId} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '12px' }}>#{idx + 1}</td>
                      <td style={{ padding: '12px' }}>{store.storeName}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{store.orderCount}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        ₱{store.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Suppliers */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              Top Suppliers by Order Count
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#F8F9FA' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Rank</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Supplier Name</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topSuppliers.map((supplier, idx) => (
                    <tr key={supplier.supplierName} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '12px' }}>#{idx + 1}</td>
                      <td style={{ padding: '12px' }}>{supplier.supplierName}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                        {supplier.orderCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
              Recent Purchase Orders (Last 30 Days)
            </h3>
            {analytics.recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No recent purchase orders
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                {analytics.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#F8F9FA',
                      borderRadius: '12px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong>{activity.purchaseOrderNumber}</strong>
                      <span style={{ fontWeight: 700 }}>
                        ₱{activity.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {activity.storeName} → {activity.supplierName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      {new Date(activity.createdAt).toLocaleDateString('en-PH')} •
                      {activity.paymentMethod.toUpperCase()} •
                      {activity.paymentStatus.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
