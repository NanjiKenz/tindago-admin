import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

/**
 * Get all stores with registrations combined
 * Combines both 'stores' collection and 'store_registrations' for unified view
 */
export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch both stores and registrations
    const [storesSnap, registrationsSnap] = await Promise.all([
      db.ref('stores').get(),
      db.ref('store_registrations').get(),
    ]);

    const storesData = storesSnap.exists() ? storesSnap.val() : {};
    const registrationsData = registrationsSnap.exists() ? registrationsSnap.val() : {};

    // Convert stores to array
    const stores = Object.entries(storesData).map(([id, store]: [string, any]) => ({
      storeId: id,
      ...store,
      source: 'stores',
    }));

    // Convert registrations to array (pending stores)
    const registrations = Object.entries(registrationsData).map(([id, reg]: [string, any]) => ({
      storeId: id,
      userId: id,
      storeName: reg.businessInfo?.storeName || reg.storeName || reg.businessName || 'Unknown Store',
      ownerName: reg.personalInfo?.name || reg.ownerName || reg.name || 'Unknown Owner',
      email: reg.personalInfo?.email || reg.email || '',
      phone: reg.personalInfo?.mobile || reg.phone || '',
      address: reg.businessInfo?.address || reg.address || '',
      status: reg.status || 'pending',
      createdAt: reg.createdAt || new Date().toISOString(),
      documents: reg.documents || {},
      source: 'registrations',
    }));

    // Combine both arrays
    const allStores = [...stores, ...registrations];

    // Sort by creation date
    allStores.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ stores: allStores });
  } catch (error) {
    console.error('Error fetching all stores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}
