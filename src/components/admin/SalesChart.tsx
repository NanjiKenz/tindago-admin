/**
 * Sales Chart Component - Pixel Perfect Figma Implementation
 *
 * Sales trend line chart (620x320) for analytics dashboard
 * Line chart showing sales performance over time with data points
 */

'use client';

import React from 'react';

export const SalesChart: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Sample data points for sales trend (percentage of max height)
  const dataPoints = [
    { month: 'Jan', value: 45, sales: '₱125K' },
    { month: 'Feb', value: 35, sales: '₱98K' },
    { month: 'Mar', value: 65, sales: '₱178K' },
    { month: 'Apr', value: 55, sales: '₱152K' },
    { month: 'May', value: 80, sales: '₱215K' },
    { month: 'Jun', value: 70, sales: '₱189K' },
    { month: 'Jul', value: 90, sales: '₱245K' },
    { month: 'Aug', value: 85, sales: '₱232K' },
    { month: 'Sep', value: 95, sales: '₱260K' },
    { month: 'Oct', value: 75, sales: '₱198K' },
    { month: 'Nov', value: 85, sales: '₱228K' },
    { month: 'Dec', value: 88, sales: '₱235K' }
  ];

  // Generate SVG path for the line chart
  const createPath = () => {
    const chartWidth = 520;
    const chartHeight = 160;
    const stepX = chartWidth / (dataPoints.length - 1);

    let path = '';
    dataPoints.forEach((point, index) => {
      const x = index * stepX;
      const y = chartHeight - (point.value / 100) * chartHeight;

      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  return (
    <div
      className="bg-white rounded-2xl"
      style={{
        width: '620px',
        height: '320px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}
    >
      {/* Chart Header */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '20px',
          width: '580px',
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
          Sales Performance
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
          Monthly sales trend analysis
        </p>
      </div>

      {/* Chart Area */}
      <div
        className="absolute"
        style={{
          left: '50px',
          top: '80px',
          width: '520px',
          height: '160px'
        }}
      >
        <svg
          width="520"
          height="160"
          viewBox="0 0 520 160"
          className="absolute"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((percent, index) => (
            <line
              key={index}
              x1="0"
              y1={160 - (percent / 100) * 160}
              x2="520"
              y2={160 - (percent / 100) * 160}
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="1"
              strokeDasharray={percent === 0 ? "none" : "2,2"}
            />
          ))}

          {/* Line chart path */}
          <path
            d={createPath()}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const chartWidth = 520;
            const chartHeight = 160;
            const stepX = chartWidth / (dataPoints.length - 1);
            const x = index * stepX;
            const y = chartHeight - (point.value / 100) * chartHeight;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="5"
                fill="#3B82F6"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            );
          })}

          {/* Area fill under the line */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${createPath()} L 520 160 L 0 160 Z`}
            fill="url(#areaGradient)"
          />
        </svg>
      </div>

      {/* Y-axis labels */}
      <div
        className="absolute"
        style={{
          left: '10px',
          top: '80px',
          width: '35px',
          height: '160px'
        }}
      >
        {['₱300K', '₱225K', '₱150K', '₱75K', '₱0'].map((label, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: `${index * 40}px`,
              width: '35px',
              height: '12px',
              textAlign: 'right',
              paddingRight: '5px'
            }}
          >
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '10px',
                lineHeight: '1.2em',
                color: 'rgba(30, 30, 30, 0.6)'
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div
        className="absolute"
        style={{
          left: '50px',
          bottom: '20px',
          width: '520px',
          height: '20px'
        }}
      >
        {months.map((month, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${(index * 520) / (months.length - 1) - 15}px`,
              width: '30px',
              height: '12px',
              textAlign: 'center'
            }}
          >
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '10px',
                lineHeight: '1.2em',
                color: 'rgba(30, 30, 30, 0.6)'
              }}
            >
              {month}
            </span>
          </div>
        ))}
      </div>

      {/* Current value indicator */}
      <div
        className="absolute"
        style={{
          right: '20px',
          top: '20px',
          textAlign: 'right'
        }}
      >
        <div
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 700,
            fontSize: '24px',
            lineHeight: '1.1em',
            color: '#3B82F6'
          }}
        >
          ₱235K
        </div>
        <div
          className="flex items-center justify-end"
          style={{
            marginTop: '4px',
            gap: '4px'
          }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 7L6 2L11 7"
              stroke="#22C55E"
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
              color: '#22C55E'
            }}
          >
            +12%
          </span>
        </div>
      </div>
    </div>
  );
};