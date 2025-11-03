import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

    // Direct REST API call to Firebase (bypasses security rules using service account)
    const databaseURL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
    if (!databaseURL) {
      return NextResponse.json({ error: 'Database URL not configured' }, { status: 500 });
    }

    // Fetch admin data using REST API
    const adminUrl = `${databaseURL}/admins/${uid}.json`;
    const adminRes = await fetch(adminUrl);

    if (!adminRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
    }

    const adminData = await adminRes.json();

    if (!adminData) {
      return NextResponse.json({ error: 'Access denied. Admin privileges required.' }, { status: 403 });
    }

    // Update last login using REST API
    const nowIso = new Date().toISOString();
    const updateUrl = `${databaseURL}/admins/${uid}/lastLogin.json`;
    await fetch(updateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nowIso)
    });

    return NextResponse.json({
      uid,
      email: adminData.email || '',
      displayName: adminData.displayName || adminData.name || '',
      role: adminData.role || 'admin',
      createdAt: adminData.createdAt || nowIso,
      lastLogin: nowIso,
    });
  } catch (e: any) {
    console.error('Admin verify error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
