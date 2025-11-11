/**
 * TindaGo Report & Analytics Page - Pixel Perfect Figma Implementation
 *
 * Report & Analytic dashboard with commission charts and transaction summary
 * Exact positioning and styling from Figma design: 1337-3735
 */

'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CommissionOverTime } from '@/components/admin/CommissionOverTime';
import { TopStoresByRevenue } from '@/components/admin/TopStoresByRevenue';
import { TransactionSummary } from '@/components/admin/TransactionSummary';

const AnalyticsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 7 days');

  return (
    <div
      className="min-h-screen relative overflow-hidden lg:overflow-visible"
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        margin: '0 auto'
      }}
    >
      {/* Sidebar - 273px wide, positioned at x:0, y:0 */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="analytics" />

      {/* Main Dashboard Container */}
      <div
        className="absolute lg:left-[273px] left-0 lg:w-[1167px] w-full"
        style={{
          top: '0px',
          minHeight: '1024px'
        }}
      >
        {/* Top Header - Full width, positioned at x:0, y:0 (relative to main container) */}
        <div
          className="absolute w-full"
          style={{
            left: '0px',
            top: '0px',
            height: '80px',
            zIndex: 10
          }}
        >
          <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Main Content Area - Below header */}
        <div
          className="absolute w-full lg:px-5 px-4"
          style={{
            left: '0px',
            top: '80px',
            minHeight: '944px',
            paddingTop: '40px'
          }}
        >
          {/* Page Title Section - Standardized positioning */}
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '0px',
              width: 'calc(100% - 70px)',
              height: 'auto',
              marginBottom: '40px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
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
                  Report & Analytic
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
                  Comprehensive insights and data visualization for your TindaGo marketplace performance.
                </p>
              </div>

              {/* Top Right Controls */}
              <div className="flex items-center gap-4">
                {/* Time Range Dropdown */}
                <div className="relative">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="appearance-none bg-white rounded-lg px-4 py-2.5 pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '13px',
                      color: '#1E1E1E',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      minWidth: '140px'
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

                {/* Generate Report Button */}
                <button
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all hover:shadow-lg"
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '13px',
                    backgroundColor: '#0077BE',
                    color: '#FFFFFF',
                    border: 'none'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M11.3333 5.33333L8 2M8 2L4.66667 5.33333M8 2V10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Charts Grid - Exact Figma positioning */}
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '150px',
              width: '1095px'
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Commission Over Time Chart */}
              <div>
                <CommissionOverTime />
              </div>

              {/* Top Stores by Revenue Chart */}
              <div>
                <TopStoresByRevenue />
              </div>
            </div>

            {/* Transaction Summary Table */}
            <div style={{ marginTop: '24px' }}>
              <TransactionSummary />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AnalyticsPage;
