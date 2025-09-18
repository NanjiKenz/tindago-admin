/**
 * Revenue Chart Component - Pixel Perfect Figma Implementation
 *
 * Revenue breakdown donut chart (447x320) for analytics dashboard
 * Shows revenue distribution across different categories
 */

'use client';

import React from 'react';

export const RevenueChart: React.FC = () => {
  const revenueData = [
    { category: 'Product Sales', amount: '₱1.2M', percentage: 45, color: '#3B82F6' },
    { category: 'Service Revenue', amount: '₱680K', percentage: 25, color: '#10B981' },
    { category: 'Delivery Fees', amount: '₱480K', percentage: 18, color: '#F59E0B' },
    { category: 'Commission', amount: '₱320K', percentage: 12, color: '#EF4444' }
  ];

  // Calculate cumulative percentages for donut chart
  let cumulativePercentage = 0;
  const segments = revenueData.map(item => {
    const startAngle = cumulativePercentage * 3.6; // Convert percentage to degrees
    cumulativePercentage += item.percentage;
    const endAngle = cumulativePercentage * 3.6;

    return {
      ...item,
      startAngle,
      endAngle
    };
  });

  // SVG donut chart parameters
  const centerX = 100;
  const centerY = 100;
  const outerRadius = 80;
  const innerRadius = 50;

  // Function to create SVG path for donut segment
  const createPath = (startAngle: number, endAngle: number) => {
    const start = (startAngle - 90) * (Math.PI / 180);
    const end = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + outerRadius * Math.cos(start);
    const y1 = centerY + outerRadius * Math.sin(start);
    const x2 = centerX + outerRadius * Math.cos(end);
    const y2 = centerY + outerRadius * Math.sin(end);

    const x3 = centerX + innerRadius * Math.cos(end);
    const y3 = centerY + innerRadius * Math.sin(end);
    const x4 = centerX + innerRadius * Math.cos(start);
    const y4 = centerY + innerRadius * Math.sin(start);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  const totalRevenue = revenueData.reduce((sum, item) => {
    return sum + parseFloat(item.amount.replace('₱', '').replace('M', '000000').replace('K', '000'));
  }, 0);

  const formattedTotal = `₱${(totalRevenue / 1000000).toFixed(1)}M`;

  return (
    <div
      className="bg-white rounded-2xl"
      style={{
        width: '447px',
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
          Revenue Breakdown
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
          Revenue distribution by category
        </p>
      </div>

      {/* Donut Chart */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '70px',
          width: '200px',
          height: '200px'
        }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={createPath(segment.startAngle, segment.endAngle)}
              fill={segment.color}
              className="transition-all duration-200 hover:opacity-80"
            />
          ))}
        </svg>

        {/* Center value */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            width: '100px',
            height: '100px',
            left: '50px',
            top: '50px'
          }}
        >
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 700,
              fontSize: '18px',
              lineHeight: '1.1em',
              color: '#1E1E1E',
              textAlign: 'center'
            }}
          >
            {formattedTotal}
          </div>
          <div
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 400,
              fontSize: '10px',
              lineHeight: '1.2em',
              color: 'rgba(30, 30, 30, 0.6)',
              textAlign: 'center',
              marginTop: '2px'
            }}
          >
            Total Revenue
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        className="absolute"
        style={{
          right: '20px',
          top: '80px',
          width: '160px',
          height: '180px'
        }}
      >
        {revenueData.map((item, index) => (
          <div
            key={index}
            className="flex items-center"
            style={{
              marginBottom: '16px',
              gap: '8px'
            }}
          >
            {/* Color indicator */}
            <div
              className="rounded-full"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: item.color,
                flexShrink: 0
              }}
            />

            {/* Label and value */}
            <div className="flex-1">
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '1.2em',
                  color: '#1E1E1E'
                }}
              >
                {item.category}
              </div>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 700,
                    fontSize: '14px',
                    lineHeight: '1.1em',
                    color: item.color
                  }}
                >
                  {item.amount}
                </span>
                <span
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 400,
                    fontSize: '10px',
                    lineHeight: '1.2em',
                    color: 'rgba(30, 30, 30, 0.6)'
                  }}
                >
                  {item.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Growth indicator */}
      <div
        className="absolute"
        style={{
          right: '20px',
          bottom: '20px'
        }}
      >
        <div className="flex items-center" style={{ gap: '4px' }}>
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
            +15% vs last month
          </span>
        </div>
      </div>
    </div>
  );
};