'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCommissionRate, setStoreCommissionRate, clearStoreCommissionRate } from '@/lib/commission';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';

export default function StorePaymentsSettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [globalRate, setGlobalRate] = useState<number>(0.01);
  const [storeRate, setStoreRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const g = await getCommissionRate();
      setGlobalRate(g);
      const snap = await get(ref(database, `settings/stores/${storeId}/commissionRate`));
      setStoreRate(snap.exists() ? snap.val() : null);
      setLoading(false);
    })();
  }, [storeId]);

  const effective = storeRate ?? globalRate;

  const handleSave = async () => {
    if (storeRate == null) return; // nothing to save; user should click Clear or input a value
    setSaving(true);
    await setStoreCommissionRate(storeId, storeRate);
    setSaving(false);
    alert('Store commission rate saved');
  };

  const handleClear = async () => {
    setSaving(true);
    await clearStoreCommissionRate(storeId);
    setStoreRate(null);
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-6">
      <Typography variant="h2">Store Payment Settings</Typography>
      <div className="bg-white border rounded-xl p-6 max-w-xl space-y-4">
        <div className="text-sm text-gray-600">Store ID: {storeId}</div>
        <div className="space-y-2">
          <div className="text-sm text-gray-700">Effective Commission (%)</div>
          <div className="text-2xl font-semibold">{(effective * 100).toFixed(2)}%</div>
          {storeRate == null && (
            <div className="text-xs text-gray-500">Using global rate ({(globalRate * 100).toFixed(2)}%).</div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Override Store Commission (%)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            max={100}
            value={storeRate == null ? '' : (storeRate * 100).toFixed(2)}
            placeholder="Leave blank to inherit global"
            onChange={(e)=>{
              const v = e.target.value;
              if (v === '') { setStoreRate(null); return; }
              const num = Math.max(0, Math.min(100, parseFloat(v || '0')));
              setStoreRate(num / 100);
            }}
            className="border rounded-lg px-3 py-2 w-48"
            disabled={loading}
          />
        </div>

        <div className="flex space-x-3">
          <Button onClick={handleSave} loading={saving} disabled={storeRate == null}>Save Override</Button>
          <Button variant="outline" onClick={handleClear} disabled={storeRate == null || saving}>Clear Override</Button>
        </div>
      </div>
    </div>
  );
}