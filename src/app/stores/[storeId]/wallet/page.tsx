'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getWalletBalance, getWalletTransactions } from '@/lib/walletService';
import { createPayoutRequest, getStorePayoutRequests } from '@/lib/payoutService';
import type { WalletBalance, WalletTransaction } from '@/lib/walletService';
import type { PayoutRequest } from '@/lib/payoutService';

export default function StoreWalletPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  // Payout form
  const [payoutAmount, setPayoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'gcash' | 'paymaya'>('gcash');
  const [accountDetails, setAccountDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    const [bal, txns, reqs] = await Promise.all([
      getWalletBalance(storeId),
      getWalletTransactions(storeId),
      getStorePayoutRequests(storeId),
    ]);
    setBalance(bal);
    setTransactions(txns);
    setPayouts(reqs);
    setLoading(false);
  };

  const handleSubmitPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createPayoutRequest({
        storeId,
        amount: parseFloat(payoutAmount),
        paymentMethod,
        accountDetails,
        notes,
      });

      alert('Payout request submitted!');
      setShowRequestForm(false);
      setPayoutAmount('');
      setAccountDetails('');
      setNotes('');
      await loadData();
    } catch (error) {
      alert('Error submitting payout request');
      console.error(error);
    }

    setSubmitting(false);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Wallet</h1>

      {/* Balance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', margin: '20px 0' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Available Balance</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'green' }}>
            ₱{balance?.available.toFixed(2)}
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            disabled={!balance || balance.available <= 0}
            style={{
              marginTop: '15px',
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: balance && balance.available > 0 ? 'pointer' : 'not-allowed',
              opacity: balance && balance.available > 0 ? 1 : 0.5,
            }}
          >
            Request Payout
          </button>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Pending</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'orange' }}>
            ₱{balance?.pending.toFixed(2)}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>From unpaid orders</div>
        </div>
      </div>

      {/* Payout Request Form */}
      {showRequestForm && (
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
          background: '#f9f9f9',
        }}>
          <h2>Request Payout</h2>
          <form onSubmit={handleSubmitPayout}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount</label>
              <input
                type="number"
                step="0.01"
                max={balance?.available}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                required
                style={{ padding: '8px', width: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Max: ₱{balance?.available.toFixed(2)}
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              >
                <option value="gcash">GCash</option>
                <option value="paymaya">PayMaya</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {paymentMethod === 'bank' ? 'Bank Account Number' : 'Mobile Number'}
              </label>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                required
                placeholder={paymentMethod === 'bank' ? '1234567890' : '+639123456789'}
                style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  padding: '8px',
                  width: '100%',
                  maxWidth: '500px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minHeight: '60px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '10px 20px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payout Requests */}
      <h2>Payout Requests</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', marginBottom: '30px' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Method</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No payout requests yet
              </td>
            </tr>
          ) : (
            payouts.map((payout) => (
              <tr key={payout.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{new Date(payout.requestedAt).toLocaleDateString()}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>₱{payout.amount.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>{payout.paymentMethod.toUpperCase()}</td>
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
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Wallet Transactions */}
      <h2>Wallet History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{new Date(txn.timestamp).toLocaleDateString()}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: txn.type === 'credit' ? '#d4edda' : '#f8d7da',
                    color: txn.type === 'credit' ? '#155724' : '#721c24',
                  }}>
                    {txn.type.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{txn.description}</td>
                <td style={{
                  padding: '10px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color: txn.type === 'credit' ? 'green' : 'red',
                }}>
                  {txn.type === 'credit' ? '+' : '-'}₱{txn.amount.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
