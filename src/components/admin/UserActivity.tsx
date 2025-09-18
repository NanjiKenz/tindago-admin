/**
 * User Activity Component - Pixel Perfect Figma Implementation
 *
 * User engagement metrics display (447x280) for analytics dashboard
 * Shows real-time activity stats and user behavior patterns
 */

'use client';

import React from 'react';

interface ActivityMetric {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  description: string;
}

export const UserActivity: React.FC = () => {
  const activityMetrics: ActivityMetric[] = [
    {
      label: 'Active Users',
      value: '8,432',
      change: '+5.2%',
      changeType: 'positive',
      description: 'Currently online'
    },
    {
      label: 'Session Duration',
      value: '12m 34s',
      change: '+2.1%',
      changeType: 'positive',
      description: 'Average session time'
    },
    {
      label: 'Bounce Rate',
      value: '24.8%',
      change: '-1.3%',
      changeType: 'positive',
      description: 'Users leaving immediately'
    },
    {
      label: 'Page Views/Session',
      value: '4.2',
      change: '+8.5%',
      changeType: 'positive',
      description: 'Average pages per visit'
    }
  ];

  const recentActivities = [
    { user: 'Maria Santos', action: 'Placed order', time: '2 min ago', amount: '₱1,250' },
    { user: 'Juan Dela Cruz', action: 'Product review', time: '5 min ago', amount: null },
    { user: 'Ana Garcia', action: 'Store registration', time: '8 min ago', amount: null },
    { user: 'Carlos Reyes', action: 'Payment completed', time: '12 min ago', amount: '₱890' },
    { user: 'Lisa Tan', action: 'Added to cart', time: '15 min ago', amount: '₱650' }
  ];

  return (
    <div
      className="bg-white rounded-2xl"
      style={{
        width: '447px',
        height: '280px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '20px',
          width: '407px',
          height: '40px'
        }}
      >
        <h3
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '1.2em',
            color: '#1E1E1E',
            margin: 0
          }}
        >
          User Activity
        </h3>
        <p
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '1.2em',
            color: 'rgba(30, 30, 30, 0.6)',
            margin: 0,
            marginTop: '4px'
          }}
        >
          Real-time user engagement metrics
        </p>
      </div>

      {/* Activity Metrics Grid */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '70px',
          width: '407px',
          height: '80px'
        }}
      >
        <div className="grid grid-cols-2 gap-4 h-full">
          {activityMetrics.map((metric, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 700,
                    fontSize: '16px',
                    lineHeight: '1.1em',
                    color: '#1E1E1E'
                  }}
                >
                  {metric.value}
                </span>
                <div className="flex items-center gap-1">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path
                      d={metric.changeType === 'positive' ? 'M1 5L5 1L9 5' : 'M1 1L5 5L9 1'}
                      stroke={metric.changeType === 'positive' ? '#22C55E' : '#EF4444'}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '10px',
                      lineHeight: '1.2em',
                      color: metric.changeType === 'positive' ? '#22C55E' : '#EF4444'
                    }}
                  >
                    {metric.change}
                  </span>
                </div>
              </div>
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '1.2em',
                  color: '#1E1E1E',
                  marginTop: '2px'
                }}
              >
                {metric.label}
              </div>
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '1.2em',
                  color: 'rgba(30, 30, 30, 0.6)',
                  marginTop: '1px'
                }}
              >
                {metric.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '160px',
          width: '407px',
          height: '100px'
        }}
      >
        <div
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '14px',
            lineHeight: '1.2em',
            color: '#1E1E1E',
            marginBottom: '8px'
          }}
        >
          Recent Activities
        </div>

        <div className="space-y-2">
          {recentActivities.slice(0, 3).map((activity, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: index === 0 ? '#22C55E' : index === 1 ? '#3B82F6' : '#F59E0B'
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '1.2em',
                      color: '#1E1E1E'
                    }}
                  >
                    {activity.user}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '11px',
                      lineHeight: '1.2em',
                      color: 'rgba(30, 30, 30, 0.6)'
                    }}
                  >
                    {activity.action}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activity.amount && (
                  <span
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '11px',
                      lineHeight: '1.2em',
                      color: '#3B82F6'
                    }}
                  >
                    {activity.amount}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '10px',
                    lineHeight: '1.2em',
                    color: 'rgba(30, 30, 30, 0.5)'
                  }}
                >
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live indicator */}
      <div
        className="absolute"
        style={{
          right: '20px',
          top: '20px'
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: '#22C55E' }}
          />
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '1.2em',
              color: '#22C55E'
            }}
          >
            Live
          </span>
        </div>
      </div>
    </div>
  );
};