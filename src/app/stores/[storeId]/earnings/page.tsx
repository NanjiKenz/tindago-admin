'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getStoreTransactions } from '@/lib/transactionService';
import { calculateStoreEarnings } from '@/lib/walletService';
import type { Transaction } from '@/lib/transactionService';

export default function StoreEarningsPage() {
  const params = useParams();
  const storeId = params.storeId as string;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    paidEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [storeId]);

  const loadData = async () => {
    setLoading(true);
    const [txns, earn] = await Promise.all([
      getStoreTransactions(storeId),
      calculateStoreEarnings(storeId),
    ]);
    setTransactions(txns);
    setEarnings(earn);
    setLoading(false);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Store Earnings</h1>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', margin: '20px 0' }}>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Earnings</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₱{earnings.totalEarnings.toFixed(2)}</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Paid (Available)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'green' }}>₱{earnings.paidEarnings.toFixed(2)}</div>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Pending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'orange' }}>₱{earnings.pendingEarnings.toFixed(2)}</div>
        </div>
      </div>

      {/* Transactions Table */}
      <h2>Transaction History</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead style={{ background: '#f5f5f5' }}>
          <tr>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Order #</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Commission</th>
            <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Your Earnings</th>
            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.map((txn) => (
              <tr key={txn.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{txn.orderNumber}</td>
                <td style={{ padding: '10px' }}>{new Date(txn.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>₱{txn.amount.toFixed(2)}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: 'red' }}>-₱{txn.commission.toFixed(2)}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>₱{txn.storeAmount.toFixed(2)}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    background: txn.paymentStatus === 'paid' ? '#d4edda' : '#fff3cd',
                    color: txn.paymentStatus === 'paid' ? '#155724' : '#856404',
                  }}>
                    {txn.paymentStatus}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
