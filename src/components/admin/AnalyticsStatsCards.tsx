/**
 * Analytics Stats Cards Component - Pixel Perfect Figma Implementation
 *
 * 4 analytics metric cards: Page Views, Conversion Rate, Avg Order Value, Return Rate
 * Positioned with exact dimensions and styling from Figma design
 */

'use client';

import React from 'react';

interface AnalyticsStatCard {
  title: string;
  subtitle: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  iconSrc: string;
  iconBgColor: string;
}

export const AnalyticsStatsCards: React.FC = () => {
  const stats: AnalyticsStatCard[] = [
    {
      title: 'Page Views',
      subtitle: 'This month',
      value: '342.8K',
      change: '18%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/analytics-views-icon.png',
      iconBgColor: '#6366F1', // Indigo
    },
    {
      title: 'Conversion Rate',
      subtitle: 'This month',
      value: '3.42%',
      change: '8%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/analytics-conversion-icon.png',
      iconBgColor: '#10B981', // Emerald
    },
    {
      title: 'Avg Order Value',
      subtitle: 'This month',
      value: '₱1,250',
      change: '5%',
      changeType: 'negative',
      iconSrc: '/images/admin-dashboard/analytics-order-icon.png',
      iconBgColor: '#F59E0B', // Amber
    },
    {
      title: 'Return Rate',
      subtitle: 'This month',
      value: '2.1%',
      change: '12%',
      changeType: 'positive',
      iconSrc: '/images/admin-dashboard/analytics-return-icon.png',
      iconBgColor: '#EF4444', // Red
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
              {/* Using placeholder analytics icons */}
              <div
                className="w-4 h-4 rounded-full bg-white opacity-80"
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