import { ref, get, set } from 'firebase/database';
import { database } from './firebase.js';
import { PLATFORM_COMMISSION_RATE } from './config';

const GLOBAL_RATE_PATH = 'settings/platform/commissionRate';
const STORE_RATE_PATH = (storeId: string) => `settings/stores/${storeId}/commissionRate`;

// Cache in-memory for brief period to avoid frequent RTDB reads on hot paths
let cachedRate: { value: number; expiresAt: number } | null = null;

export async function getCommissionRate(storeId?: string): Promise<number> {
  // Per-store override
  if (storeId) {
    const storeRef = ref(database, STORE_RATE_PATH(storeId));
    const storeSnap = await get(storeRef);
    if (storeSnap.exists() && typeof storeSnap.val() === 'number') {
      return storeSnap.val();
    }
  }

  // Global with 5-min cache
  const now = Date.now();
  if (cachedRate && cachedRate.expiresAt > now) return cachedRate.value;

  const globalRef = ref(database, GLOBAL_RATE_PATH);
  const snap = await get(globalRef);

  let rate = PLATFORM_COMMISSION_RATE; // default from env
  if (snap.exists() && typeof snap.val() === 'number') {
    rate = snap.val();
  } else {
    await set(globalRef, rate); // seed default
  }

  cachedRate = { value: rate, expiresAt: now + 5 * 60 * 1000 };
  return rate;
}

export async function setCommissionRate(rate: number): Promise<void> {
  if (Number.isNaN(rate) || rate < 0 || rate > 1) {
    throw new Error('commissionRate must be between 0 and 1');
    }
  await set(ref(database, GLOBAL_RATE_PATH), rate);
  cachedRate = null;
}

export async function setStoreCommissionRate(storeId: string, rate: number): Promise<void> {
  if (!storeId) throw new Error('storeId required');
  if (Number.isNaN(rate) || rate < 0 || rate > 1) {
    throw new Error('commissionRate must be between 0 and 1');
  }
  await set(ref(database, STORE_RATE_PATH(storeId)), rate);
}

export async function clearStoreCommissionRate(storeId: string): Promise<void> {
  await set(ref(database, STORE_RATE_PATH(storeId)), null);
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}
