/**
 * TindaGo Admin Purchase Orders Page - Pixel Perfect Implementation
 *
 * Purchase order management page (1440x1024) with sidebar, header, and purchase order management interface
 * Exact positioning and styling following dashboard pattern
 * Matches design from Transaction Management and Store Management pages
 */

'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import PurchaseOrderManagement from '@/components/admin/PurchaseOrderManagement';

const PurchaseOrdersPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Sidebar - 273px wide */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="purchase-orders" />

      {/* Main Container */}
      <div
        className="absolute lg:left-[273px] left-0 lg:w-[1167px] w-full"
        style={{
          top: '0px',
          minHeight: '1024px'
        }}
      >
        {/* Top Header */}
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
          {/* Info banner */}
          <div className="mx-4 my-4 rounded-xl border border-blue-300 bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              Purchase Orders are B2B transactions where store owners buy inventory from suppliers.{' '}
              <span className="font-medium">No platform commission</span> is deducted from these transactions.{' '}
              View <a href="/purchase-orders/analytics" className="underline">analytics</a> for detailed insights.
            </p>
          </div>
          <PurchaseOrderManagement />
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

export default PurchaseOrdersPage;
