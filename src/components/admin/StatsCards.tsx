/**
 * Stats Cards Component - Pixel Perfect Figma Implementation
 *
 * 4 stat cards: Total Customer, Active Store, Total Sales, Monthly Revenue
 * Positioned at x:308-1133, y:211 with exact dimensions from Figma: 281:174-281:225
 */

'use client';

import React from 'react';
import Image from 'next/image';

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
  const stats: StatCard[] = [
    {
      title: 'Total Customer',
      subtitle: 'This month',
      value: '₱82,670',
      change: '11%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/customer-card-icon.png',
      iconBgColor: '#A855F7', // Purple
      position: { x: 308, y: 211 }
    },
    {
      title: 'Active Store',
      subtitle: 'This month',
      value: '2,670',
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
        width: '1095px', // Total width from first card x:308 to last card end
        height: '150px',
        marginLeft: '35px', // Adjusted for container alignment
        marginTop: '12px'
      }}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-2xl shadow-sm"
          style={{
            left: `${index * 275}px`, // 275px spacing between cards (270px width + 5px gap)
            top: '0px',
            width: '270px',
            height: '150px',
            padding: '10px'
          }}
        >
          {/* Card Content */}
          <div className="relative w-full h-full">
            {/* Icon in top right */}
            <div
              className="absolute rounded-2xl flex items-center justify-center shadow-sm"
              style={{
                right: '30px',
                top: '25px',
                width: '30px',
                height: '30px',
                backgroundColor: stat.iconBgColor,
                padding: '5px'
              }}
            >
              <Image
                src={stat.iconSrc}
                alt={stat.title}
                width={20}
                height={20}
                className="object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            {/* Title and Subtitle */}
            <div
              className="absolute"
              style={{
                left: '30px',
                top: '25px',
                width: '111px'
              }}
            >
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '1.23em',
                  color: '#1E1E1E',
                  marginBottom: '2px'
                }}
              >
                {stat.title}
              </p>
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '12px',
                  lineHeight: '1.23em',
                  color: 'rgba(30, 30, 30, 0.5)'
                }}
              >
                {stat.subtitle}
              </p>
            </div>

            {/* Value */}
            <div
              className="absolute"
              style={{
                left: '20px',
                bottom: '50px',
                padding: '10px'
              }}
            >
              <p
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 600,
                  fontSize: '32px',
                  lineHeight: '1.23em',
                  color: '#1E1E1E'
                }}
              >
                {stat.value}
              </p>
            </div>

            {/* Change Indicator */}
            <div
              className="absolute flex items-center"
              style={{
                right: '30px',
                bottom: '25px'
              }}
            >
              {/* Arrow Icon */}
              <svg
                width="11.39"
                height="8"
                viewBox="0 0 12 8"
                style={{
                  marginRight: '5px'
                }}
              >
                <path
                  d="M1 7L6 2L11 7"
                  stroke={stat.changeType === 'positive' ? '#4DB95B' : '#D32B47'}
                  strokeWidth="1"
                  fill="none"
                />
              </svg>

              <span
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '1.23em',
                  color: stat.changeType === 'positive' ? '#4DB95B' : '#D32B47'
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