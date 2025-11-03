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
      { status: 500 }
    );
  }
}
