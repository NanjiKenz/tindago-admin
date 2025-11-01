'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getAllPayoutRequests, approvePayoutRequest, rejectPayoutRequest, getPayoutStats } from '@/lib/payoutService';
import type { PayoutRequest } from '@/lib/payoutService';

export default function PayoutsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

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

  const pendingPayouts = filteredPayouts.filter(p => p.status === 'pending');
  const allPendingSelected = pendingPayouts.length > 0 && pendingPayouts.every(p => selectedPayouts.has(p.id));

  const togglePayout = (id: string) => {
    const newSelected = new Set(selectedPayouts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPayouts(newSelected);
  };

  const toggleAllPending = () => {
    if (allPendingSelected) {
      setSelectedPayouts(new Set());
    } else {
      setSelectedPayouts(new Set(pendingPayouts.map(p => p.id)));
    }
  };

  const handleBulkApprove = async () => {
    const selectedCount = selectedPayouts.size;
    const totalAmount = payouts
      .filter(p => selectedPayouts.has(p.id))
      .reduce((sum, p) => sum + p.amount, 0);

    if (!confirm(`Approve ${selectedCount} payout requests?\n\nTotal amount: ₱${totalAmount.toFixed(2)}\n\nThis will debit the store wallets.`)) {
      return;
    }

    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    for (const payoutId of Array.from(selectedPayouts)) {
      try {
        await approvePayoutRequest({
          payoutId,
          adminUserId: 'admin',
          adminNotes: 'Bulk approved',
        });
        successCount++;
      } catch (error: any) {
        console.error(`Failed to approve payout ${payoutId}:`, error);
        failCount++;
      }
    }

    alert(`Bulk approval complete!\n\nApproved: ${successCount}\nFailed: ${failCount}`);
    setSelectedPayouts(new Set());
    await loadData();
    setBulkProcessing(false);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden lg:overflow-visible"
      style={{
        width: '100vw',
        maxWidth: '1440px',
        minHeight: '1024px',
        backgroundColor: '#F3F5F9',
        margin: '0 auto'
      }}
    >
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="payouts" />

      {/* Main Container */}
      <div
        className="absolute lg:left-[273px] left-0 lg:w-[1167px] w-full"
        style={{
          top: '0px',
          minHeight: '1024px'
        }}
      >
        {/* Header */}
        <div
          className="absolute w-full"
          style={{
            left: '0px',
            top: '0px',
            height: '80px',
            zIndex: 10
          }}
        >
          <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Content Area */}
        <div
          className="absolute w-full lg:px-5 px-4"
          style={{
            left: '0px',
            top: '80px',
            minHeight: '944px',
            paddingTop: '40px'
          }}
        >
          {loading ? (
            <div style={{ padding: '20px' }}>Loading...</div>
          ) : (
            <>
      <h1 style={{ fontFamily: 'Clash Grotesk Variable', fontSize: '48px', fontWeight: 500, marginBottom: '20px' }}>Payout Management</h1>

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

      {/* Bulk Actions */}
      {selectedPayouts.size > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#E3F2FD', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>{selectedPayouts.size}</strong> payout{selectedPayouts.size > 1 ? 's' : ''} selected
            <span style={{ marginLeft: '20px', color: '#666' }}>
              Total: ₱{payouts.filter(p => selectedPayouts.has(p.id)).reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleBulkApprove}
              disabled={bulkProcessing}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: bulkProcessing ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {bulkProcessing ? 'Processing...' : `Approve Selected (${selectedPayouts.size})`}
            </button>
            <button
              onClick={() => setSelectedPayouts(new Set())}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Selection
            </button>
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
            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd', width: '50px' }}>
              {pendingPayouts.length > 0 && (
                <input
                  type="checkbox"
                  checked={allPendingSelected}
                  onChange={toggleAllPending}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  title="Select all pending payouts"
                />
              )}
            </th>
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
              <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No payout requests
              </td>
            </tr>
          ) : (
            filteredPayouts.map((payout) => (
              <tr key={payout.id} style={{ borderBottom: '1px solid #eee', background: selectedPayouts.has(payout.id) ? '#F3F4F6' : 'transparent' }}>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  {payout.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedPayouts.has(payout.id)}
                      onChange={() => togglePayout(payout.id)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                  )}
                </td>
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
            </>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
