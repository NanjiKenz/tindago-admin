import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch stores data
    const storesSnap = await db.ref('stores').get();
    const storesData = storesSnap.exists() ? storesSnap.val() : {};

    // Convert to array with IDs
    const stores = Object.entries(storesData).map(([id, store]: [string, any]) => ({
      storeId: id,
      ...store,
    }));

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}
