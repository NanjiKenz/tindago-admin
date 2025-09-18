/**
 * Top Products Component - Pixel Perfect Figma Implementation
 *
 * Table showing best-selling products (620x280) for analytics dashboard
 * Displays product rankings with sales data and trends
 */

'use client';

import React from 'react';

interface Product {
  rank: number;
  name: string;
  category: string;
  sales: string;
  revenue: string;
  trend: 'up' | 'down';
  trendValue: string;
}

export const TopProducts: React.FC = () => {
  const products: Product[] = [
    {
      rank: 1,
      name: 'Lucky Me! Instant Noodles',
      category: 'Food & Beverages',
      sales: '2,456',
      revenue: '₱98,240',
      trend: 'up',
      trendValue: '+12%'
    },
    {
      rank: 2,
      name: 'Colgate Toothpaste',
      category: 'Personal Care',
      sales: '1,892',
      revenue: '₱75,680',
      trend: 'up',
      trendValue: '+8%'
    },
    {
      rank: 3,
      name: 'Coca-Cola 1.5L',
      category: 'Beverages',
      sales: '1,654',
      revenue: '₱66,160',
      trend: 'down',
      trendValue: '-3%'
    },
    {
      rank: 4,
      name: 'Pantene Shampoo',
      category: 'Personal Care',
      sales: '1,423',
      revenue: '₱56,920',
      trend: 'up',
      trendValue: '+15%'
    },
    {
      rank: 5,
      name: 'Tide Detergent',
      category: 'Household',
      sales: '1,289',
      revenue: '₱51,560',
      trend: 'up',
      trendValue: '+6%'
    }
  ];

  return (
    <div
      className="bg-white rounded-2xl"
      style={{
        width: '620px',
        height: '280px',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}
    >
      {/* Table Header */}
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
          Top Products
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
          Best-selling products this month
        </p>
      </div>

      {/* Table Headers */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '70px',
          width: '580px',
          height: '30px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center h-full">
          <div
            style={{
              width: '40px',
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '1.2em',
              color: 'rgba(30, 30, 30, 0.6)'
            }}
          >
            Rank
          </div>
          <div
            style={{
              width: '240px',
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '1.2em',
              color: 'rgba(30, 30, 30, 0.6)'
            }}
          >
            Product
          </div>
          <div
            style={{
              width: '80px',
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '1.2em',
              color: 'rgba(30, 30, 30, 0.6)',
              textAlign: 'center'
            }}
          >
            Sales
          </div>
          <div
            style={{
              width: '100px',
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '1.2em',
              color: 'rgba(30, 30, 30, 0.6)',
              textAlign: 'right'
            }}
          >
            Revenue
          </div>
          <div
            style={{
              width: '120px',
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '12px',
              lineHeight: '1.2em',
              color: 'rgba(30, 30, 30, 0.6)',
              textAlign: 'right'
            }}
          >
            Trend
          </div>
        </div>
      </div>

      {/* Product Rows */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '110px',
          width: '580px',
          height: '150px'
        }}
      >
        {products.map((product, index) => (
          <div
            key={index}
            className="flex items-center hover:bg-gray-50 transition-colors"
            style={{
              height: '30px',
              marginBottom: index < products.length - 1 ? '6px' : '0'
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: '40px',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 700,
                fontSize: '14px',
                lineHeight: '1.2em',
                color: '#1E1E1E'
              }}
            >
              #{product.rank}
            </div>

            {/* Product Name & Category */}
            <div style={{ width: '240px' }}>
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '1.2em',
                  color: '#1E1E1E'
                }}
              >
                {product.name}
              </div>
              <div
                style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '1.2em',
                  color: 'rgba(30, 30, 30, 0.6)',
                  marginTop: '2px'
                }}
              >
                {product.category}
              </div>
            </div>

            {/* Sales */}
            <div
              style={{
                width: '80px',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                lineHeight: '1.2em',
                color: '#1E1E1E',
                textAlign: 'center'
              }}
            >
              {product.sales}
            </div>

            {/* Revenue */}
            <div
              style={{
                width: '100px',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '1.2em',
                color: '#1E1E1E',
                textAlign: 'right'
              }}
            >
              {product.revenue}
            </div>

            {/* Trend */}
            <div
              className="flex items-center justify-end"
              style={{
                width: '120px',
                gap: '4px'
              }}
            >
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                <path
                  d={product.trend === 'up' ? 'M1 7L6 2L11 7' : 'M1 1L6 6L11 1'}
                  stroke={product.trend === 'up' ? '#22C55E' : '#EF4444'}
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
                  color: product.trend === 'up' ? '#22C55E' : '#EF4444'
                }}
              >
                {product.trendValue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};