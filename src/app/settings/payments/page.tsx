'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import {
  getCommissionRate,
  setCommissionRate,
  setStoreCommissionRate,
  clearStoreCommissionRate,
} from '@/lib/commission';
import { Typography } from '@/components/ui/Typography';
import { PLATFORM_COMMISSION_RATE } from '@/lib/config';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface Store {
  id: string;
  name: string;
  customRate?: number;
}

export default function PaymentsSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [rate, setRate] = useState<number>(0.01);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    (async () => {
      const r = await getCommissionRate();
      setRate(r);
      await loadStores();
      setLoading(false);
    })();
  }, []);

  const loadStores = async () => {
    const storesRef = ref(database, 'stores');
    const storesSnap = await get(storesRef);

    if (!storesSnap.exists()) return;

    const storesData = storesSnap.val();
    const settingsRef = ref(database, 'settings/stores');
    const settingsSnap = await get(settingsRef);
    const settingsData = settingsSnap.exists() ? settingsSnap.val() : {};

    const storeList: Store[] = Object.keys(storesData).map((id) => ({
      id,
      name: storesData[id].name || 'Unknown Store',
      customRate: settingsData[id]?.commissionRate,
    }));

    setStores(storeList);
  };

  const filteredStores = useMemo(() => {
    const needle = search.toLowerCase();
    return stores.filter((s) => !needle || s.name.toLowerCase().includes(needle) || s.id.toLowerCase().includes(needle));
  }, [stores, search]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / pageSize));
  const start = (page - 1) * pageSize;
  const current = filteredStores.slice(start, start + pageSize);

  const customCount = useMemo(() => stores.filter(s => s.customRate !== undefined).length, [stores]);

  const handleSave = async () => {
    setSaving(true);
    await setCommissionRate(rate);
    setSaving(false);
    alert('Global commission rate saved');
  };

  const handleStoreRateSave = async (storeId: string) => {
    setSaving(true);
    await setStoreCommissionRate(storeId, tempRate);
    await loadStores();
    setEditingStore(null);
    setSaving(false);
  };

  const handleStoreRateClear = async (storeId: string) => {
    setSaving(true);
    await clearStoreCommissionRate(storeId);
    await loadStores();
    setSaving(false);
  };

  const startEditStore = (store: Store) => {
    setEditingStore(store.id);
    setTempRate(store.customRate || rate);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden lg:overflow-visible"
      style={{ width: '100vw', maxWidth: '1440px', minHeight: '1024px', backgroundColor: '#F3F5F9', margin: '0 auto' }}
    >
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="settings/payments" />

      {/* Main container */}
      <div className="absolute lg:left-[273px] left-0 lg:w-[1167px] w-full" style={{ top: 0, minHeight: '1024px' }}>
        {/* Header */}
        <div className="absolute w-full" style={{ left: 0, top: 0, height: '80px', zIndex: 10 }}>
          <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Content */}
        <div className="absolute w-full" style={{ left: 0, top: '80px', minHeight: '944px' }}>
          <div className="p-5 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <Typography variant="h2">Payment Settings</Typography>
                <p className="text-sm text-gray-600 mt-1">Configure platform commission globally and per-store. Changes apply to new invoices only.</p>
              </div>
              <a href="/transactions" className="text-sm text-emerald-600 hover:underline">← Back to Transactions</a>
            </div>

            {/* Banner */}
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">⚠️ Updating the commission here affects the fee on <span className="font-medium">future</span> payments. Existing transactions are not changed.</p>
            </div>

            {/* Global card */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">Global Commission Rate</div>
                  <div className="text-xs text-gray-500">Default from environment: {(PLATFORM_COMMISSION_RATE * 100).toFixed(2)}%</div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium" style={{backgroundColor:'#ECFDF5',color:'#047857',borderRadius:999,padding:'4px 12px'}}>{(rate * 100).toFixed(2)}%</div>
              </div>
              <div className="mt-4 flex items-end gap-4 flex-wrap" style={{display:'flex',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Platform Commission (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={(rate * 100).toFixed(2)}
                    onChange={(e) => setRate(Math.max(0, Math.min(100, parseFloat(e.target.value || '0'))) / 100)}
                    className="border rounded-lg px-3 py-2 w-32"
                    disabled={loading}
                  />
                </div>
                <div className="text-sm text-gray-500 mb-2">= ₱{(rate * 100).toFixed(2)} per ₱100</div>
                <div className="ml-auto">
                  <button onClick={handleSave} disabled={saving}
                    style={{
                      backgroundColor:'#10B981',
                      color:'#FFFFFF',
                      border:'1px solid #10B981',
                      borderRadius:12,
                      padding:'10px 16px',
                      fontFamily:'Clash Grotesk Variable',
                      fontWeight:600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1
                    }}
                  >{saving ? 'Saving…' : 'Save Global Rate'}</button>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16}}>
              <div className="bg-white border rounded-2xl p-4 shadow-sm" style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:16,padding:16}}>
                <div className="text-sm text-gray-600">Current Global Rate</div>
                <div className="text-2xl font-semibold" style={{marginTop:4}}>{(rate*100).toFixed(2)}%</div>
              </div>
              <div className="bg-white border rounded-2xl p-4 shadow-sm" style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:16,padding:16}}>
                <div className="text-sm text-gray-600">Stores With Custom Rate</div>
                <div className="text-2xl font-semibold" style={{marginTop:4}}>{customCount}</div>
              </div>
              <div className="bg-white border rounded-2xl p-4 shadow-sm" style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:16,padding:16}}>
                <div className="text-sm text-gray-600">Env Default</div>
                <div className="text-2xl font-semibold" style={{marginTop:4}}>{(PLATFORM_COMMISSION_RATE*100).toFixed(2)}%</div>
              </div>
            </div>

            {/* Stores card */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm" style={{background:'#FFFFFF',border:'1px solid rgba(0,0,0,0.06)',borderRadius:16,padding:24}}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-semibold">Store-Specific Commission Rates</div>
                  <div className="text-sm text-gray-600">Override the global rate for specific stores.</div>
                </div>
                <div className="text-xs text-gray-500">Unspecified stores use the global rate.</div>
              </div>

              {/* Search */}
              <div className="flex items-center gap-3 mb-3" style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <input
                  placeholder="Search stores by name or ID..."
                  value={search}
                  onChange={(e)=>{ setPage(1); setSearch(e.target.value); }}
                  className="border rounded-lg px-3 py-2 w-80"
                  style={{border:'1px solid rgba(0,0,0,0.1)',borderRadius:12,padding:'10px 12px',width:320}}
                />
                <select value={pageSize} onChange={(e)=>{ setPage(1); setPageSize(parseInt(e.target.value,10)); }}
                  className="border rounded-lg px-3 py-2"
                  style={{border:'1px solid rgba(0,0,0,0.1)',borderRadius:12,padding:'10px 12px'}}>
                  {[10,20,50].map(n => (<option key={n} value={n}>{n}/page</option>))}
                </select>
                <button onClick={()=>{
                  const rows = filteredStores.map(s=>({ id:s.id, name:s.name, rate:(s.customRate ?? rate) }));
                  const headers = 'Store,Store ID,Rate%\n';
                  const csv = headers + rows.map(r=>`${r.name},${r.id},${((r.rate)*100).toFixed(2)}`).join('\n');
                  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'store-commission-rates.csv'; a.click(); URL.revokeObjectURL(url);
                }}
                  style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'8px 12px',fontSize:12,fontWeight:600}}>Export CSV</button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-sm text-gray-500">Loading stores...</div>
              ) : filteredStores.length === 0 ? (
                <div className="text-sm text-gray-500">No stores found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm text-secondary-600 font-medium">Store</th>
                        <th className="px-4 py-2 text-left text-sm text-secondary-600 font-medium">Store ID</th>
                        <th className="px-4 py-2 text-left text-sm text-secondary-600 font-medium">Rate</th>
                        <th className="px-4 py-2 text-right text-sm text-secondary-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200 bg-white">
                      {current.map((store) => (
                        <tr key={store.id} className="hover:bg-secondary-50">
                          <td className="px-4 py-3 text-sm font-medium text-secondary-900 max-w-[280px] truncate">{store.name}</td>
                          <td className="px-4 py-3 text-sm text-secondary-600 max-w-[280px] truncate">{store.id}</td>
                          <td className="px-4 py-3">
                            {editingStore === store.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  max={100}
                                  value={(tempRate * 100).toFixed(2)}
                                  onChange={(e)=>setTempRate(Math.max(0, Math.min(100, parseFloat(e.target.value || '0'))) / 100)}
                                  className="border rounded px-2 py-1 w-20 text-sm"
                                />
                                <span className="text-sm">%</span>
                              </div>
                            ) : (
                              <div>
                                {store.customRate !== undefined ? (
                                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded text-sm font-medium">{(store.customRate * 100).toFixed(2)}% custom</span>
                                ) : (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">{(rate * 100).toFixed(2)}% global</span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingStore === store.id ? (
                              <div className="flex items-center gap-2 justify-end">
                                <button onClick={() => handleStoreRateSave(store.id)} disabled={saving}
                                  style={{background:'#10B981',color:'#fff',border:'1px solid #10B981',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600}}>
                                  {saving ? 'Saving…' : 'Save'}
                                </button>
                                <button onClick={() => setEditingStore(null)}
                                  style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600}}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 justify-end">
                                {store.customRate !== undefined ? (
                                  <>
                                    <button onClick={() => startEditStore(store)}
                                      style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600}}>
                                      Edit
                                    </button>
                                    <button onClick={() => handleStoreRateClear(store.id)} disabled={saving}
                                      style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600}}>
                                      {saving ? 'Clearing…' : 'Clear'}
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => startEditStore(store)}
                                    style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600}}>
                                    Set Custom
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">Showing {Math.min(filteredStores.length, start+1)}–{Math.min(filteredStores.length, start+pageSize)} of {filteredStores.length}</div>
                <div className="flex items-center gap-2">
                  <button onClick={()=> setPage(p=> Math.max(1, p-1))} disabled={page===1}
                    style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600,opacity: page===1?0.5:1}}>Prev</button>
                  <span className="text-sm">Page {page} / {totalPages}</span>
                  <button onClick={()=> setPage(p=> Math.min(totalPages, p+1))} disabled={page===totalPages}
                    style={{background:'#FFFFFF',color:'#1E1E1E',border:'1px solid rgba(0,0,0,0.1)',borderRadius:10,padding:'6px 10px',fontSize:12,fontWeight:600,opacity: page===totalPages?0.5:1}}>Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
