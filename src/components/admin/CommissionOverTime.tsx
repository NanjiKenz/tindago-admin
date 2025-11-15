/**
 * Commission Over Time Component - Pixel Perfect Figma Implementation
 *
 * Bar chart showing daily revenue performance with gradient bars
 * Exact positioning and styling from Figma design
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';

interface CommissionOverTimeProps {
  timeRange?: string;
}

export const CommissionOverTime: React.FC<CommissionOverTimeProps> = ({ timeRange = 'Last 7 days' }) => {
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
          throw new Error('Failed to fetch transactions');
        }
        const data = await res.json();
        console.log('[CommissionOverTime] Loaded transactions:', data.transactions?.length || 0);
        console.log('[CommissionOverTime] Sample transaction:', data.transactions?.[0]);
        setTransactions(data.transactions || []);
        setLoading(false);
      } catch (error) {
        console.error('[CommissionOverTime] Error:', error);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  // Calculate daily commission data based on time range
  const chartData = useMemo(() => {
    // Determine date range for filtering transactions
    const now = new Date();
    const cutoffDate = new Date();
    const days = parseInt(timeRange.split(' ')[1]) || 7;
    cutoffDate.setDate(now.getDate() - days);

    // Filter paid/settled transactions within selected time range
    const filteredTransactions = transactions.filter(t => {
      const txDate = new Date(t.createdAt);
      const isPaid = t.status === 'PAID' || t.status === 'SETTLED';
      return isPaid && txDate >= cutoffDate;
    });

    console.log('[CommissionOverTime] Time Range:', timeRange);
    console.log('[CommissionOverTime] Cutoff Date:', cutoffDate);
    console.log('[CommissionOverTime] Total transactions:', transactions.length);
    console.log('[CommissionOverTime] Filtered transactions:', filteredTransactions.length);
    console.log('[CommissionOverTime] All filtered transactions:', filteredTransactions.map(t => ({
      date: t.createdAt,
      commission: t.commission,
      status: t.status,
      store: t.storeName
    })));

    // Group by date and sum commissions
    const dailyCommissions = new Map<string, number>();
    console.log('[CommissionOverTime] Processing', filteredTransactions.length, 'filtered transactions');
    
    filteredTransactions.forEach((t, index) => {
      // Parse date properly
      const txDate = new Date(t.createdAt);
      // Use UTC date to avoid timezone issues
      const year = txDate.getFullYear();
      const month = String(txDate.getMonth() + 1).padStart(2, '0');
      const day = String(txDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const commission = Number(t.commission || 0);
      console.log(`[CommissionOverTime] Transaction ${index + 1}:`, t.createdAt, '→', dateStr, 'commission:', commission, 'store:', t.storeName);
      
      const currentTotal = dailyCommissions.get(dateStr) || 0;
      const newTotal = currentTotal + commission;
      dailyCommissions.set(dateStr, newTotal);
      console.log(`[CommissionOverTime] Date ${dateStr} total: ${currentTotal} + ${commission} = ${newTotal}`);
    });

    console.log('[CommissionOverTime] Daily commissions map:', Array.from(dailyCommissions.entries()));

    // Show 7 days (Sun-Sat) starting from the week with earliest transaction
    const result = [];
    const daysToShow = 7;
    
    // Find earliest transaction date to start the week from there
    let referenceDate = new Date();
    if (dailyCommissions.size > 0) {
      const dates = Array.from(dailyCommissions.keys()).sort(); // Sort dates ascending
      referenceDate = new Date(dates[0] + 'T12:00:00'); // Earliest date with commission data
    }
    
    // Get Sunday of the week containing the earliest transaction
    const currentDay = referenceDate.getDay();
    const chartStart = new Date(referenceDate);
    chartStart.setDate(referenceDate.getDate() - currentDay);
    chartStart.setHours(0, 0, 0, 0);
    
    console.log('[CommissionOverTime] Earliest data date:', referenceDate.toLocaleDateString('en-CA'));
    console.log('[CommissionOverTime] Showing week from (Sunday):', chartStart.toLocaleDateString('en-CA'));
    
    const chartEnd = new Date(chartStart);
    chartEnd.setDate(chartStart.getDate() + 6); // Saturday of the week
    console.log('[CommissionOverTime] Chart shows week from:', chartStart.toLocaleDateString('en-CA'), 'to', chartEnd.toLocaleDateString('en-CA'));
    console.log('[CommissionOverTime] Includes commission data from:', cutoffDate.toLocaleDateString('en-CA'));
    
    // Create days array
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(chartStart);
      date.setDate(chartStart.getDate() + i);
      
      // Format date consistently
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const value = dailyCommissions.get(dateStr) || 0;
      console.log('[CommissionOverTime] Chart day:', dayName, 'date:', dateStr, 'commission:', value, 'has data:', dailyCommissions.has(dateStr));
      
      // Extra debug for Saturday
      if (dayName === 'Sat') {
        console.log('[CommissionOverTime] Saturday debug - looking for:', dateStr);
        console.log('[CommissionOverTime] Available dates in map:', Array.from(dailyCommissions.keys()));
        console.log('[CommissionOverTime] Commission value:', dailyCommissions.get(dateStr));
      }
      
      result.push({
        day: dayName,
        date: dateStr,
        value: value,
        amount: `₱${value.toFixed(2)}`
      });
    }

    console.log('[CommissionOverTime] Final chart data:', result);
    return result;
  }, [transactions, timeRange]);

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value), 1) : 1;

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
            Commission Over Time
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
            Daily Revenue performance
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

      {/* Chart Area */}
      <div className="relative" style={{ height: '152px', marginTop: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', fontFamily: 'Clash Grotesk Variable' }}>
            Loading commission data...
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#EF4444', fontFamily: 'Clash Grotesk Variable' }}>
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B', fontFamily: 'Clash Grotesk Variable' }}>
            No commission data for this period
          </div>
        ) : (
          <>
        <div className="flex items-end justify-between h-full gap-3 px-2">
          {chartData.map((item, index) => {
            const heightPercentage = (item.value / maxValue) * 100;
            
            // Define gradient colors (yellow/gold theme matching Figma)
            const gradients = [
              { from: '#FFD166', to: '#FFA500' }, // Mon
              { from: '#FFD166', to: '#FFA500' }, // Tue
              { from: '#FFD166', to: '#FFA500' }, // Wed
              { from: '#FFD166', to: '#FFA500' }, // Thu
              { from: '#FFD166', to: '#FFA500' }, // Fri
              { from: '#FFD166', to: '#FFA500' }, // Sat
              { from: '#FFD166', to: '#FFA500' }  // Sun
            ];

            return (
              <div key={index} className="flex flex-col items-center flex-1 group">
                {/* Bar */}
                <div
                  className="w-full rounded-t-lg relative transition-all duration-300 hover:opacity-90"
                  style={{
                    height: `${heightPercentage}%`,
                    background: 'linear-gradient(180deg, rgba(234, 179, 8, 1) 0%, rgba(153, 112, 1, 0) 100%)',
                    minHeight: '20px'
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
                    {item.amount}
                  </div>
                </div>

                {/* Day Label */}
                <div
                  className="mt-2 text-center"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '11px',
                    color: 'rgba(30, 30, 30, 0.6)'
                  }}
                >
                  {item.day}
                </div>
              </div>
            );
          })}
        </div>

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
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between -ml-10">
          {[
            `₱${Math.round(maxValue).toLocaleString()}`,
            `₱${Math.round(maxValue * 0.5).toLocaleString()}`,
            '₱0'
          ].map((label, index) => (
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
        </>
        )}
      </div>
    </div>
  );
};
