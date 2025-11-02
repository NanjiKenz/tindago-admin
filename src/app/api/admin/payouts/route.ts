import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

/**
 * Get all payout requests
 */
export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch payout requests
    const payoutsSnap = await db.ref('payout_requests').get();

    if (!payoutsSnap.exists()) {
      return NextResponse.json({ payouts: [] });
    }

    const payoutsData = payoutsSnap.val();
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
