/**
 * View Details Modal Component
 *
 * Professional modal for viewing detailed information
 * Supports: Users, Admins, Customers, Stores, Transactions, Payouts
 */

'use client';

import React from 'react';

interface DetailField {
  label: string;
  value: string | number | React.ReactNode;
  fullWidth?: boolean;
  highlight?: boolean;
}

interface DetailSection {
  title: string;
  icon?: React.ReactNode;
  fields: DetailField[];
}

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  sections: DetailSection[];
  badge?: {
    text: string;
    color: string;
    bgColor: string;
  };
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  sections,
  badge
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full"
          style={{
            maxWidth: '700px',
            maxHeight: '90vh',
            pointerEvents: 'auto',
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div
            style={{
              padding: '32px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h2
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '28px',
                      lineHeight: '1.2em',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {title}
                  </h2>
                  {badge && (
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        fontFamily: 'Clash Grotesk Variable',
                        backgroundColor: badge.bgColor,
                        color: badge.color
                      }}
                    >
                      {badge.text}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 400,
                      fontSize: '16px',
                      color: 'rgba(30, 30, 30, 0.6)',
                      margin: 0
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                  marginLeft: '16px',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F5F9';
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

          {/* Content - Scrollable */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px'
            }}
          >
            {sections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                style={{
                  marginBottom: sectionIndex < sections.length - 1 ? '32px' : 0
                }}
              >
                {/* Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    paddingBottom: '12px',
                    borderBottom: '2px solid rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {section.icon && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: '#F3F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {section.icon}
                    </div>
                  )}
                  <h3
                    style={{
                      fontFamily: 'Clash Grotesk Variable',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#1E1E1E',
                      margin: 0
                    }}
                  >
                    {section.title}
                  </h3>
                </div>

                {/* Fields Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                  }}
                >
                  {section.fields.map((field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      style={{
                        gridColumn: field.fullWidth ? '1 / -1' : 'auto'
                      }}
                    >
                      <label
                        style={{
                          fontFamily: 'Clash Grotesk Variable',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'rgba(30, 30, 30, 0.6)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          marginBottom: '6px'
                        }}
                      >
                        {field.label}
                      </label>
                      <div
                        style={{
                          fontFamily: 'Clash Grotesk Variable',
                          fontSize: '16px',
                          fontWeight: field.highlight ? 600 : 400,
                          color: field.highlight ? '#3BB77E' : '#1E1E1E',
                          lineHeight: '1.5em'
                        }}
                      >
                        {field.value || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer - Fixed */}
          <div
            style={{
              padding: '20px 32px',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
              display: 'flex',
              justifyContent: 'flex-end',
              flexShrink: 0
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: '12px 32px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#3BB77E',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2E9C66';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0px 4px 12px rgba(59, 183, 126, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3BB77E';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Close
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

        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #F3F5F9;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </>
  );
};
