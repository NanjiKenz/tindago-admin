import { NextResponse } from 'next/server';



// Helper function to fetch from Firebase REST API
async function fetchFirebase(path: string) {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
  const url = `${dbUrl}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch from Firebase');
  return res.json();
}

export async function GET() {
  try {
    // Fetch stores and registrations data - REST API returns plain JSON
    const storesData = await fetchFirebase('stores');
    const registrationsData = await fetchFirebase('store_registrations');

    // Handle null/empty responses
    const stores = storesData && typeof storesData === 'object' ? Object.values(storesData) : [];
    const registrations = registrationsData && typeof registrationsData === 'object' ? Object.values(registrationsData) : [];

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
