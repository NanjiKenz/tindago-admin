import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

/**
 * Get payout statistics
 */

export async function GET() {
  try {
    console.log('📡 Starting payout stats fetch from Firebase...');

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

    console.log(`✅ Returning payout stats: ${stats.totalRequests} requests`);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('❌ Error in /api/admin/payouts/stats:', error);
    console.error('Stack trace:', error.stack);

    // Return zeros instead of error to allow UI to function
    return NextResponse.json({
      totalRequests: 0,
      pendingRequests: 0,
      approvedRequests: 0,
      completedRequests: 0,
      rejectedRequests: 0,
      totalAmount: 0,
      pendingAmount: 0,
      warning: 'Failed to fetch payout stats from Firebase. Check server logs for details.'
    }, { status: 200 }); // Changed to 200 to prevent UI errors
  }
}
