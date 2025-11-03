import { NextResponse } from 'next/server';

import { PLATFORM_COMMISSION_RATE } from '@/lib/config';

const GLOBAL_RATE_PATH = 'settings/platform/commissionRate';
const STORE_RATE_PATH = (storeId: string) => `settings/stores/${storeId}/commissionRate`;


// Helper function to fetch from Firebase REST API
async function fetchFirebase(path: string) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const url = `${dbUrl}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch from Firebase');
  return res.json();
}

// Helper function to set Firebase data via REST API
async function setFirebase(path: string, value: any) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const url = `${dbUrl}/${path}.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value)
  });
  if (!res.ok) throw new Error('Failed to set Firebase data');
  return res.json();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (storeId) {
      const storeRate = await fetchFirebase(STORE_RATE_PATH(storeId));
      if (storeRate !== null && typeof storeRate === 'number') {
        return NextResponse.json({ rate: storeRate, scope: 'store', storeId });
      }
      // fall through to global
    }

    let rate = PLATFORM_COMMISSION_RATE;
    const globalRate = await fetchFirebase(GLOBAL_RATE_PATH);
    if (globalRate !== null && typeof globalRate === 'number') {
      rate = globalRate;
    } else {
      // seed default for convenience
      await setFirebase(GLOBAL_RATE_PATH, rate);
    }
    return NextResponse.json({ rate, scope: 'global' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const body = await request.json().catch(() => ({}));
    const rate = Number(body?.rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
      return NextResponse.json({ error: 'commissionRate must be between 0 and 1' }, { status: 400 });
    }

    if (storeId) {
      await setFirebase(STORE_RATE_PATH(storeId), rate);
      return NextResponse.json({ ok: true, scope: 'store', storeId, rate });
    }
    await setFirebase(GLOBAL_RATE_PATH, rate);
    return NextResponse.json({ ok: true, scope: 'global', rate });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

    await setFirebase(STORE_RATE_PATH(storeId), null);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
