/**
 * Delete Confirmation Modal Component
 *
 * Reusable modal for confirming delete actions across all management pages
 * Professional, accessible, and follows TindaGo design system
 */

'use client';

import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        style={{
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          pointerEvents: 'none'
        }}
      >
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
          <div
            style={{
              padding: '32px 32px 24px 32px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Warning Icon */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#FEF2F2',
                  flexShrink: 0
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
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
                  {title}
                </h2>
                {itemName && (
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#EF4444',
                      margin: 0
                    }}
                  >
                    {itemName}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                disabled={isDeleting}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  opacity: isDeleting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isDeleting) {
                    e.currentTarget.style.backgroundColor = '#F3F5F9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                margin: 0
              }}
            >
              {message}
            </p>
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
              onClick={onClose}
              disabled={isDeleting}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backgroundColor: '#FFFFFF',
                color: '#1E1E1E',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                transition: 'all 0.2s ease',
                opacity: isDeleting ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
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

            {/* Delete Button */}
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isDeleting ? '#F87171' : '#EF4444',
                color: '#FFFFFF',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '120px',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0px 4px 12px rgba(239, 68, 68, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EF4444';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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
