/**
 * Stats Cards Component - Pixel Perfect Figma Implementation
 *
 * 4 stat cards: Total Customer, Active Store, Total Sales, Monthly Revenue
 * Positioned at x:308-1133, y:211 with exact dimensions from Figma: 281:174-281:225
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { UserManagementService } from '@/lib/userManagementService';
import { StoreService } from '@/lib/storeService';

interface StatCard {
  title: string;
  subtitle: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  iconSrc: string;
  iconBgColor: string;
  position: { x: number; y: number };
}

export const StatsCards: React.FC = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [activeStores, setActiveStores] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load user stats
        await UserManagementService.getUserStats();
        const customers = await UserManagementService.getAllCustomerUsers();
        const customerCount = customers.filter(u => u.userType === 'customer').length;
        setTotalCustomers(customerCount);

        // Load store stats from API route (bypasses Firebase security rules)
        const storeStatsRes = await fetch('/api/admin/stores/stats', { cache: 'no-store' });
        if (!storeStatsRes.ok) {
          throw new Error('Failed to fetch store statistics');
        }
        const storeStats = await storeStatsRes.json();
        setActiveStores(storeStats.activeStores || 0);

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const stats: StatCard[] = [
    {
      title: 'Total Customer',
      subtitle: 'Registered users',
      value: loading ? 'Loading...' : totalCustomers.toLocaleString(),
      change: '11%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/customer-card-icon.png',
      iconBgColor: '#A855F7', // Purple
      position: { x: 308, y: 211 }
    },
    {
      title: 'Active Store',
      subtitle: 'Currently active',
      value: loading ? 'Loading...' : activeStores.toLocaleString(),
      change: '24%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/shop-card-icon.png',
      iconBgColor: '#22C55E', // Green
      position: { x: 583, y: 211 }
    },
    {
      title: 'Total Sales',
      subtitle: 'This month',
      value: '₱22,670',
      change: '15%',
      changeType: 'negative',
      iconSrc: '/images/admin-dashboard/sales-card-icon.png',
      iconBgColor: '#3B82F6', // Blue
      position: { x: 858, y: 211 }
    },
    {
      title: 'Montly Revenue',
      subtitle: 'This month',
      value: '₱42,670',
      change: '98%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/profit-card-icon.png',
      iconBgColor: '#EAB308', // Yellow
      position: { x: 1133, y: 211 }
    }
  ];

  return (
    <div
      className="relative"
      style={{
        width: '1095px',
        height: '150px'
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-2xl"
          style={{
            left: `${index * 275}px`, // Exact 275px spacing between cards
            top: '0px',
            width: '270px',
            height: '150px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Soft shadow matching Figma
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Card Content */}
          <div className="relative w-full h-full">
            {/* Icon in top right - Exact Figma positioning */}
            <div
              className="absolute rounded-xl flex items-center justify-center"
              style={{
                right: '20px',
                top: '20px',
                width: '32px',
                height: '32px',
                backgroundColor: stat.iconBgColor
              }}
            >
              <Image
                src={stat.iconSrc}
                alt={stat.title}
                width={16}
                height={16}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            {/* Title and Subtitle - Exact Figma positioning */}
            <div
              className="absolute"
              style={{
                left: '20px',
                top: '20px',
                width: '150px'
              }}
            >
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '1.2em',
                  color: '#1E1E1E',
                  marginBottom: '4px'
                }}
              >
                {stat.title}
              </p>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '1.2em',
                  color: 'rgba(30, 30, 30, 0.6)'
                }}
              >
                {stat.subtitle}
              </p>
            </div>

            {/* Value - Perfectly aligned to Figma */}
            <div
              className="absolute"
              style={{
                left: '20px',
                bottom: '20px'
              }}
            >
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 700,
                  fontSize: '28px',
                  lineHeight: '1.1em',
                  color: '#1E1E1E',
                  margin: 0
                }}
              >
                {stat.value}
              </p>
              {/* Spacer for alignment with cards that have revenue */}
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '12px',
                  color: 'transparent',
                  margin: 0,
                  marginTop: '4px',
                  userSelect: 'none'
                }}
              >
                &nbsp;
              </p>
            </div>

            {/* Change Indicator - Exact Figma positioning */}
            <div
              className="absolute flex items-center"
              style={{
                right: '20px',
                bottom: '20px',
                gap: '6px'
              }}
            >
              {/* Arrow Icon - Perfect SVG matching Figma */}
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d={stat.changeType === 'positive' ? 'M1 7L6 2L11 7' : 'M1 1L6 6L11 1'}
                  stroke={stat.changeType === 'positive' ? '#22C55E' : '#EF4444'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <span
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '1.2em',
                  color: stat.changeType === 'positive' ? '#22C55E' : '#EF4444'
                }}
              >
                {stat.change}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};