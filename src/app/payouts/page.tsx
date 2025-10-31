'use client';

import React, { useEffect, useState } from 'react';
import { getAllPayoutRequests, approvePayoutRequest, rejectPayoutRequest, getPayoutStats } from '@/lib/payoutService';
import type { PayoutRequest } from '@/lib/payoutService';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [reqs, statistics] = await Promise.all([
      getAllPayoutRequests(),
      getPayoutStats(),
    ]);
    setPayouts(reqs);
    setStats(statistics);
    setLoading(false);
  };

  const handleApprove = async (payout: PayoutRequest) => {
    if (!confirm(`Approve payout of ₱${payout.amount.toFixed(2)} for ${payout.storeName}?`)) return;

    setProcessing(payout.id);
    try {
      await approvePayoutRequest({
        payoutId: payout.id,
        adminUserId: 'admin',
        adminNotes,
      });
      alert('Payout approved!');
      setSelectedPayout(null);
      setAdminNotes('');
      await loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
    setProcessing(null);
  };

  const handleReject = async (payout: PayoutRequest) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    setProcessing(payout.id);
    try {
      await rejectPayoutRequest({
        payoutId: payout.id,
        adminUserId: 'admin',
        adminNotes: reason,
      });
      alert('Payout rejected');
      await loadData();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
    setProcessing(null);
  };

  const filteredPayouts = payouts.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Payout Management</h1>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', margin: '20px 0' }}>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Pending Requests</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.pendingCount}</div>
            <div style={{ fontSize: '14px', color: 'orange' }}>₱{stats.totalPendingAmount.toFixed(2)}</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Approved</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>{stats.approvedCount}</div>
            <div style={{ fontSize: '14px', color: 'green' }}>₱{stats.totalApprovedAmount.toFixed(2)}</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Completed</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.completedCount}</div>
          </div>
          <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Rejected</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'red' }}>{stats.rejectedCount}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            background: filter === 'all' ? '#007bff' : '#f0f0f0',
            color: filter === 'all' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          All ({payouts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            background: filter === 'pending' ? '#ffc107' : '#f0f0f0',
            color: filter === 'pending' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Pending ({stats?.pendingCount || 0})
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            background: filter === 'approved' ? '#28a745' : '#f0f0f0',
            color: filter === 'approved' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Approved ({stats?.approvedCount || 0})
        </button>
      </div>

      {/* Payouts Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Store</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Requested</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Method</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Account</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayouts.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No payout requests
              </td>
            </tr>
          ) : (
            filteredPayouts.map((payout) => (
              <tr key={payout.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 'bold' }}>{payout.storeName}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{payout.storeId.slice(0, 8)}...</div>
                </td>
                <td style={{ padding: '10px', fontSize: '14px' }}>
                  {new Date(payout.requestedAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                  ₱{payout.amount.toFixed(2)}
                </td>
                <td style={{ padding: '10px' }}>{payout.paymentMethod.toUpperCase()}</td>
                <td style={{ padding: '10px', fontSize: '14px' }}>{payout.accountDetails}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background:
                      payout.status === 'approved' || payout.status === 'completed' ? '#d4edda' :
                      payout.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                    color:
                      payout.status === 'approved' || payout.status === 'completed' ? '#155724' :
                      payout.status === 'rejected' ? '#721c24' : '#856404',
                  }}>
                    {payout.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  {payout.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => handleApprove(payout)}
                        disabled={processing === payout.id}
                        style={{
                          padding: '6px 12px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processing === payout.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(payout)}
                        disabled={processing === payout.id}
                        style={{
                          padding: '6px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: processing === payout.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {payout.status === 'approved' && (
                    <span style={{ fontSize: '12px', color: '#666' }}>Approved</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
