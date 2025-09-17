/**
 * Sales Analytics Component - Pixel Perfect Figma Implementation
 *
 * Sales Analytics chart (620x300) with bar chart and exact styling
 * Positioned at x:313, y:381 from Figma design: 281:226-281:262
 */

'use client';

import React from 'react';

export const SalesAnalytics: React.FC = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Bar heights from Figma (relative to 140px max height)
  const barHeights = [67, 24, 50, 35, 76, 44, 114, 87, 140, 50, 30, 25]; // Pixel heights from Figma

  return (
    <div
      className="bg-white rounded-2xl shadow-sm"
      style={{
        width: '620px',
        height: '300px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 1) 38%)',
        position: 'relative'
      }}
    >
      {/* Title */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '20px',
          width: '128px',
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
          Sales Analytics
        </h3>
      </div>

      {/* "This Month" label */}
      <div
        className="absolute"
        style={{
          right: '20px',
          top: '20px',
          width: '57px',
          height: '15px'
        }}
      >
        <span
          style={{
            fontFamily: 'Clash Grotesk Variable',
            fontWeight: 400,
            fontSize: '12px',
            lineHeight: '1.23em',
            color: '#1E1E1E'
          }}
        >
          This Month
        </span>
      </div>

      {/* Y-axis Numbers */}
      <div
        className="absolute"
        style={{
          left: '20px',
          top: '78px',
          width: '25px',
          height: '172px'
        }}
      >
        {/* Numbers positioned as per Figma */}
        <div
          className="absolute"
          style={{
            left: '0px',
            top: '160px',
            width: '7px',
            height: '12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            0
          </span>
        </div>

        <div
          className="absolute"
          style={{
            left: '0px',
            top: '128px',
            width: '20px',
            height: '12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            250
          </span>
        </div>

        <div
          className="absolute"
          style={{
            left: '0px',
            top: '96px',
            width: '21px',
            height: '12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            500
          </span>
        </div>

        <div
          className="absolute"
          style={{
            left: '0px',
            top: '64px',
            width: '19px',
            height: '12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            750
          </span>
        </div>

        <div
          className="absolute"
          style={{
            left: '0px',
            top: '32px',
            width: '25px',
            height: '12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            1000
          </span>
        </div>

        <div
          className="absolute"
          style={{
            left: '0px',
            top: '0px',
            width: '24px',
            height: '12px'
          }}
        >
          <span
            style={{
              fontFamily: 'Clash Grotesk Variable',
              fontWeight: 500,
              fontSize: '10px',
              lineHeight: '1.23em',
              color: 'rgba(30, 30, 30, 0.5)'
            }}
          >
            1500
          </span>
        </div>
      </div>

      {/* Bar Chart */}
      <div
        className="absolute"
        style={{
          left: '71px',
          top: '110px',
          width: '390px',
          height: '140px'
        }}
      >
        {barHeights.map((height, index) => (
          <div
            key={index}
            className="absolute rounded-t-lg"
            style={{
              left: `${index * 30 + index * 15}px`, // 30px bar width + 15px spacing
              bottom: '0px',
              width: '30px',
              height: `${height}px`,
              background: 'linear-gradient(180deg, rgba(234, 179, 8, 1) 0%, rgba(153, 112, 1, 0) 100%)'
            }}
          />
        ))}
      </div>

      {/* X-axis Month Labels */}
      <div
        className="absolute"
        style={{
          left: '77px',
          bottom: '20px',
          width: '519px',
          height: '12px'
        }}
      >
        {months.map((month, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: `${index * 45}px`, // Spacing between month labels
              width: '18px',
              height: '12px'
            }}
          >
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '10px',
                lineHeight: '1.23em',
                color: '#1E1E1E'
              }}
            >
              {month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};