import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch stores data
    const storesSnap = await db.ref('stores').get();
    const stores = storesSnap.exists() ? Object.values(storesSnap.val() || {}) : [];

    // Fetch store registrations data
    const registrationsSnap = await db.ref('store_registrations').get();
    const registrations = registrationsSnap.exists() ? Object.values(registrationsSnap.val() || {}) : [];

    // Calculate statistics
    const activeStores = stores.filter((s: any) => s.status === 'active').length;
    const pendingStores = stores.filter((s: any) => s.status === 'pending').length;
    const suspendedStores = stores.filter((s: any) => s.status === 'suspended').length;
    const rejectedStores = stores.filter((s: any) => s.status === 'rejected').length;

    // Add pending registrations
    const pendingRegistrations = registrations.filter((r: any) =>
      r.status === 'pending' || r.status === 'completed_pending' || r.status === 'pending_approval' || !r.status
    ).length;

    const totalPending = pendingStores + pendingRegistrations;

    return NextResponse.json({
      activeStores,
      pendingStores: totalPending,
      suspendedStores,
      rejectedStores,
      totalStores: stores.length,
    });
  } catch (error) {
    console.error('Error fetching store stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch store statistics' },
      { status: 500 }
    );
  }
}
