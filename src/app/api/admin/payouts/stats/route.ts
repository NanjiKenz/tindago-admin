import { NextResponse } from 'next/server';


/**
 * Get payout statistics
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
    const payoutsDataRaw = await fetchFirebase('payout_requests');

    // Handle null/empty response
    if (!payoutsDataRaw || typeof payoutsDataRaw !== 'object') {
      return NextResponse.json({
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        completedRequests: 0,
        rejectedRequests: 0,
        totalAmount: 0,
        pendingAmount: 0,
      });
    }

    const payoutsData = Object.values(payoutsDataRaw) as any[];

    const stats = {
      totalRequests: payoutsData.length,
      pendingRequests: payoutsData.filter(p => p.status === 'pending').length,
      approvedRequests: payoutsData.filter(p => p.status === 'approved').length,
      completedRequests: payoutsData.filter(p => p.status === 'completed').length,
      rejectedRequests: payoutsData.filter(p => p.status === 'rejected').length,
      totalAmount: payoutsData.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      pendingAmount: payoutsData
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching payout stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch payout statistics' },
      { status: 500 }
    );
  }
}
