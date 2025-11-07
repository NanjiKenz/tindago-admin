import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';




export async function GET() {
  try {
    // Fetch stores data - REST API returns plain JSON (null if no data)
    const storesData = await fetchFirebase('stores');

    // Handle null/empty response
    if (!storesData || typeof storesData !== 'object') {
      return NextResponse.json({ stores: [] });
    }

    // Convert to array with IDs and map fields properly
    const stores = Object.entries(storesData).map(([id, store]: [string, any]) => ({
      storeId: id,
      ...store,
      // Map createdAt to joinedDate for compatibility with StoreManagement component
      joinedDate: store.joinedDate || store.createdAt || store.approvedAt || new Date().toISOString(),
    }));

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stores' },
      { status: 200 }
    );
  }
}
