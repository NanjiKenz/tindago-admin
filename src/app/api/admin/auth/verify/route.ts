import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

    const db = getAdminDb();
    const snap = await db.ref(`admins/${uid}`).get();
    if (!snap.exists()) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    const adminData = snap.val() || {};
    const nowIso = new Date().toISOString();
    await db.ref(`admins/${uid}`).update({ lastLogin: nowIso });

    return NextResponse.json({
      uid,
      email: adminData.email || '',
      displayName: adminData.displayName || '',
      role: adminData.role || 'admin',
      createdAt: adminData.createdAt || nowIso,
      lastLogin: nowIso,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
