import { NextResponse } from 'next/server';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { PLATFORM_COMMISSION_RATE } from '@/lib/config';

export const runtime = 'nodejs';

const GLOBAL_RATE_PATH = 'settings/platform/commissionRate';
const STORE_RATE_PATH = (storeId: string) => `settings/stores/${storeId}/commissionRate`;

async function getValue(path: string) {
  const snap = await get(ref(database, path));
  return snap.exists() ? snap.val() : null;
}

async function setValue(path: string, value: any) {
  await set(ref(database, path), value);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (storeId) {
      const storeRate = await getValue(STORE_RATE_PATH(storeId));
      if (storeRate !== null && typeof storeRate === 'number') {
        return NextResponse.json({ rate: storeRate, scope: 'store', storeId });
      }
      // fall through to global
    }

    let rate = PLATFORM_COMMISSION_RATE;
    const globalRate = await getValue(GLOBAL_RATE_PATH);
    if (globalRate !== null && typeof globalRate === 'number') {
      rate = globalRate;
    } else {
      await setValue(GLOBAL_RATE_PATH, rate); // seed default
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
      await setValue(STORE_RATE_PATH(storeId), rate);
      return NextResponse.json({ ok: true, scope: 'store', storeId, rate });
    }
    await setValue(GLOBAL_RATE_PATH, rate);
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

    await setValue(STORE_RATE_PATH(storeId), null);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
