/**
 * Sales Target Component - Pixel Perfect Figma Implementation
 *
 * Sales Target section (447x300) with donut chart and target metrics
 * Positioned at x:953, y:381 from Figma design: 281:263-281:283
 */

'use client';

import React from 'react';

export const SalesTarget: React.FC = () => {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm"
      style={{
        width: '447px',
        height: '300px',
        position: 'relative'
      }}
    >
      {/* Title */}
      <div
        className="absolute"
        style={{
          left: '20.55px',
          top: '20px',
          width: '131.53px',
          height: '20px'
        }}
      >
        <h3
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 500,
            fontSize: '16px',
            lineHeight: '1.23em',
            color: '#1E1E1E'
          }}
        >
          Sales Target
        </h3>
      </div>

      {/* Targets Section */}
      <div
        className="absolute"
        style={{
          left: '38.02px',
          top: '182px',
          width: '100.7px'
        }}
      >
        <div className="space-y-2">
          {/* Daily Target */}
          <div className="flex items-center gap-2.5 mb-2">
            <div style={{ width: '6px', height: '0px' }}>
              <svg
                width="6"
                height="1"
                viewBox="0 0 6 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="0" y1="0.5" x2="6" y2="0.5" stroke="rgba(30, 30, 30, 0.5)" strokeWidth="6"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '1.23em',
                color: 'rgba(30, 30, 30, 0.5)'
              }}
            >
              Daily Target
            </span>
          </div>

          {/* Daily Target Value with Arrow */}
          <div className="flex items-center justify-between" style={{ width: '39px' }}>
            <div style={{ width: '0px', height: '10px' }}>
              <svg
                width="1"
                height="10"
                viewBox="0 0 1 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="0.5" y1="0" x2="0.5" y2="10" stroke="#D32B47" strokeWidth="1"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '1.23em',
                color: '#1E1E1E'
              }}
            >
              670
            </span>
          </div>

          {/* Monthly Target */}
          <div className="flex items-center gap-2.5 mt-4 mb-2">
            <div style={{ width: '6px', height: '0px' }}>
              <svg
                width="6"
                height="1"
                viewBox="0 0 6 1"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="0" y1="0.5" x2="6" y2="0.5" stroke="#72E4C6" strokeWidth="6"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '12px',
                lineHeight: '1.23em',
                color: 'rgba(30, 30, 30, 0.5)'
              }}
            >
              Monthly Target
            </span>
          </div>

          {/* Monthly Target Value with Arrow */}
          <div className="flex items-center justify-between" style={{ width: '39px' }}>
            <div style={{ width: '0px', height: '10px' }}>
              <svg
                width="1"
                height="10"
                viewBox="0 0 1 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line x1="0.5" y1="0" x2="0.5" y2="10" stroke="#4DB95B" strokeWidth="1"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '1.23em',
                color: '#1E1E1E'
              }}
            >
              100
            </span>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div
        className="absolute"
        style={{
          left: '252.79px',
          top: '75px',
          width: '154.14px',
          height: '150px'
        }}
      >
        {/* Outer Ring - Monthly Target (Teal) */}
        <div
          className="absolute rounded-full"
          style={{
            left: '0px',
            top: '0px',
            width: '154.14px',
            height: '150px',
            backgroundColor: '#72E4C6'
          }}
        />

        {/* Inner Ring - Daily Target (Gray) */}
        <div
          className="absolute rounded-full"
          style={{
            left: '25.69px',
            top: '25px',
            width: '102.76px',
            height: '100px',
            backgroundColor: '#8F8F8F'
          }}
        />

        {/* Center hole */}
        <div
          className="absolute rounded-full bg-white"
          style={{
            left: '50px',
            top: '50px',
            width: '54px',
            height: '50px'
          }}
        />
      </div>
    </div>
  );
};