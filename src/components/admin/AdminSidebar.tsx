/**
 * Admin Sidebar Component - Pixel Perfect Figma Implementation
 *
 * Sidebar (273px wide) with TindaGo logo, navigation menu, and manage dropdown
 * Exact positioning and styling from Figma design: 281:116
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}


export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, currentPage = 'dashboard' }) => {
  const [manageDropdownOpen, setManageDropdownOpen] = useState(true); // Default open as in Figma


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar - 273px wide as per Figma */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '273px', minHeight: '100vh' }}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* TindaGo Logo Section - Positioned as per Figma x:-48, y:-86 relative to parent */}
          <div className="relative" style={{ height: '235px' }}>
            <div
              className="absolute"
              style={{
                left: '-48px',
                top: '-86px',
                width: '321px',
                height: '321px'
              }}
            >
              <Image
                src="/images/admin-dashboard/tindago-logo.png"
                alt="TindaGo Logo"
                width={321}
                height={321}
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Navigation Menu - Starting at y:139 as per Figma */}
          <nav className="flex-1" style={{ paddingLeft: '27px', paddingRight: '27px' }}>
            <div className="space-y-0">
              {/* Dashboard */}
              <a
                href="/dashboard"
                className="w-full group flex items-center rounded-2xl transition-colors"
                style={{
                  width: '220px',
                  height: '40px',
                  padding: '0 20px 0 10px',
                  backgroundColor: currentPage === 'dashboard' ? '#0077BE' : 'transparent',
                  marginBottom: '20px'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div style={{ width: '25px', height: '25px' }}>
                    <Image
                      src="/images/admin-dashboard/dashboard-icon.png"
                      alt="Dashboard"
                      width={25}
                      height={25}
                      className="object-contain"
                      style={{ filter: currentPage === 'dashboard' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '1.23em',
                      color: currentPage === 'dashboard' ? '#FFFFFF' : '#1E1E1E'
                    }}
                  >
                    Dashboard
                  </span>
                </div>
              </a>

              {/* Report & Analytic */}
              <a
                href="/analytics"
                className="w-full group flex items-center rounded-2xl hover:bg-gray-50 transition-colors"
                style={{
                  width: '220px',
                  height: '40px',
                  padding: '0 20px 0 10px',
                  backgroundColor: currentPage === 'analytics' ? '#0077BE' : 'transparent',
                  marginBottom: '20px'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div style={{ width: '25px', height: '25px' }}>
                    <Image
                      src="/images/admin-dashboard/report-icon.png"
                      alt="Report & Analytic"
                      width={25}
                      height={25}
                      className="object-contain"
                      style={{ filter: currentPage === 'analytics' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '1.23em',
                      color: currentPage === 'analytics' ? '#FFFFFF' : '#1E1E1E'
                    }}
                  >
                    Report & Analytic
                  </span>
                </div>
              </a>

              {/* Manage Dropdown */}
              <div className="space-y-0">
                {/* Manage Dropdown Button */}
                <button
                  onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
                  className="w-full group flex items-center justify-between rounded-2xl transition-colors"
                  style={{
                    width: '220px',
                    height: '40px',
                    padding: '0 20px 0 10px'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div style={{ width: '25px', height: '25px' }}>
                      <Image
                        src="/images/admin-dashboard/management-icon.png"
                        alt="Manage"
                        width={25}
                        height={25}
                        className="object-contain"
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'Clash Grotesk Variable',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '1.23em',
                        color: '#1E1E1E'
                      }}
                    >
                      Manage
                    </span>
                  </div>
                  <div style={{ width: '25px', height: '25px' }}>
                    <Image
                      src="/images/admin-dashboard/expand-arrow.png"
                      alt="Expand"
                      width={25}
                      height={25}
                      className={`object-contain transform transition-transform ${
                        manageDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Children - Shown as per Figma */}
                {manageDropdownOpen && (
                  <div className="space-y-0">
                    {/* User Management */}
                    <a
                      href="/users"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'users' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <Image
                            src="/images/admin-dashboard/user-icon.png"
                            alt="User Management"
                            width={25}
                            height={25}
                            className="object-contain"
                            style={{ filter: currentPage === 'users' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'users' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          User Management
                        </span>
                      </div>
                    </a>

                    {/* Customer Management */}
                    <a
                      href="/customers"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'customers' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <Image
                            src="/images/admin-dashboard/customer-icon.png"
                            alt="Customer Management"
                            width={25}
                            height={25}
                            className="object-contain"
                            style={{ filter: currentPage === 'customers' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'customers' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Customer Management
                        </span>
                      </div>
                    </a>

                    {/* Admin Management */}
                    <a
                      href="/admins"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'admins' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <Image
                            src="/images/admin-dashboard/admin-icon.png"
                            alt="Admin Management"
                            width={25}
                            height={25}
                            className="object-contain"
                            style={{ filter: currentPage === 'admins' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'admins' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Admin Management
                        </span>
                      </div>
                    </a>

                    {/* Store Management */}
                    <a
                      href="/stores"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'stores' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <Image
                            src="/images/admin-dashboard/store-icon.png"
                            alt="Store Management"
                            width={25}
                            height={25}
                            className="object-contain"
                            style={{ filter: currentPage === 'stores' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'stores' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Store Management
                        </span>
                      </div>
                    </a>

                    {/* Content Management */}
                    <a
                      href="/content"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'content' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <Image
                            src="/images/admin-dashboard/content-icon.png"
                            alt="Content Management"
                            width={25}
                            height={25}
                            className="object-contain"
                            style={{ filter: currentPage === 'content' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'content' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Content Management
                        </span>
                      </div>
                    </a>

                    {/* Transactions */}
                    <a
                      href="/transactions"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'transactions' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: currentPage === 'transactions' ? '#FFFFFF' : '#1E1E1E' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                          </svg>
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'transactions' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Transactions
                        </span>
                      </div>
                    </a>

                    {/* Payouts */}
                    <a
                      href="/payouts"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'payouts' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: currentPage === 'payouts' ? '#FFFFFF' : '#1E1E1E' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'payouts' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Payouts
                        </span>
                      </div>
                    </a>

                    {/* Diagnostics */}
                    <a
                      href="/diagnostics"
                      className="w-full group flex items-center rounded-2xl transition-colors"
                      style={{
                        width: '220px',
                        height: '40px',
                        padding: '0 20px 0 10px',
                        backgroundColor: currentPage === 'diagnostics' ? '#0077BE' : 'transparent'
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '25px', height: '25px' }}>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: currentPage === 'diagnostics' ? '#FFFFFF' : '#1E1E1E' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
                          </svg>
                        </div>
                        <span
                          style={{
                            fontFamily: 'Clash Grotesk Variable',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '1.23em',
                            color: currentPage === 'diagnostics' ? '#FFFFFF' : '#1E1E1E'
                          }}
                        >
                          Diagnostics
                        </span>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </nav>

          {/* Mobile close button */}
          <div className="lg:hidden p-4">
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};