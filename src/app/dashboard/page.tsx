/**
 * TindaGo Admin Dashboard Page - Pixel Perfect Figma Implementation
 *
 * Main dashboard (1440x1024) with sidebar, header, stats, charts, and quick actions
 * Exact positioning and styling from Figma design: 281:115
 */

'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsCards } from '@/components/admin/StatsCards';
import { SalesAnalytics } from '@/components/admin/SalesAnalytics';
import { SalesTarget } from '@/components/admin/SalesTarget';
import { QuickActions } from '@/components/admin/QuickActions';

const DashboardPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="relative"
      style={{
        width: '1440px',
        height: '1024px',
        backgroundColor: '#F3F5F9'
      }}
    >
      {/* Sidebar - 273px wide, positioned at x:0, y:0 */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Header - 1167px wide, positioned at x:273, y:0 */}
      <div
        className="absolute"
        style={{
          left: '273px',
          top: '0px',
          width: '1167px',
          height: '80px'
        }}
      >
        <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      </div>

      {/* Main Content Area */}
      <div
        className="absolute"
        style={{
          left: '273px',
          top: '80px',
          width: '1167px',
          height: '944px'
        }}
      >
        {/* Page Title Section - Positioned at x:293, y:120 */}
        <div
          className="absolute"
          style={{
            left: '20px', // Relative to main content area
            top: '40px',
            width: '443px',
            height: '79px'
          }}
        >
          <h1
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '48px',
              lineHeight: '1.23em',
              color: '#1E1E1E',
              marginBottom: '10px'
            }}
          >
            Dashboard
          </h1>
          <p
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            Welcome back! Here's what's happening with your TindaGo today.
          </p>
        </div>

        {/* Stats Cards - Positioned at x:308-1133, y:211 */}
        <div
          className="absolute"
          style={{
            left: '35px',
            top: '131px',
            width: '1095px',
            height: '150px'
          }}
        >
          <StatsCards />
        </div>

        {/* Sales Analytics Chart - Positioned at x:313, y:381 */}
        <div
          className="absolute"
          style={{
            left: '40px',
            top: '301px',
            width: '620px',
            height: '300px'
          }}
        >
          <SalesAnalytics />
        </div>

        {/* Sales Target - Positioned at x:953, y:381 */}
        <div
          className="absolute"
          style={{
            left: '680px',
            top: '301px',
            width: '447px',
            height: '300px'
          }}
        >
          <SalesTarget />
        </div>

        {/* Quick Actions - Positioned at x:313, y:701 */}
        <div
          className="absolute"
          style={{
            left: '40px',
            top: '621px',
            width: '1087px',
            height: '303px'
          }}
        >
          <QuickActions />
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

export default DashboardPage;