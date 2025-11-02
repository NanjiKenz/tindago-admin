import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

/**
 * Get payout statistics
 */
export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch payout requests
    const payoutsSnap = await db.ref('payout_requests').get();

    if (!payoutsSnap.exists()) {
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

    const payoutsData = Object.values(payoutsSnap.val()) as any[];

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
