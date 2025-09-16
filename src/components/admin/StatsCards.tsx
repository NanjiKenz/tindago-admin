/**
 * Stats Cards Component
 *
 * Enhanced statistics cards with animations and better visual design for TindaGo Admin
 */

'use client';

import React from 'react';

interface StatData {
  title: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  description?: string;
}

interface StatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-600',
      border: 'border-blue-200'
    },
    yellow: {
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      valueColor: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    green: {
      bg: 'bg-tindago-50',
      iconBg: 'bg-tindago-100',
      iconColor: 'text-tindago-600',
      valueColor: 'text-tindago-600',
      border: 'border-tindago-200'
    },
    red: {
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
      border: 'border-red-200'
    },
    purple: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-600',
      border: 'border-purple-200'
    }
  };

  const statsData: StatData[] = [
    {
      title: 'Total Registrations',
      value: stats.total,
      change: 12,
      changeType: 'increase',
      description: 'Total store applications received',
      color: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      change: -3,
      changeType: 'decrease',
      description: 'Awaiting admin approval',
      color: 'yellow',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Approved Stores',
      value: stats.approved,
      change: 8,
      changeType: 'increase',
      description: 'Successfully onboarded stores',
      color: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    {
      title: 'Rejected Applications',
      value: stats.rejected,
      change: 0,
      changeType: 'neutral',
      description: 'Applications not approved',
      color: 'red',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ];

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    if (changeType === 'increase') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    }
    if (changeType === 'decrease') {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => {
        const colors = colorVariants[stat.color];

        return (
          <div
            key={stat.title}
            className={`bg-white rounded-xl shadow-soft border ${colors.border} p-6 hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 group`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${colors.iconBg} ${colors.iconColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  {stat.change !== undefined && (
                    <div className="flex items-center space-x-1">
                      {getChangeIcon(stat.changeType!)}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' :
                        stat.changeType === 'decrease' ? 'text-red-600' :
                        'text-secondary-400'
                      }`}>
                        {Math.abs(stat.change)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${colors.valueColor} group-hover:scale-105 transition-transform duration-300`}>
                    {stat.value.toLocaleString()}
                  </p>
                  {stat.description && (
                    <p className="text-xs text-secondary-500 mt-2">{stat.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress indicator for pending items */}
            {stat.title === 'Pending Review' && stat.value > 0 && (
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <div className="flex items-center justify-between text-xs text-secondary-600 mb-2">
                  <span>Processing Queue</span>
                  <span>{Math.round((stat.value / stats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(stat.value / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success rate for approved stores */}
            {stat.title === 'Approved Stores' && stats.total > 0 && (
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <div className="flex items-center justify-between text-xs text-secondary-600 mb-2">
                  <span>Approval Rate</span>
                  <span>{Math.round((stat.value / stats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-2">
                  <div
                    className="bg-tindago-400 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(stat.value / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};