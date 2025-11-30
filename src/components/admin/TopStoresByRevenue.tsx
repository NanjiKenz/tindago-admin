/**
 * Top 5 Stores by Commission Component - Pixel Perfect Figma Implementation
 *
 * Horizontal bar chart showing stores generating highest platform commission this month
 * Exact positioning and styling from Figma design
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface StoreData {
  name: string;
  commission: number;
  gradient: string;
}

interface TopStoresByRevenueProps {
  timeRange?: string;
}

export const TopStoresByRevenue: React.FC<TopStoresByRevenueProps> = ({ timeRange = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }) }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transactions from API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/admin/transactions', { cache: 'no-store' });
        if (!res.ok) {
          const errorMsg = `Failed to fetch transactions: ${res.status}`;
          console.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }
        const data = await res.json();
        console.log('[TopStoresByRevenue] Loaded transactions:', data.transactions?.length || 0);
        setTransactions(data.transactions || []);
        setLoading(false);
      } catch (error) {
        const errorMsg = `Error loading transactions: ${error}`;
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Calculate stores data based on time range
  const storesData = useMemo(() => {
    // Parse the selected month and year (e.g., "January 2025")
    const dateObj = new Date(Date.parse(timeRange + ' 1'));
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    
    // Get start and end dates for the selected month
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    // Filter transactions by time range and status (PAID/SETTLED only)
    const filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.createdAt);
      const isPaid = t.status === 'PAID' || t.status === 'SETTLED';
      return isPaid && txDate >= startDate && txDate <= endDate;
    });

    // Calculate commission per store (1% platform fee)
    const storeCommissionMap = new Map<string, { name: string; commission: number; orderCount: number }>();
    filteredTransactions.forEach(t => {
      const storeId = t.storeId;
      const storeName = t.storeName || 'Unknown Store';
      const transactionAmount = Number(t.amount || 0);
      const commission = Number(t.commission || 0) || (transactionAmount * 0.01); // Use stored commission or calculate 1%

      if (storeCommissionMap.has(storeId)) {
        const existing = storeCommissionMap.get(storeId)!;
        existing.commission += commission;
        existing.orderCount += 1;
      } else {
        storeCommissionMap.set(storeId, { name: storeName, commission, orderCount: 1 });
      }
    });

    // Debug: Log commission calculation
    console.log('=== TOP 5 STORES COMMISSION CALCULATION ===');
    storeCommissionMap.forEach((data, storeId) => {
      console.log(`${data.name}: ${data.orderCount} orders = ₱${data.commission.toFixed(2)} commission`);
    });

    // Convert to array and sort by commission (highest first)
    const sortedStores = Array.from(storeCommissionMap.values())
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5); // Top 5 only

    // Assign gradients to stores - VERTICAL for vertical bars
    const gradients = [
      'linear-gradient(180deg, #3b82f6 0%, rgba(59, 130, 246, 0.3) 100%)', // Blue
      'linear-gradient(180deg, #4db95b 0%, rgba(77, 185, 91, 0.3) 100%)',    // Green
      'linear-gradient(180deg, #eab308 0%, rgba(234, 179, 8, 0.3) 100%)',   // Yellow
      'linear-gradient(180deg, #a855f7 0%, rgba(168, 85, 247, 0.3) 100%)',  // Purple
      'linear-gradient(180deg, #ef4343 0%, rgba(239, 67, 67, 0.3) 100%)'    // Red
    ];

    return sortedStores.map((store, index) => ({
      name: store.name,
      commission: store.commission,
      gradient: gradients[index % gradients.length]
    }));
  }, [transactions, timeRange]);

  const maxCommission = storesData.length > 0 ? Math.max(...storesData.map(s => s.commission)) : 1;

  // Calculate nice rounded Y-axis labels and scale
  const getYAxisScale = (max: number) => {
    if (max === 0) return { roundedMax: 0, labels: ['₱0', '₱0', '₱0', '₱0', '₱0'] };
    
    // Round max to a nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;
    let roundedMax = Math.ceil(normalized) * magnitude;
    
    // If the difference is too small, round up more
    if (roundedMax < max * 1.1) {
      roundedMax = Math.ceil(normalized * 1.2) * magnitude;
    }
    
    const labels = [
      `₱${Math.round(roundedMax).toLocaleString()}`,
      `₱${Math.round(roundedMax * 0.75).toLocaleString()}`,
      `₱${Math.round(roundedMax * 0.5).toLocaleString()}`,
      `₱${Math.round(roundedMax * 0.25).toLocaleString()}`,
      '₱0'
    ];
    
    return { roundedMax, labels };
  };

  const { roundedMax: yAxisMax, labels: yAxisLabels } = getYAxisScale(maxCommission);
  
  // Safety check - ensure yAxisMax is valid
  const safeYAxisMax = yAxisMax > 0 ? yAxisMax : maxCommission > 0 ? maxCommission : 1;
  
  // Debug log
  console.log('Top 5 Stores Commission Data:', storesData);
  console.log('Max Commission:', maxCommission);
  console.log('Y-Axis Max (Rounded):', yAxisMax);
  console.log('Safe Y-Axis Max:', safeYAxisMax);
  console.log('Y-Axis Labels:', yAxisLabels);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm"
      style={{
        width: '100%',
        height: '264px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 1) 38%)',
        position: 'relative',
        padding: '20px 24px'
      }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
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
            Top 5 Stores by Commission
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
            Stores generating highest platform commission
          </p>
        </div>

        {/* Time Range Display */}
        <div
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '12px',
            color: 'rgba(30, 30, 30, 0.6)',
            padding: '8px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderRadius: '8px'
          }}
        >
          {timeRange}
        </div>
      </div>

      {/* Vertical Bar Chart */}
      <div style={{ marginTop: '20px', paddingLeft: '50px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontFamily: 'Clash Grotesk Variable' }}>
            Loading store data...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#EF4444', fontFamily: 'Clash Grotesk Variable' }}>
            {error}
          </div>
        ) : storesData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B', fontFamily: 'Clash Grotesk Variable' }}>
            No commission data available for this time range
          </div>
        ) : (
          <>
            {/* Chart area with fixed height for accurate grid alignment */}
            <div className="relative" style={{ height: '120px' }}>
              {/* Y-axis grid lines */}
              <div className="absolute inset-0 pointer-events-none">
                {[0, 25, 50, 75, 100].map((percent) => (
                  <div
                    key={percent}
                    className="absolute w-full border-t border-gray-100"
                    style={{
                      bottom: `${percent}%`
                    }}
                  />
                ))}
              </div>

              {/* Y-axis labels */}
              <div className="absolute top-0 bottom-0 flex flex-col justify-between" style={{ left: '-50px', width: '40px' }}>
                {yAxisLabels.map((label, index) => (
                  <div
                    key={index}
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '10px',
                      color: 'rgba(30, 30, 30, 0.5)',
                      textAlign: 'right'
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Bars container - exactly matches grid height */}
              <div className="flex items-end justify-between gap-2 px-2" style={{ height: '100%' }}>
                {storesData.map((store, index) => {
                  // Calculate height based on Y-axis scale (not maxCommission)
                  const heightPercentage = (store.commission / safeYAxisMax) * 100;
                  console.log(`Store: ${store.name}, Commission: ${store.commission}, Y-Axis Max: ${safeYAxisMax}, Height: ${heightPercentage}%`);

                  return (
                    <div key={index} className="flex flex-col items-center justify-end group" style={{ flex: '1 1 0', minWidth: '0', height: '100%' }}>
                      {/* Bar */}
                      <div
                        className="rounded-t-lg relative transition-all duration-300 hover:opacity-90"
                        style={{
                          width: '100%',
                          height: `${heightPercentage}%`,
                          background: store.gradient
                        }}
                      >
                        {/* Tooltip on hover */}
                        <div
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontSize: '11px'
                          }}
                        >
                          ₱{store.commission.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Store Name Labels - separate from chart area */}
            <div className="flex items-start justify-between gap-2 px-2" style={{ marginTop: '8px' }}>
              {storesData.map((store, index) => (
                <div
                  key={index}
                  className="text-center"
                  style={{
                    flex: '1 1 0',
                    minWidth: '0',
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '11px',
                    color: 'rgba(30, 30, 30, 0.6)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={store.name}
                >
                  {store.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
