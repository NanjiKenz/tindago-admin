/**
 * Quick Actions Component
 *
 * Quick action buttons and dashboard widgets for TindaGo Admin
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  onClick: () => void;
  disabled?: boolean;
}

interface DashboardWidget {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    type: 'up' | 'down' | 'neutral';
  };
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

interface QuickActionsProps {
  onRefreshData: () => void;
  onExportReport: () => void;
  onBulkApprove: () => void;
  pendingCount: number;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onRefreshData,
  onExportReport,
  onBulkApprove,
  pendingCount
}) => {
  const colorVariants = {
    blue: {
      bg: 'bg-blue-500',
      hoverBg: 'hover:bg-blue-600',
      lightBg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200'
    },
    green: {
      bg: 'bg-tindago-500',
      hoverBg: 'hover:bg-tindago-600',
      lightBg: 'bg-tindago-50',
      text: 'text-tindago-600',
      border: 'border-tindago-200'
    },
    yellow: {
      bg: 'bg-yellow-500',
      hoverBg: 'hover:bg-yellow-600',
      lightBg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200'
    },
    purple: {
      bg: 'bg-purple-500',
      hoverBg: 'hover:bg-purple-600',
      lightBg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200'
    },
    red: {
      bg: 'bg-red-500',
      hoverBg: 'hover:bg-red-600',
      lightBg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200'
    }
  };

  const quickActions: QuickAction[] = [
    {
      title: 'Refresh Data',
      description: 'Update all dashboard data',
      color: 'blue',
      onClick: onRefreshData,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    {
      title: 'Export Report',
      description: 'Download data as CSV',
      color: 'green',
      onClick: onExportReport,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Bulk Approve',
      description: `Approve ${pendingCount} pending`,
      color: 'yellow',
      onClick: onBulkApprove,
      disabled: pendingCount === 0,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const dashboardWidgets: DashboardWidget[] = [
    {
      title: 'Today\'s Reviews',
      value: 8,
      subtitle: 'Registrations processed',
      trend: { value: 25, type: 'up' },
      color: 'blue'
    },
    {
      title: 'Avg. Processing Time',
      value: '2.4h',
      subtitle: 'From submission to approval',
      trend: { value: 12, type: 'down' },
      color: 'green'
    },
    {
      title: 'Success Rate',
      value: '94%',
      subtitle: 'Approval percentage',
      trend: { value: 3, type: 'up' },
      color: 'purple'
    }
  ];

  const getTrendIcon = (type: 'up' | 'down' | 'neutral') => {
    if (type === 'up') {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
        </svg>
      );
    }
    if (type === 'down') {
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
    <div className="space-y-6">
      {/* Quick Actions Grid */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Quick Actions</h3>
            <p className="text-sm text-secondary-600 mt-1">Common administrative tasks</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tindago-100 text-tindago-800">
              {pendingCount} pending
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const colors = colorVariants[action.color];
            return (
              <button
                key={action.title}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`group p-4 rounded-lg border transition-all duration-200 text-left ${
                  action.disabled
                    ? 'bg-secondary-50 border-secondary-200 opacity-50 cursor-not-allowed'
                    : `${colors.lightBg} ${colors.border} hover:shadow-soft hover:-translate-y-0.5`
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    action.disabled ? 'bg-secondary-200 text-secondary-400' : `${colors.bg} text-white group-hover:scale-110 transition-transform`
                  }`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${action.disabled ? 'text-secondary-400' : 'text-secondary-900'}`}>
                      {action.title}
                    </h4>
                    <p className={`text-sm ${action.disabled ? 'text-secondary-400' : 'text-secondary-600'}`}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardWidgets.map((widget) => {
          const colors = colorVariants[widget.color];
          return (
            <div
              key={widget.title}
              className={`bg-white rounded-xl shadow-soft border p-6 hover:shadow-medium transition-all duration-300 ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-secondary-600">{widget.title}</h4>
                {widget.trend && (
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(widget.trend.type)}
                    <span className={`text-sm font-medium ${
                      widget.trend.type === 'up' ? 'text-green-600' :
                      widget.trend.type === 'down' ? 'text-red-600' :
                      'text-secondary-400'
                    }`}>
                      {widget.trend.value}%
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className={`text-3xl font-bold ${colors.text}`}>
                  {widget.value}
                </p>
                <p className="text-sm text-secondary-500">
                  {widget.subtitle}
                </p>
              </div>

              {/* Mini progress indicator */}
              <div className="mt-4 pt-4 border-t border-secondary-100">
                <div className="flex items-center justify-between text-xs text-secondary-600 mb-2">
                  <span>Performance</span>
                  <span>Excellent</span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-1.5">
                  <div
                    className={`${colors.bg} h-1.5 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: '85%' }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Recent Activity</h3>
            <p className="text-sm text-secondary-600 mt-1">Latest administrative actions</p>
          </div>
          <Button variant="secondary" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-4">
          {[
            {
              action: 'Store Registration Approved',
              description: 'Sari-Sari Store Manila by Juan Dela Cruz',
              time: '2 minutes ago',
              type: 'approved'
            },
            {
              action: 'Registration Rejected',
              description: 'Missing business permit documentation',
              time: '15 minutes ago',
              type: 'rejected'
            },
            {
              action: 'New Registration Received',
              description: 'Tindahan ni Maria in Quezon City',
              time: '1 hour ago',
              type: 'pending'
            },
            {
              action: 'Bulk Export Generated',
              description: 'Store registrations report downloaded',
              time: '2 hours ago',
              type: 'export'
            }
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary-50 transition-colors">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'approved' ? 'bg-tindago-100 text-tindago-600' :
                activity.type === 'rejected' ? 'bg-red-100 text-red-600' :
                activity.type === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {activity.type === 'approved' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : activity.type === 'rejected' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : activity.type === 'pending' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900">{activity.action}</p>
                <p className="text-sm text-secondary-600 truncate">{activity.description}</p>
                <p className="text-xs text-secondary-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};