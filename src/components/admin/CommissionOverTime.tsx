/**
 * Commission Over Time Component - Pixel Perfect Figma Implementation
 *
 * Bar chart showing daily revenue performance with gradient bars
 * Exact positioning and styling from Figma design
 */

'use client';

import React, { useState } from 'react';

export const CommissionOverTime: React.FC = () => {
  const [timeRange, setTimeRange] = useState('Last 7 days');

  // Sample data for the bar chart (7 days)
  const chartData = [
    { day: 'Mon', value: 350, amount: '₱350' },
    { day: 'Tue', value: 200, amount: '₱200' },
    { day: 'Wed', value: 280, amount: '₱280' },
    { day: 'Thu', value: 250, amount: '₱250' },
    { day: 'Fri', value: 420, amount: '₱420' },
    { day: 'Sat', value: 300, amount: '₱300' },
    { day: 'Sun', value: 500, amount: '₱500' }
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

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

      {/* Chart Area */}
      <div className="relative" style={{ height: '152px', marginTop: '20px' }}>
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
          {['₱500', '₱250', '₱0'].map((label, index) => (
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
      </div>
    </div>
  );
};
