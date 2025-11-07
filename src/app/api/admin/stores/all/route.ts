import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';


/**
 * Get all stores with registrations combined
 * Combines both 'stores' collection and 'store_registrations' for unified view
 */


export async function GET() {
  try {
    // Fetch both stores and registrations - REST API returns plain JSON
    const [storesData, registrationsData] = await Promise.all([
      fetchFirebase('stores'),
      fetchFirebase('store_registrations'),
    ]);

    // Handle null/empty responses and convert to arrays
    const stores = storesData && typeof storesData === 'object'
      ? Object.entries(storesData).map(([id, store]: [string, any]) => ({
          storeId: id,
          ...store,
          // Map createdAt to joinedDate for compatibility
          joinedDate: store.joinedDate || store.createdAt || store.approvedAt || new Date().toISOString(),
          source: 'stores',
        }))
      : [];

    const registrations = registrationsData && typeof registrationsData === 'object'
      ? Object.entries(registrationsData).map(([id, reg]: [string, any]) => ({
          storeId: id,
          userId: id,
          storeName: reg.businessInfo?.storeName || reg.storeName || reg.businessName || 'Unknown Store',
          ownerName: reg.personalInfo?.name || reg.ownerName || reg.name || 'Unknown Owner',
          email: reg.personalInfo?.email || reg.email || '',
          phone: reg.personalInfo?.mobile || reg.phone || '',
          address: reg.businessInfo?.address || reg.address || '',
          status: reg.status || 'pending',
          createdAt: reg.createdAt || new Date().toISOString(),
          // Map createdAt to joinedDate for compatibility
          joinedDate: reg.createdAt || new Date().toISOString(),
          documents: reg.documents || {},
          source: 'registrations',
        }))
      : [];

    // Combine both arrays
    const allStores = [...stores, ...registrations];

    // Sort by creation date
    allStores.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ stores: allStores });
  } catch (error) {
    console.error('Error fetching all stores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stores' },
      { status: 200 }
    );
  }
}
