/**
 * Quick Actions Component - Pixel Perfect Figma Implementation
 *
 * Quick Actions section (1087x303) with 4 interactive buttons in 2x2 grid
 * Positioned at x:313, y:701 from Figma design: 281:284-281:302
 */

'use client';

import React from 'react';
import Image from 'next/image';

interface QuickActionButton {
  title: string;
  iconSrc: string;
  onClick: () => void;
  position: { x: number; y: number };
}

export const QuickActions: React.FC = () => {
  const handleAction = (actionName: string) => {
    console.log(`${actionName} clicked`);
    // Add actual functionality here
  };

  const quickActions: QuickActionButton[] = [
    {
      title: 'Add New Admin',
      iconSrc: '/images/admin-dashboard/plus-icon.png',
      onClick: () => handleAction('Add New Admin'),
      position: { x: 30.33, y: 60 }
    },
    {
      title: 'Generate Report',
      iconSrc: '/images/admin-dashboard/report-action-icon.png',
      onClick: () => handleAction('Generate Report'),
      position: { x: 30.33, y: 180 }
    },
    {
      title: 'Approve Stores',
      iconSrc: '/images/admin-dashboard/shop-action-icon.png',
      onClick: () => handleAction('Approve Stores'),
      position: { x: 556.14, y: 60 }
    },
    {
      title: 'System Settings',
      iconSrc: '/images/admin-dashboard/settings-icon.png',
      onClick: () => handleAction('System Settings'),
      position: { x: 556.14, y: 180 }
    }
  ];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm"
      style={{
        width: '1087px',
        height: '303px',
        position: 'relative'
      }}
    >
      {/* Title */}
      <div
        className="absolute"
        style={{
          left: '20.22px',
          top: '20px',
          width: '129.43px',
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
          Quick Actions
        </h3>
      </div>

      {/* Action Buttons */}
      {quickActions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="absolute border border-gray-300 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
          style={{
            left: `${action.position.x}px`,
            top: `${action.position.y}px`,
            width: '505.58px',
            height: '100px'
          }}
        >
          {/* Icon */}
          <div
            className="absolute rounded-2xl"
            style={{
              left: '237.62px', // Centered horizontally in the button
              top: '20px',
              width: '30.33px',
              height: '30px'
            }}
          >
            <Image
              src={action.iconSrc}
              alt={action.title}
              width={30}
              height={30}
              className="object-contain"
            />
          </div>

          {/* Title */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '195.15px', // Centered horizontally in the button
              top: '50px',
              width: '115.27px',
              height: '20px'
            }}
          >
            <span
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '1.23em',
                color: '#1E1E1E',
                textAlign: 'center'
              }}
            >
              {action.title}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};