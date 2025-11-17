import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

/**
 * Get all payout requests
 */

export async function GET() {
  try {
    console.log('📡 Starting payout requests fetch from Firebase...');

    // Fetch from new 'payouts' structure first
    const payoutsData = await fetchFirebase('payouts');

    // Handle null/empty response
    if (!payoutsData || typeof payoutsData !== 'object') {
      console.log('⚠️  No payout data found in new structure, checking legacy...');
      
      // Fallback to legacy structure
      const legacyPayoutsData = await fetchFirebase('payout_requests');
      
      if (!legacyPayoutsData || typeof legacyPayoutsData !== 'object') {
        console.log('⚠️  No legacy payout data found, returning empty array');
        return NextResponse.json({ payouts: [] });
      }
      
      // Parse legacy format
      const legacyPayouts = Object.entries(legacyPayoutsData).map(([id, payout]: [string, any]) => ({
        id,
        storeId: payout.storeId || '',
        storeName: payout.storeName || '',
        amount: Number(payout.amount || 0),
        method: payout.paymentMethod || payout.method || '',
        accountName: payout.accountName || '',
        accountNumber: payout.accountDetails || '',
        status: payout.status || 'pending',
        requestedAt: payout.requestedAt || '',
        processedAt: payout.processedAt,
        adminNotes: payout.adminNotes,
      }));
      
      legacyPayouts.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
      console.log(`✅ Returning ${legacyPayouts.length} legacy payout requests`);
      return NextResponse.json({ payouts: legacyPayouts });
    }

    // Fetch all stores data to get accurate store names
    const storesData = await fetchFirebase('stores');
    const storesMap = new Map();
    
    if (storesData && typeof storesData === 'object') {
      Object.entries(storesData).forEach(([storeId, store]: [string, any]) => {
        const storeName = store.businessInfo?.storeName || 
                         store.storeName || 
                         store.businessName || 
                         '';
        storesMap.set(storeId, storeName);
      });
    }

    // Parse new format with enhanced fields
    const payouts = Object.entries(payoutsData).map(([id, payout]: [string, any]) => {
      // Get store name from stores collection if not in payout data
      const storeName = payout.storeName || storesMap.get(payout.storeId) || '';
      
      console.log(`📦 Payout ${id}:`, {
        storeId: payout.storeId,
        storeNameFromPayout: payout.storeName,
        storeNameFromStores: storesMap.get(payout.storeId),
        finalStoreName: storeName,
        method: payout.method,
        accountName: payout.accountName,
        accountNumber: payout.accountNumber
      });
      
      return {
        id,
        payoutId: payout.payoutId || id,
        storeId: payout.storeId || '',
        storeName: storeName,
        storeOwnerName: payout.storeOwnerName || '',
        storeOwnerEmail: payout.storeOwnerEmail || '',
        amount: Number(payout.amount || 0),
        method: payout.method || '',
        accountName: payout.accountName || '',
        accountNumber: payout.accountNumber || '',
        status: payout.status || 'pending',
        createdAt: payout.createdAt || payout.requestedAt || '',
        requestedAt: payout.requestedAt || payout.createdAt || '',
        approvedBy: payout.approvedBy,
        approvedAt: payout.approvedAt,
        rejectedBy: payout.rejectedBy,
        rejectedAt: payout.rejectedAt,
        rejectionReason: payout.rejectionReason,
        completedBy: payout.completedBy,
        completedAt: payout.completedAt,
        completionNote: payout.completionNote,
        statusHistory: payout.statusHistory || [],
      };
    });

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
