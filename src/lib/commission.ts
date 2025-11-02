import { PLATFORM_COMMISSION_RATE } from './config';

// Cache in-memory for brief period to avoid frequent calls on hot paths
let cachedRate: { value: number; expiresAt: number } | null = null;

export async function getCommissionRate(storeId?: string): Promise<number> {
  // Global with 5-min cache (only applies when no storeId)
  const now = Date.now();
  if (!storeId && cachedRate && cachedRate.expiresAt > now) return cachedRate.value;

  const url = storeId
    ? `/api/admin/settings/commission?storeId=${encodeURIComponent(storeId)}`
    : `/api/admin/settings/commission`;

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const rate = typeof data.rate === 'number' ? data.rate : PLATFORM_COMMISSION_RATE;

  if (!storeId) {
    cachedRate = { value: rate, expiresAt: now + 5 * 60 * 1000 };
  }
  return rate;
}

export async function setCommissionRate(rate: number): Promise<void> {
  if (Number.isNaN(rate) || rate < 0 || rate > 1) {
    throw new Error('commissionRate must be between 0 and 1');
  }
  const res = await fetch('/api/admin/settings/commission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate }),
  });
  if (!res.ok) throw new Error(await res.text());
  cachedRate = null;
}

export async function setStoreCommissionRate(storeId: string, rate: number): Promise<void> {
  if (!storeId) throw new Error('storeId required');
  if (Number.isNaN(rate) || rate < 0 || rate > 1) {
    throw new Error('commissionRate must be between 0 and 1');
  }
  const res = await fetch(`/api/admin/settings/commission?storeId=${encodeURIComponent(storeId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rate }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function clearStoreCommissionRate(storeId: string): Promise<void> {
  const res = await fetch(`/api/admin/settings/commission?storeId=${encodeURIComponent(storeId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(await res.text());
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
