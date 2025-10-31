'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

export type TxStatus = 'PENDING' | 'PAID' | 'SETTLED' | 'EXPIRED' | 'VOIDED' | string;

export interface LedgerTxn {
  invoiceId: string;
  orderNumber?: string;
  storeId: string;
  storeName?: string;
  amount: number;
  commission: number;
  commissionRate: number;
  storeAmount: number;
  method?: string;
  status: TxStatus;
  createdAt?: string;
  paidAt?: string;
  settledAt?: string;
  invoiceUrl?: string;
}

interface Props {
  rows: LedgerTxn[];
  loading?: boolean;
  onExport?: (rows: LedgerTxn[]) => void;
}

export const TransactionsTable: React.FC<Props> = ({ rows, loading = false, onExport }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TxStatus>('all');
  const [method, setMethod] = useState<'all' | 'GCASH' | 'PAYMAYA' | 'CARD' | string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selected, setSelected] = useState<LedgerTxn | null>(null);

  const filtered = useMemo(() => {
    const needle = search.toLowerCase();
    const fromMs = dateFrom ? new Date(dateFrom).getTime() : undefined;
    const toMs = dateTo ? new Date(dateTo).getTime() + 24*60*60*1000 - 1 : undefined; // inclusive end

    return rows.filter(r => {
      const matchesStatus = status === 'all' || r.status === status;
      const matchesMethod = method === 'all' || (r.method || '').toUpperCase().includes(method);
      const matchesSearch = !needle || [r.invoiceId, r.orderNumber, r.storeId, r.storeName]
        .filter(Boolean)
        .some(v => v!.toString().toLowerCase().includes(needle));
      const matchesStore = storeFilter === 'all' || r.storeId === storeFilter;
      const createdMs = r.createdAt ? new Date(r.createdAt).getTime() : undefined;
      const matchesDate = createdMs === undefined || (
        (fromMs === undefined || createdMs >= fromMs) &&
        (toMs === undefined || createdMs <= toMs)
      );
      return matchesStatus && matchesMethod && matchesSearch && matchesStore && matchesDate;
    });
  }, [rows, search, status, method, storeFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  const exportCSV = () => {
    if (!onExport) return;
    onExport(filtered);
  };

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search */}
          <div className="relative">
            <input
              className="border rounded-lg px-3 py-2 w-80"
              placeholder="Search by invoice, order #, store..."
              value={search}
              onChange={(e)=>{ setPage(1); setSearch(e.target.value); }}
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-2">
            {([
              {key:'all', label:'All'},
              {key:'PAID', label:'Paid'},
              {key:'PENDING', label:'Pending'},
              {key:'SETTLED', label:'Settled'},
              {key:'EXPIRED', label:'Expired'},
              {key:'VOIDED', label:'Voided'}
            ] as any[]).map(p => (
              <button
                key={p.key}
                onClick={()=>{ setPage(1); setStatus(p.key); }}
                className={`px-3 py-2 text-sm rounded-xl border ${status===p.key ? 'bg-tindago-50 text-tindago-700 border-tindago-200' : 'text-secondary-600 border-secondary-300 hover:bg-secondary-100'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Method pills */}
          <div className="flex items-center gap-2">
            {(['all','GCASH','PAYMAYA','CARD'] as const).map(m => (
              <button
                key={m}
                onClick={()=>{ setPage(1); setMethod(m); }}
                className={`px-3 py-2 text-sm rounded-xl border ${method===m ? 'bg-white text-tindago-700 border-tindago-200' : 'text-secondary-600 border-secondary-300 hover:bg-secondary-100'}`}
              >
                {m === 'all' ? 'All Methods' : m}
              </button>
            ))}
          </div>

          {/* Store filter */}
          <div className="flex items-center gap-2">
            <select
              className="border rounded-lg px-3 py-2"
              value={storeFilter}
              onChange={(e)=>{ setPage(1); setStoreFilter(e.target.value); }}
            >
              <option value="all">All Stores</option>
              {[...new Map(rows.map(r => [r.storeId, r.storeName || r.storeId])).entries()].map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            {/* Date range */}
            <div className="flex items-center gap-2">
              <input type="date" className="border rounded-lg px-3 py-2" value={dateFrom} onChange={(e)=>{ setPage(1); setDateFrom(e.target.value); }} />
              <span className="text-secondary-500">to</span>
              <input type="date" className="border rounded-lg px-3 py-2" value={dateTo} onChange={(e)=>{ setPage(1); setDateTo(e.target.value); }} />
              {/* Quick ranges */}
              {([
                {key:'7d', label:'7d'},
                {key:'30d', label:'30d'},
                {key:'m', label:'This month'},
                {key:'clr', label:'Clear'}
              ] as const).map(q => (
                <button
                  key={q.key}
                  onClick={()=>{
                    const now = new Date();
                    if (q.key === '7d') { const d = new Date(); d.setDate(now.getDate()-6); setDateFrom(d.toISOString().slice(0,10)); setDateTo(now.toISOString().slice(0,10)); }
                    else if (q.key === '30d') { const d = new Date(); d.setDate(now.getDate()-29); setDateFrom(d.toISOString().slice(0,10)); setDateTo(now.toISOString().slice(0,10)); }
                    else if (q.key === 'm') { const d = new Date(now.getFullYear(), now.getMonth(), 1); setDateFrom(d.toISOString().slice(0,10)); setDateTo(now.toISOString().slice(0,10)); }
                    else { setDateFrom(''); setDateTo(''); }
                    setPage(1);
                  }}
                  className="px-2 py-1 text-xs rounded-lg border border-secondary-300 text-secondary-600 hover:bg-secondary-100"
                >{q.label}</button>
              ))}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <select className="border rounded-lg px-2 py-2" value={pageSize} onChange={(e)=>{ setPage(1); setPageSize(parseInt(e.target.value, 10)); }}>
              {[10,20,50].map(n=> (<option key={n} value={n}>{n}/page</option>))}
            </select>
            <Button variant="outline" onClick={exportCSV}>Export CSV</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Transaction</th>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Store</th>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Amount</th>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Commission</th>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Store Amount</th>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Status</th>
              <th className="px-4 py-2 text-left text-xs text-secondary-500">Created</th>
              <th className="px-4 py-2 text-right text-xs text-secondary-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="px-4 py-6" colSpan={8}>Loading...</td></tr>
            ) : current.length === 0 ? (
              <tr><td className="px-4 py-6" colSpan={8}>No transactions</td></tr>
            ) : (
              current.map(t => (
                <tr key={t.invoiceId} className="hover:bg-secondary-50">
                  <td className="px-4 py-2">
                    <div className="text-sm font-medium text-secondary-900">{t.invoiceId}</div>
                    <div className="text-xs text-secondary-500">{t.method || '—'} • {t.orderNumber || ''}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-sm text-secondary-900">{t.storeName || t.storeId}</div>
                    <div className="text-xs text-secondary-500">{t.storeId}</div>
                  </td>
                  <td className="px-4 py-2">₱ {t.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">₱ {t.commission.toFixed(2)} <span className="text-xs text-secondary-500">({(t.commissionRate*100).toFixed(2)}%)</span></td>
                  <td className="px-4 py-2">₱ {t.storeAmount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${t.status==='PAID'||t.status==='SETTLED'?'bg-green-100 text-green-700':'bg-secondary-100 text-secondary-700'}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-secondary-900">{t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="outline" onClick={()=>setSelected(t)}>View</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-secondary-200">
        <div className="text-sm text-secondary-600">Page {page} of {totalPages} • {filtered.length} results</div>
        <div className="space-x-2">
          <Button variant="outline" onClick={()=>setPage(p=>Math.max(1, p-1))} disabled={page===1}>Previous</Button>
          <Button variant="outline" onClick={()=>setPage(p=>Math.min(totalPages, p+1))} disabled={page===totalPages}>Next</Button>
        </div>
      </div>

      {/* Details Drawer */}
      {selected && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black bg-opacity-25" onClick={()=>setSelected(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-xl flex flex-col">
            <div className="px-5 py-4 border-b border-secondary-200 flex items-center justify-between">
              <div className="text-lg font-semibold">Transaction Details</div>
              <button className="text-secondary-600" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="p-5 space-y-3 overflow-auto">
              <div className="text-sm text-secondary-600">Invoice ID</div>
              <div className="text-secondary-900">{selected.invoiceId}</div>
              <div className="text-sm text-secondary-600">Order #</div>
              <div className="text-secondary-900">{selected.orderNumber || '—'}</div>
              <div className="text-sm text-secondary-600">Store</div>
              <div className="text-secondary-900">{selected.storeName || selected.storeId}</div>
              <div className="text-sm text-secondary-600">Amount</div>
              <div className="text-secondary-900">₱ {selected.amount.toFixed(2)} (Commission ₱ {selected.commission.toFixed(2)} • {(selected.commissionRate*100).toFixed(2)}%)</div>
              <div className="text-sm text-secondary-600">Status</div>
              <div className="text-secondary-900">{selected.status}</div>
              {selected.invoiceUrl && (
                <div className="pt-2">
                  <a className="text-tindago-700 underline" href={selected.invoiceUrl} target="_blank" rel="noopener noreferrer">Open invoice on Xendit</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
