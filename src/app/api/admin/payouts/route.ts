import { NextResponse } from 'next/server';


/**
 * Get all payout requests
 */

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
    // Fetch payout requests - REST API returns plain JSON
    const payoutsData = await fetchFirebase('payout_requests');

    // Handle null/empty response
    if (!payoutsData || typeof payoutsData !== 'object') {
      return NextResponse.json({ payouts: [] });
    }

    const payouts = Object.entries(payoutsData).map(([id, payout]: [string, any]) => ({
      id,
      storeId: payout.storeId || '',
      storeName: payout.storeName || '',
      amount: Number(payout.amount || 0),
      method: payout.method || '',
      accountDetails: payout.accountDetails || {},
      status: payout.status || 'pending',
      requestedAt: payout.requestedAt || '',
      processedAt: payout.processedAt,
      adminNotes: payout.adminNotes,
    }));

    // Sort by request date (newest first)
    payouts.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

    return NextResponse.json({ payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
