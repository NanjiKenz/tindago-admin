'use client';

import React, { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import {
  filterTransactions,
  getTransactionSummary,
  exportToCSV,
  formatCurrency,
  formatDate,
  type Transaction,
} from '@/lib/transactionService';
import { TransactionsTable, LedgerTxn } from '@/components/admin/TransactionsTable';

export default function TransactionsPage() {
  const [txns, setTxns] = useState<LedgerTxn[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  useEffect(() => {
    const rootRef = ref(database, 'ledgers/stores');
    const handler = onValue(rootRef, (snap) => {
      const rows: LedgerTxn[] = [];
      if (snap.exists()) {
        const data = snap.val() as Record<string, any>;
        for (const storeId of Object.keys(data)) {
          const txs = data[storeId].transactions || {};
          for (const invoiceId of Object.keys(txs)) {
            const t = txs[invoiceId];
            rows.push({
              invoiceId,
              orderNumber: t.orderNumber,
              storeId,
              storeName: t.storeName,
              amount: Number(t.amount || 0),
              commission: Number(t.commission || 0),
              commissionRate: Number(t.commissionRate || 0),
              storeAmount: Number(t.storeAmount || 0),
              method: t.method,
              status: (t.status || 'PENDING').toString(),
              createdAt: t.createdAt,
              paidAt: t.paidAt,
              settledAt: t.settledAt,
              invoiceUrl: t.invoiceUrl,
            });
          }
        }
      }
      // sort newest first
      rows.sort((a,b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setTxns(rows);
      setLoading(false);
    });
    return () => off(rootRef, 'value', handler);
  }, []);

  // Convert to Transaction type and apply filters
  const transactions: Transaction[] = txns.map(t => ({
    id: t.invoiceId,
    orderNumber: t.orderNumber || '',
    invoiceId: t.invoiceId,
    storeId: t.storeId,
    storeName: t.storeName || '',
    amount: t.amount,
    commission: t.commission,
    commissionRate: t.commissionRate,
    storeAmount: t.storeAmount,
    status: t.status,
    method: t.method || '',
    paymentStatus: t.status === 'PAID' || t.status === 'SETTLED' ? 'paid' : t.status === 'REFUNDED' ? 'refunded' : 'pending',
    createdAt: t.createdAt || '',
    paidAt: t.paidAt,
    invoiceUrl: t.invoiceUrl,
  }));

  const filteredTxns = filterTransactions(transactions, {
    searchTerm,
    status: statusFilter,
    method: methodFilter,
  });

  const summary = getTransactionSummary(filteredTxns);
  
  const totalAmount = summary.totalAmount;
  const totalCommission = summary.totalCommission;
  const totalStore = summary.totalStoreEarnings;

  const exportCSVHandler = () => {
    const csv = exportToCSV(filteredTxns);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Typography variant="h2">Transaction Records</Typography>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={exportCSVHandler}>Export CSV</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search order, store, or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Methods</option>
            <option value="gcash">GCash</option>
            <option value="paymaya">PayMaya</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-600">Total Transactions</div>
          <div className="text-2xl font-bold mt-1">{summary.totalTransactions}</div>
          <div className="text-xs text-gray-500 mt-1">
            Paid: {summary.paidCount} | Pending: {summary.pendingCount}
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-xs text-gray-500 mt-1">All payments</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-600">Platform Commission</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {formatCurrency(totalCommission)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Your earnings</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-sm text-gray-600">Store Earnings</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">
            {formatCurrency(totalStore)}
          </div>
          <div className="text-xs text-gray-500 mt-1">To be paid out</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-secondary-200 overflow-hidden">
        {/* Top tabs under header for consistency with design */}
        <div className="px-4 pt-4 border-b border-secondary-200 flex items-center space-x-4">
          <button className="px-3 py-2 text-sm font-medium rounded-t-lg bg-white text-tindago-700 border-b-2 border-tindago-500">Transactions</button>
          <a href="/payouts" className="px-3 py-2 text-sm font-medium rounded-t-lg text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100">Payouts Summary</a>
          <button disabled className="px-3 py-2 text-sm font-medium rounded-t-lg text-secondary-400 cursor-not-allowed">Refunds (soon)</button>
        </div>

        <TransactionsTable 
          rows={filteredTxns.map(t => ({
            invoiceId: t.invoiceId,
            orderNumber: t.orderNumber,
            storeId: t.storeId,
            storeName: t.storeName,
            amount: t.amount,
            commission: t.commission,
            commissionRate: t.commissionRate,
            storeAmount: t.storeAmount,
            method: t.method,
            status: t.status,
            createdAt: t.createdAt,
            paidAt: t.paidAt,
            settledAt: undefined,
            invoiceUrl: t.invoiceUrl,
          } as LedgerTxn))} 
          loading={loading} 
          onExport={() => exportCSVHandler()} 
        />
      </div>
    </div>
  );
}
