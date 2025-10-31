'use client';

import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { 
  getCommissionRate, 
  setCommissionRate, 
  setStoreCommissionRate, 
  clearStoreCommissionRate 
} from '@/lib/commission';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { PLATFORM_COMMISSION_RATE } from '@/lib/config';

interface Store {
  id: string;
  name: string;
  customRate?: number;
}

export default function PaymentsSettingsPage() {
  const [rate, setRate] = useState<number>(0.01);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);

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
    
    const storeList: Store[] = Object.keys(storesData).map(id => ({
      id,
      name: storesData[id].name || 'Unknown Store',
      customRate: settingsData[id]?.commissionRate,
    }));
    
    setStores(storeList);
  };

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
    <div className="p-6 space-y-6">
      <Typography variant="h2">Payment Settings</Typography>
      
      {/* Global Commission Rate */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <div className="text-lg font-semibold mb-4">Global Commission Rate</div>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Platform Commission (%)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                max={100}
                value={(rate * 100).toFixed(2)}
                onChange={(e)=>setRate(Math.max(0, Math.min(100, parseFloat(e.target.value || '0'))) / 100)}
                className="border rounded-lg px-3 py-2 w-32"
                disabled={loading}
              />
            </div>
            <div className="text-sm text-gray-500 mt-6">
              = ₱{((rate * 100)).toFixed(2)} per ₱100
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Default from environment: {(PLATFORM_COMMISSION_RATE * 100).toFixed(2)}%
          </div>
        </div>
        <Button onClick={handleSave} loading={saving}>Save Global Rate</Button>
        <div className="text-xs text-gray-500">Applies to all new invoices by default.</div>
      </div>

      {/* Store-Specific Rates */}
      <div className="bg-white border rounded-xl p-6 space-y-4">
        <div className="text-lg font-semibold">Store-Specific Commission Rates</div>
        <div className="text-sm text-gray-600 mb-4">
          Override the global rate for specific stores. If not set, the global rate applies.
        </div>
        
        {loading ? (
          <div className="text-sm text-gray-500">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="text-sm text-gray-500">No stores found</div>
        ) : (
          <div className="space-y-2">
            {stores.map(store => (
              <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium">{store.name}</div>
                  <div className="text-xs text-gray-500">{store.id}</div>
                </div>
                
                {editingStore === store.id ? (
                  <div className="flex items-center space-x-2">
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
                    <Button size="sm" onClick={() => handleStoreRateSave(store.id)} loading={saving}>
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingStore(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    {store.customRate !== undefined ? (
                      <>
                        <div className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          {(store.customRate * 100).toFixed(2)}% (custom)
                        </div>
                        <Button size="sm" variant="outline" onClick={() => startEditStore(store)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStoreRateClear(store.id)} loading={saving}>
                          Clear
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                          {(rate * 100).toFixed(2)}% (global)
                        </div>
                        <Button size="sm" variant="outline" onClick={() => startEditStore(store)}>
                          Set Custom
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}