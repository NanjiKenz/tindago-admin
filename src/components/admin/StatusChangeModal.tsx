/**
 * Status Change Modal Component
 *
 * Professional modal for changing status (Deactivate/Suspend/Reactivate)
 * Maintains data integrity with soft deletes instead of hard deletes
 */

'use client';

import React, { useState } from 'react';

type StatusAction = 'deactivate' | 'suspend' | 'reactivate' | 'activate';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  action: StatusAction;
  resourceType: 'user' | 'admin' | 'customer' | 'store';
  resourceName: string;
  currentStatus: string;
  isProcessing?: boolean;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  resourceType,
  resourceName,
  currentStatus,
  isProcessing = false
}) => {
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'deactivate':
        return {
          title: `Deactivate ${resourceType}?`,
          icon: '⏸️',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          message: `This will temporarily deactivate "${resourceName}". They won't be able to access the system, but all data will be preserved. You can reactivate this ${resourceType} anytime.`,
          buttonText: 'Deactivate',
          requireReason: true
        };
      case 'suspend':
        return {
          title: `Suspend ${resourceType}?`,
          icon: '🚫',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          message: `This will suspend "${resourceName}" due to policy violation or security concerns. All data will be preserved for audit purposes. You can unsuspend later if needed.`,
          buttonText: 'Suspend',
          requireReason: true
        };
      case 'reactivate':
      case 'activate':
        return {
          title: `Reactivate ${resourceType}?`,
          icon: '✅',
          color: '#22C55E',
          bgColor: '#D1FAE5',
          message: `This will reactivate "${resourceName}" and restore full access to the system.`,
          buttonText: 'Reactivate',
          requireReason: false
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = () => {
    if (config.requireReason && !reason.trim() && showReasonInput) {
      return; // Don't submit without reason
    }
    onConfirm(reason.trim() || undefined);
    setReason(''); // Reset for next time
    setShowReasonInput(false);
  };

  const handleClose = () => {
    setReason('');
    setShowReasonInput(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ pointerEvents: 'none' }}>
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          style={{
            pointerEvents: 'auto',
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: '32px 32px 24px 32px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Icon */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: config.bgColor,
                  fontSize: '24px',
                  flexShrink: 0
                }}
              >
                {config.icon}
              </div>

              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '24px',
                    lineHeight: '1.2em',
                    color: '#1E1E1E',
                    margin: 0,
                    marginBottom: '4px'
                  }}
                >
                  {config.title}
                </h2>
                <p
                  style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: config.color,
                    margin: 0
                  }}
                >
                  Current: {currentStatus}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={isProcessing}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  opacity: isProcessing ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) e.currentTarget.style.backgroundColor = '#F3F5F9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '24px 32px' }}>
            <p
              style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '1.5em',
                color: 'rgba(30, 30, 30, 0.8)',
                margin: 0,
                marginBottom: config.requireReason ? '16px' : 0
              }}
            >
              {config.message}
            </p>

            {/* Reason Input (for deactivate/suspend) */}
            {config.requireReason && (
              <div>
                {!showReasonInput ? (
                  <button
                    onClick={() => setShowReasonInput(true)}
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontSize: '14px',
                      color: config.color,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0
                    }}
                  >
                    + Add reason (recommended)
                  </button>
                ) : (
                  <div>
                    <label
                      style={{
                        fontFamily: 'Clash Grotesk Variable',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1E1E1E',
                        display: 'block',
                        marginBottom: '8px'
                      }}
                    >
                      Reason for {action}:
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`e.g., Policy violation, Security concern, Account inactive...`}
                      disabled={isProcessing}
                      style={{
                        width: '100%',
                        minHeight: '80px',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        fontFamily: 'Clash Grotesk Variable',
                        fontSize: '14px',
                        resize: 'vertical',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = config.color;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer / Actions */}
          <div
            style={{
              padding: '20px 32px 32px 32px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}
          >
            {/* Cancel Button */}
            <button
              onClick={handleClose}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: '#FFFFFF',
                color: '#1E1E1E',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                transition: 'all 0.2s ease',
                opacity: isProcessing ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.backgroundColor = '#F3F5F9';
                  e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              }}
            >
              Cancel
            </button>

            {/* Action Button */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: config.color,
                color: '#FFFFFF',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '140px',
                justifyContent: 'center',
                opacity: isProcessing ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0px 4px 12px ${config.color}40`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Processing...
                </>
              ) : (
                config.buttonText
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};
