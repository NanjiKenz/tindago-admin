/**
 * Transaction Summary Component - Simple Clean Table
 *
 * Displays transaction summary with filters and clean table design
 * Columns: DATE | STORE | STATUS | ORDERS | SALES | ACTIONS
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';

interface Transaction {
  id: string;
  date: string;
  store: string;
  storeId: string;
  status: 'Active' | 'Rejected';
  paymentMethod: string;
  orders: number;
  sales: number;
  createdAt: string;
}

interface TransactionSummaryProps {
  timeRange?: string;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ timeRange = new Date().toLocaleString('en-US', { month: 'long' }) }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load transactions from API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/transactions', { cache: 'no-store' });
        if (!res.ok) {
          console.error('Failed to fetch transactions');
          setLoading(false);
          return;
        }
        const data = await res.json();
        
        // Transform API data
        const transformedData: Transaction[] = (data.transactions || []).map((t: any, index: number) => ({
          id: t.invoiceId || `txn-${index}`,
          date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
          store: t.storeName || 'Unknown Store',
          storeId: t.storeId || '',
          status: (t.status === 'PAID' || t.status === 'SETTLED') ? 'Active' as const : 'Rejected' as const,
          paymentMethod: (t.method || 'online').toLowerCase(), // Normalize to lowercase
          orders: 1,
          sales: t.amount || 0,
          createdAt: t.createdAt || new Date().toISOString()
        }));
        
        // Debug: Log unique payment methods
        const uniqueMethods = [...new Set(transformedData.map(t => t.paymentMethod))];
        console.log('Payment methods in data:', uniqueMethods);
        console.log('Sample transactions:', transformedData.slice(0, 3));
        
        setTransactions(transformedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Get unique stores
  const uniqueStores = useMemo(() => {
    const storeMap = new Map<string, string>();
    transactions.forEach(t => {
      if (t.storeId && t.store) {
        storeMap.set(t.storeId, t.store);
      }
    });
    return Array.from(storeMap.entries()).map(([id, name]) => ({ id, name }));
  }, [transactions]);

  // Filter and group transactions by store
  const groupedStoreData = useMemo(() => {
    // Parse the selected month (e.g., "January") - assume current year
    const monthIndex = new Date(Date.parse(timeRange + ' 1, 2025')).getMonth();
    const year = new Date().getFullYear();
    
    // Get start and end dates for the selected month
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    console.log('[TransactionSummary] Time Range:', timeRange);
    console.log('[TransactionSummary] Start Date:', startDate);
    console.log('[TransactionSummary] End Date:', endDate);
    console.log('[TransactionSummary] Total Transactions:', transactions.length);

    // First filter transactions
    const filtered = transactions.filter(t => {
      // Time range filter
      const txDate = new Date(t.createdAt);
      const matchesTimeRange = txDate >= startDate && txDate <= endDate;
      
      if (!matchesTimeRange) {
        console.log('[TransactionSummary] Filtered out (date):', t.store, txDate, 'range:', startDate, '-', endDate);
      }
      
      // Search filter
      const matchesSearch = !searchQuery || 
        t.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.date.includes(searchQuery);
      
      // Store filter
      const matchesStore = selectedStore === 'all' || t.storeId === selectedStore;
      
      // Payment method filter
      const matchesPayment = selectedPaymentMethod === 'all' || (() => {
        const method = t.paymentMethod.toLowerCase();
        if (selectedPaymentMethod === 'gcash') {
          return method === 'gcash' || method.includes('gcash');
        }
        if (selectedPaymentMethod === 'paymaya') {
          return method === 'paymaya' || method.includes('paymaya') || method.includes('maya');
        }
        return false;
      })();

      return matchesTimeRange && matchesSearch && matchesStore && matchesPayment;
    });

    console.log('[TransactionSummary] Filtered Transactions:', filtered.length);
    console.log('[TransactionSummary] Sample Filtered:', filtered.slice(0, 2));

    // Group by store and calculate totals
    const storeMap = new Map<string, {
      storeId: string;
      store: string;
      orders: number;
      sales: number;
      status: 'Active' | 'Rejected';
      latestDate: string;
      paymentMethods: Set<string>;
    }>();

    filtered.forEach(t => {
      const key = t.storeId;
      if (storeMap.has(key)) {
        const existing = storeMap.get(key)!;
        existing.orders += 1; // Count each transaction as 1 order
        existing.sales += t.sales;
        // Update status - if any transaction is Active, mark as Active
        if (t.status === 'Active') existing.status = 'Active';
        // Keep the latest date
        if (t.date > existing.latestDate) existing.latestDate = t.date;
        // Track payment methods
        existing.paymentMethods.add(t.paymentMethod);
      } else {
        storeMap.set(key, {
          storeId: t.storeId,
          store: t.store,
          orders: 1,
          sales: t.sales,
          status: t.status,
          latestDate: t.date,
          paymentMethods: new Set([t.paymentMethod])
        });
      }
    });

    // Convert to array and sort by latest date
    return Array.from(storeMap.values())
      .sort((a, b) => b.latestDate.localeCompare(a.latestDate));
  }, [transactions, searchQuery, selectedStore, selectedPaymentMethod, timeRange]);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm"
      style={{
        width: '100%',
        minHeight: '400px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 1) 38%)',
        padding: '20px 24px'
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '1.2em',
            color: '#1E1E1E',
            margin: 0
          }}
        >
          Transaction Summary
        </h3>
        <p
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '1.4em',
            color: 'rgba(30, 30, 30, 0.5)',
            margin: 0,
            marginTop: '4px'
          }}
        >
          Details transaction record
        </p>
      </div>

      {/* Search and Filter Section - TransactionManagement Design */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', marginBottom: '24px' }}>
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
            placeholder="Search by store name, date, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Store Filter Dropdown with Label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(30, 30, 30, 0.6)',
              marginLeft: '4px'
            }}
          >
            Store
          </label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: '#FFFFFF',
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1E1E1E',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '180px'
            }}
          >
            <option value="all">All Stores</option>
            {uniqueStores.map(store => (
              <option key={store.id} value={store.id}>{store.name}</option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter Dropdown with Label */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(30, 30, 30, 0.6)',
              marginLeft: '4px'
            }}
          >
            Payment Methods
          </label>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              backgroundColor: '#FFFFFF',
              fontFamily: 'Clash Grotesk Variable',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1E1E1E',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '180px'
            }}
          >
            <option value="all">All Methods</option>
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
          </select>
        </div>
      </div>

      {/* Table - Using TransactionManagement Design Structure */}
      <div className="overflow-x-auto">
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
                Orders
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
                Sales
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
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
                </td>
              </tr>
            ) : groupedStoreData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                </td>
              </tr>
            ) : (
              groupedStoreData.slice(0, 10).map((storeData, index) => (
                <tr
                  key={storeData.storeId}
                  style={{
                    borderBottom: index < Math.min(groupedStoreData.length, 10) - 1 ? '1px solid #E2E8F0' : 'none',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Date */}
                  <td style={{ padding: '20px' }}>
                    <p style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#1E1E1E',
                      margin: 0
                    }}>
                      {storeData.latestDate}
                    </p>
                  </td>

                  {/* Store */}
                  <td style={{ padding: '20px' }}>
                    <p style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#1E1E1E',
                      margin: 0
                    }}>
                      {storeData.store}
                    </p>
                  </td>

                  {/* Status */}
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
                      backgroundColor: storeData.status === 'Active' ? '#22C55E' : '#EF4444',
                      color: '#FFFFFF'
                    }}>
                      {storeData.status === 'Active' ? 'PAID' : 'PENDING'}
                    </span>
                  </td>

                  {/* Orders - Total count */}
                  <td style={{ padding: '20px' }}>
                    <p style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#1E1E1E',
                      margin: 0
                    }}>
                      {storeData.orders}
                    </p>
                  </td>

                  {/* Sales - Total amount */}
                  <td style={{ padding: '20px' }}>
                    <p style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#1E1E1E',
                      margin: 0
                    }}>
                      ₱{storeData.sales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </td>

                  {/* Payment Method */}
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Array.from(storeData.paymentMethods).map(method => {
                        // Format payment method display
                        let displayText = 'GCash';
                        let bgColor = '#1E88E5';
                        
                        if (method === 'paymaya' || method.includes('maya')) {
                          displayText = 'PayMaya';
                          bgColor = '#00A650';
                        } else if (method === 'gcash' || method.includes('gcash')) {
                          displayText = 'GCash';
                          bgColor = '#1E88E5';
                        }
                        
                        return (
                          <span
                            key={method}
                            style={{
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
                              backgroundColor: bgColor,
                              color: '#FFFFFF'
                            }}
                          >
                            {displayText}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
