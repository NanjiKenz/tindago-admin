/**
 * Report Header Component - Pixel Perfect Figma Implementation
 *
 * Page title and description for Report & Analytics section
 * Follows exact typography and positioning from Figma design
 */

'use client';

import React from 'react';

export const ReportHeader: React.FC = () => {
  return (
    <div className="relative w-full h-full">
      {/* Page Title */}
      <h1
        style={{
          fontFamily: 'Clash Grotesk Variable',
          fontWeight: 500,
          fontSize: '48px',
          lineHeight: '1.2em',
          color: '#1E1E1E',
          marginBottom: '8px',
          margin: 0
        }}
      >
        Report & Analytics
      </h1>

      {/* Page Description */}
      <p
        style={{
          fontFamily: 'Clash Grotesk Variable',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '1.2em',
          color: 'rgba(30, 30, 30, 0.6)',
          margin: 0
        }}
      >
        Comprehensive insights and data visualization for your TindaGo marketplace performance.
      </p>
    </div>
  );
};