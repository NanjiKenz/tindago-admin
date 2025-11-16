/**
 * Payment Method Distribution Component - Replaces Sales Target
 *
 * Displays payment method distribution (GCash, PayMaya, Cash) as a pie chart
 * Positioned at x:953, y:381 from original Figma design (447x300)
 */

'use client';

import React, { useEffect, useState } from 'react';

interface PaymentStats {
  gcash: number;
  paymaya: number;
  total: number;
}

export const PaymentMethodDistribution: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats>({
    gcash: 0,
    paymaya: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentStats();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      // Fetch ledger transactions to get payment method data
      const res = await fetch('/api/admin/payment-stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentages for bar width
  const maxAmount = Math.max(stats.gcash, stats.paymaya);
  const gcashPercent = maxAmount > 0 ? (stats.gcash / maxAmount) * 100 : 0;
  const paymayaPercent = maxAmount > 0 ? (stats.paymaya / maxAmount) * 100 : 0;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm"
      style={{
        width: '447px',
        height: '300px',
        position: 'relative',
        padding: '20px'
      }}
    >
      {/* Title */}
      <h3
        style={{
          fontFamily: 'Clash Grotesk Variable',
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '1.23em',
          color: '#1E1E1E',
          marginBottom: '20px'
        }}
      >
        Payment Method Distribution
      </h3>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '240px',
          color: 'rgba(30, 30, 30, 0.5)',
          fontFamily: 'Clash Grotesk Variable'
        }}>
          Loading...
        </div>
      ) : stats.total === 0 ? (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '240px',
          color: 'rgba(30, 30, 30, 0.5)',
          fontFamily: 'Clash Grotesk Variable'
        }}>
          No payment data available
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '0px' }}>
          {/* GCash Bar */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* GCash G icon */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#2F7FED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: 'white',
                  fontFamily: 'Clash Grotesk Variable'
                }}>
                  G
                </div>
                <span style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  color: '#1E1E1E'
                }}>
                  GCash
                </span>
              </div>
              <span style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '18px',
                color: '#1E1E1E'
              }}>
                ₱{stats.gcash.toFixed(2)}
              </span>
            </div>
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '28px',
              backgroundColor: '#F3F5F9',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${gcashPercent}%`,
                height: '100%',
                backgroundColor: '#2F7FED',
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '12px'
              }}>
                {gcashPercent > 15 && (
                  <span style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    {((stats.gcash / stats.total) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* PayMaya Bar */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* PayMaya icon */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#00D632',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '11px',
                  color: 'white',
                  fontFamily: 'Clash Grotesk Variable',
                  fontStyle: 'italic'
                }}>
                  M
                </div>
                <span style={{
                  fontFamily: 'Clash Grotesk Variable',
                  fontWeight: 500,
                  fontSize: '16px',
                  color: '#1E1E1E'
                }}>
                  PayMaya
                </span>
              </div>
              <span style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '18px',
                color: '#1E1E1E'
              }}>
                ₱{stats.paymaya.toFixed(2)}
              </span>
            </div>
            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '28px',
              backgroundColor: '#F3F5F9',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${paymayaPercent}%`,
                height: '100%',
                backgroundColor: '#00D632',
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '12px'
              }}>
                {paymayaPercent > 15 && (
                  <span style={{
                    fontFamily: 'Clash Grotesk Variable',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'white'
                  }}>
                    {((stats.paymaya / stats.total) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Total Summary */}
          <div style={{
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <span style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 500,
                fontSize: '14px',
                color: 'rgba(30, 30, 30, 0.6)'
              }}>
                Total Online Payments
              </span>
              <span style={{
                fontFamily: 'Clash Grotesk Variable',
                fontWeight: 600,
                fontSize: '20px',
                color: '#1E1E1E'
              }}>
                ₱{stats.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
