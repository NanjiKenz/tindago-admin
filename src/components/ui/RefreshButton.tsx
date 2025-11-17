/**
 * Reusable Refresh Button Component
 * 
 * Consistent refresh button design matching PayoutManagement style
 */

import React from 'react';

interface RefreshButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  onClick, 
  loading = false,
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        padding: '12px 20px',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        color: '#1E1E1E',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Clash Grotesk Variable',
        fontWeight: 500,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        opacity: loading || disabled ? 0.5 : 1,
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!loading && !disabled) {
          e.currentTarget.style.backgroundColor = '#F8F9FA';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
      }}
    >
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        style={{
          animation: loading ? 'spin 1s linear infinite' : 'none'
        }}
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
      {loading ? 'Refreshing...' : 'Refresh'}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
