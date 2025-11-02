import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';
import { PLATFORM_COMMISSION_RATE } from '@/lib/config';

const GLOBAL_RATE_PATH = 'settings/platform/commissionRate';
const STORE_RATE_PATH = (storeId: string) => `settings/stores/${storeId}/commissionRate`;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const db = getAdminDb();

    if (storeId) {
      const storeSnap = await db.ref(STORE_RATE_PATH(storeId)).get();
      if (storeSnap.exists() && typeof storeSnap.val() === 'number') {
        return NextResponse.json({ rate: storeSnap.val(), scope: 'store', storeId });
      }
      // fall through to global
    }

    let rate = PLATFORM_COMMISSION_RATE;
    const snap = await db.ref(GLOBAL_RATE_PATH).get();
    if (snap.exists() && typeof snap.val() === 'number') {
      rate = snap.val();
    } else {
      // seed default for convenience
      await db.ref(GLOBAL_RATE_PATH).set(rate);
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
    const db = getAdminDb();
    if (storeId) {
      await db.ref(STORE_RATE_PATH(storeId)).set(rate);
      return NextResponse.json({ ok: true, scope: 'store', storeId, rate });
    }
    await db.ref(GLOBAL_RATE_PATH).set(rate);
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
    const db = getAdminDb();
    await db.ref(STORE_RATE_PATH(storeId)).set(null);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
