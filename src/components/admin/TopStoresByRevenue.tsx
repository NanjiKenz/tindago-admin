/**
 * Top 5 Stores by Revenue Component - Pixel Perfect Figma Implementation
 *
 * Horizontal bar chart showing best performing stores this month
 * Exact positioning and styling from Figma design
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface StoreData {
  name: string;
  revenue: number;
  gradient: string;
}

export const TopStoresByRevenue: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 days');
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
    // Determine date cutoff based on selected time range
    const now = new Date();
    const cutoffDate = new Date();
    switch (timeRange) {
      case 'Last 7 days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'Last 14 days':
        cutoffDate.setDate(now.getDate() - 14);
        break;
      case 'Last 30 days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case 'Last 90 days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 7);
    }

    // Filter transactions by time range and status (PAID/SETTLED only)
    const filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.createdAt);
      const isPaid = t.status === 'PAID' || t.status === 'SETTLED';
      return isPaid && txDate >= cutoffDate;
    });

    // Calculate revenue per store (same logic as Sales table)
    const storeRevenueMap = new Map<string, { name: string; revenue: number; orderCount: number }>();
    filteredTransactions.forEach(t => {
      const storeId = t.storeId;
      const storeName = t.storeName || 'Unknown Store';
      const revenue = Number(t.amount || 0);

      if (storeRevenueMap.has(storeId)) {
        const existing = storeRevenueMap.get(storeId)!;
        existing.revenue += revenue;
        existing.orderCount += 1;
      } else {
        storeRevenueMap.set(storeId, { name: storeName, revenue, orderCount: 1 });
      }
    });

    // Debug: Log revenue calculation
    console.log('=== TOP 5 STORES REVENUE CALCULATION ===');
    storeRevenueMap.forEach((data, storeId) => {
      console.log(`${data.name}: ${data.orderCount} orders = ₱${data.revenue.toFixed(2)}`);
    });

    // Convert to array and sort by revenue (highest first)
    const sortedStores = Array.from(storeRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
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
      revenue: store.revenue,
      gradient: gradients[index % gradients.length]
    }));
  }, [transactions, timeRange]);

  const maxRevenue = storesData.length > 0 ? Math.max(...storesData.map(s => s.revenue)) : 1;

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

  const { roundedMax: yAxisMax, labels: yAxisLabels } = getYAxisScale(maxRevenue);
  
  // Safety check - ensure yAxisMax is valid
  const safeYAxisMax = yAxisMax > 0 ? yAxisMax : maxRevenue > 0 ? maxRevenue : 1;
  
  // Debug log
  console.log('Top 5 Stores Revenue Data:', storesData);
  console.log('Max Revenue:', maxRevenue);
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
            Top 5 Stores by Revenue
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
            Best performing stores this month
          </p>
        </div>

        {/* Time Range Dropdown */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none bg-white rounded-lg px-4 py-2 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '12px',
              color: '#1E1E1E',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              minWidth: '120px'
            }}
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 14 days">Last 14 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
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
            No store revenue data available for this time range
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
                  // Calculate height based on Y-axis scale (not maxRevenue)
                  const heightPercentage = (store.revenue / safeYAxisMax) * 100;
                  console.log(`Store: ${store.name}, Revenue: ${store.revenue}, Y-Axis Max: ${safeYAxisMax}, Height: ${heightPercentage}%`);

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
                          ₱{store.revenue.toLocaleString()}
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
