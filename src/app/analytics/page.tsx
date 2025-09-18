/**
 * TindaGo Report & Analytics Page - Pixel Perfect Figma Implementation
 *
 * Analytics dashboard (1440x1024) with charts, metrics, and data visualization
 * Exact positioning and styling from Figma design: 281:303
 */

'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ReportHeader } from '@/components/admin/ReportHeader';
import { AnalyticsStatsCards } from '@/components/admin/AnalyticsStatsCards';
import { SalesChart } from '@/components/admin/SalesChart';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { TopProducts } from '@/components/admin/TopProducts';
import { UserActivity } from '@/components/admin/UserActivity';

const AnalyticsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen relative overflow-hidden lg:overflow-visible"
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        margin: '0 auto' // Center on larger screens
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
          {/* Report Header Section - Exact Figma positioning */}
          <div
            className="absolute"
            style={{
              left: '20px',
              top: '40px',
              width: '1100px',
              height: '79px'
            }}
          >
            <ReportHeader />
          </div>

          {/* Analytics Stats Cards - Exact Figma positioning */}
          <div
            className="absolute"
            style={{
              left: '35px',
              top: '131px',
              width: '1095px',
              height: '150px'
            }}
          >
            <AnalyticsStatsCards />
          </div>

          {/* Sales Chart - Left column */}
          <div
            className="absolute"
            style={{
              left: '40px',
              top: '301px',
              width: '620px',
              height: '320px'
            }}
          >
            <SalesChart />
          </div>

          {/* Revenue Chart - Right column */}
          <div
            className="absolute"
            style={{
              left: '680px',
              top: '301px',
              width: '447px',
              height: '320px'
            }}
          >
            <RevenueChart />
          </div>

          {/* Top Products Table - Left column */}
          <div
            className="absolute"
            style={{
              left: '40px',
              top: '641px',
              width: '620px',
              height: '280px'
            }}
          >
            <TopProducts />
          </div>

          {/* User Activity - Right column */}
          <div
            className="absolute"
            style={{
              left: '680px',
              top: '641px',
              width: '447px',
              height: '280px'
            }}
          >
            <UserActivity />
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