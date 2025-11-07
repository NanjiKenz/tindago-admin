import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

/**
 * Get all payout requests
 */

export async function GET() {
  try {
    console.log('📡 Starting payout requests fetch from Firebase...');

    // Fetch payout requests - REST API returns plain JSON
    const payoutsData = await fetchFirebase('payout_requests');

    // Handle null/empty response
    if (!payoutsData || typeof payoutsData !== 'object') {
      console.log('⚠️  No payout data found, returning empty array');
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

    console.log(`✅ Returning ${payouts.length} payout requests`);
    return NextResponse.json({ payouts });
  } catch (error: any) {
    console.error('❌ Error in /api/admin/payouts:', error);
    console.error('Stack trace:', error.stack);

    // Return empty array instead of error to allow UI to function
    return NextResponse.json({
      payouts: [],
      warning: 'Failed to fetch payout data from Firebase. Check server logs for details.'
    }, { status: 200 }); // Changed to 200 to prevent UI errors
  }
}
