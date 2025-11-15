/**
 * Store Management Page
 *
 * Next.js page for managing stores in TindaGo admin dashboard
 * Integrates StoreManagement component with admin dashboard layout
 */

'use client';

import { useState, Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StoreManagement } from '@/components/admin/StoreManagement';

export default function StoresPage() {
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
      {/* Sidebar - EXACT 273px wide */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="stores" />

      {/* Main Container - EXACT positioning */}
      <div
        className="absolute lg:left-[273px] left-0 lg:w-[1167px] w-full"
        style={{
          top: '0px',
          minHeight: '1024px'
        }}
      >
        {/* Header - EXACT 80px height */}
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

        {/* Content Area - Below header */}
        <div
          className="absolute w-full lg:px-5 px-4"
          style={{
            left: '0px',
            top: '80px',
            minHeight: '944px'
          }}
        >
          <Suspense fallback={<div style={{ padding: '20px', fontFamily: 'Clash Grotesk Variable', color: '#1E1E1E' }}>Loading store management...</div>}>
            <StoreManagement />
          </Suspense>
        </div>
      </div>
    </div>
  );
}