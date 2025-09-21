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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
          {/* Page Title Section - Exact Figma positioning */}
          <div
            className="absolute"
            style={{
              left: '20px',
              top: '40px',
              width: '600px',
              height: '79px'
            }}
          >
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
              Dashboard
            </h1>
            <p
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '1.2em',
                color: 'rgba(30, 30, 30, 0.6)',
                margin: 0
              }}
            >
              Welcome back! Here&apos;s what&apos;s happening with your TindaGo today.
            </p>
          </div>

          {/* Stats Cards - Exact Figma positioning */}
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

          {/* Sales Analytics Chart - Exact Figma positioning */}
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

          {/* Sales Target - Exact Figma positioning */}
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

          {/* Quick Actions - Exact Figma positioning */}
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