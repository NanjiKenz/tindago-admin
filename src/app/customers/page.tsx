/**
 * TindaGo Admin Customers Page - Pixel Perfect Figma Implementation
 *
 * Customer management page (1440x1024) with sidebar, header, and customer management interface
 * Exact positioning and styling following dashboard pattern
 * Figma Design: https://www.figma.com/design/8I1Nr3vQZllDDknSevstvH/TindaGo-Share?node-id=281-367
 */

'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CustomerManagement } from '@/components/admin/CustomerManagement';

const CustomersPage: React.FC = () => {
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
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="customers" />

      {/* Main Customer Container */}
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
          className="absolute w-full"
          style={{
            left: '0px',
            top: '80px',
            minHeight: '944px'
          }}
        >
          <CustomerManagement />
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

export default CustomersPage;