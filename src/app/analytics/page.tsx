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
import { TopStoresByRevenue } from '@/components/admin/TopStoresByRevenue';
import { TransactionSummary } from '@/components/admin/TransactionSummary';

const AnalyticsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Default to current month
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const [timeRange, setTimeRange] = useState(currentMonth);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Generate CSV report
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      
      // Fetch transactions data
      const response = await fetch('/api/admin/transactions');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      const transactions = data.transactions || [];

      // Filter by time range (month name)
      // Parse the selected month (e.g., "January") - assume current year
      const monthIndex = new Date(Date.parse(timeRange + ' 1, 2025')).getMonth();
      const year = new Date().getFullYear();
      
      // Filter transactions for the selected month
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      const filteredTransactions = transactions.filter((t: any) => {
        const txDate = new Date(t.createdAt);
        return txDate >= startDate && txDate <= endDate;
      });

      // Helper to escape CSV values
      const escapeCSV = (value: string | undefined | null): string => {
        if (!value) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      };

      // Helper to format date safely - use apostrophe prefix to force text in Excel
      const formatDate = (dateStr: string | undefined): string => {
        if (!dateStr) {
          console.log('Date is empty/undefined');
          return "'N/A";
        }
        try {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            console.log('Invalid date:', dateStr);
            return "'Invalid";
          }
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          // Apostrophe prefix forces Excel to treat as text
          return `'${year}-${month}-${day}`;
        } catch (e) {
          console.log('Error formatting date:', dateStr, e);
          return "'Error";
        }
      };

      // Prepare CSV data with BOM
      const headers = ['Invoice ID', 'Store Name', 'Amount', 'Commission', 'Store Amount', 'Payment Method', 'Status', 'Date'];
      const csvRows = [
        '\uFEFF' + headers.join(','),
        ...filteredTransactions.map((t: any) => [
          escapeCSV(t.invoiceId),
          escapeCSV(t.storeName),
          (t.amount || 0).toFixed(2),
          (t.commission || 0).toFixed(2),
          (t.storeAmount || 0).toFixed(2),
          escapeCSV(t.method),
          escapeCSV(t.status),
          formatDate(t.createdAt)
        ].join(','))
      ];

      // Create and download CSV
      const csvContent = csvRows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `TindaGo_Report_${timeRange.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsGeneratingReport(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
      setIsGeneratingReport(false);
    }
  };

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
            minHeight: '944px'
          }}
        >
          {/* Page Title Section - Standardized positioning */}
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '40px',
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
            </div>
          </div>

          {/* Charts Grid - Exact Figma positioning */}
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '120px',
              width: '1095px'
            }}
          >
          {/* Filter Controls Bar */}
            <div className="flex items-center justify-end gap-5" style={{ marginBottom: '32px' }}>
              {/* Time Range Dropdown */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none cursor-pointer focus:outline-none"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    backgroundColor: '#FFFFFF',
                    fontFamily: 'Clash Grotesk Variable',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1E1E1E',
                    minWidth: '180px',
                    outline: 'none'
                  }}
                >
                  {/* Generate month options */}
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map((month, i) => (
                    <option key={i} value={month}>{month}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="#1E1E1E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Generate Report Button - Matches Management Pages Export CSV */}
              <button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1px solid #3BB77E',
                  backgroundColor: '#3BB77E',
                  color: '#FFFFFF',
                  cursor: isGeneratingReport ? 'not-allowed' : 'pointer',
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isGeneratingReport ? 0.6 : 1,
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isGeneratingReport) {
                    e.currentTarget.style.backgroundColor = '#2E9C66';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGeneratingReport) {
                    e.currentTarget.style.backgroundColor = '#3BB77E';
                  }
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                {isGeneratingReport ? 'Generating...' : 'Generate Report'}
              </button>
            </div>

            {/* Top Stores by Revenue Chart */}
            <div className="mb-6">
              <TopStoresByRevenue timeRange={timeRange} />
            </div>

            {/* Transaction Summary Table */}
            <div style={{ marginTop: '24px' }}>
              <TransactionSummary timeRange={timeRange} />
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
