/**
 * Payout Service - Manages payout requests and approvals
 */

import { ref, get, set, update, push, query, orderByChild, equalTo } from 'firebase/database';
import { database } from './firebase.js';
import { debitWallet } from './walletService';

export interface PayoutRequest {
  id: string;
  storeId: string;
  storeName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string; // Admin user ID
  paymentMethod?: 'bank' | 'gcash' | 'paymaya'; // Legacy field
  method?: 'bank' | 'gcash' | 'paymaya'; // New field
  accountDetails?: string; // Legacy field - Bank account or mobile number
  accountName?: string; // New field
  accountNumber?: string; // New field
  notes?: string;
  adminNotes?: string;
}

/**
 * Create a payout request
 */
export async function createPayoutRequest(params: {
  storeId: string;
  amount: number;
  paymentMethod: 'bank' | 'gcash' | 'paymaya';
  accountDetails: string;
  notes?: string;
}): Promise<string> {
  const { storeId, amount, paymentMethod, accountDetails, notes } = params;

  try {
    // Get store name
    const storeRef = ref(database, `stores/${storeId}`);
    const storeSnap = await get(storeRef);
    const storeName = storeSnap.exists() ? storeSnap.val().name : 'Unknown Store';

    // Create payout request
    const payoutRef = push(ref(database, 'payout_requests'));
    const payoutId = payoutRef.key!;

    await set(payoutRef, {
      storeId,
      storeName,
      amount,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      paymentMethod,
      accountDetails,
      notes: notes || '',
    });

    return payoutId;
  } catch (error) {
    console.error('Error creating payout request:', error);
    throw error;
  }
}

/**
 * Get all payout requests (admin view)
 */
export async function getAllPayoutRequests(): Promise<PayoutRequest[]> {
  try {
    // Fetch from API route to bypass Firebase security rules
    const res = await fetch('/api/admin/payouts', { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch payouts: ${errorText}`);
    }

    const data = await res.json();
    return (data.payouts || []) as PayoutRequest[];
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    throw error;
  }
}

/**
 * DEPRECATED: Old direct Firebase access - kept for reference
 * Use getAllPayoutRequests() instead which uses API routes
 */
async function getAllPayoutRequestsLegacy(): Promise<PayoutRequest[]> {
  try {
    const payoutsRef = ref(database, 'payout_requests');
    const snapshot = await get(payoutsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const payouts: PayoutRequest[] = [];
    const data = snapshot.val();

    Object.keys(data).forEach(payoutId => {
      const payout = data[payoutId];
      payouts.push({
        id: payoutId,
        storeId: payout.storeId,
        storeName: payout.storeName,
        amount: payout.amount,
        status: payout.status,
        requestedAt: payout.requestedAt,
        processedAt: payout.processedAt,
        processedBy: payout.processedBy,
        paymentMethod: payout.paymentMethod,
        accountDetails: payout.accountDetails,
        notes: payout.notes,
        adminNotes: payout.adminNotes,
      });
    });

    // Sort by requestedAt (newest first)
    payouts.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );

    return payouts;
  } catch (error) {
    console.error('Error getting all payout requests:', error);
    return [];
  }
}

/**
 * Get payout requests for a specific store
 */
export async function getStorePayoutRequests(storeId: string): Promise<PayoutRequest[]> {
  try {
    const payoutsRef = ref(database, 'payout_requests');
    const snapshot = await get(payoutsRef);

    if (!snapshot.exists()) {
      return [];
    }

    const payouts: PayoutRequest[] = [];
    const data = snapshot.val();

    Object.keys(data).forEach(payoutId => {
      const payout = data[payoutId];
      if (payout.storeId === storeId) {
        payouts.push({
          id: payoutId,
          storeId: payout.storeId,
          storeName: payout.storeName,
          amount: payout.amount,
          status: payout.status,
          requestedAt: payout.requestedAt,
          processedAt: payout.processedAt,
          processedBy: payout.processedBy,
          paymentMethod: payout.paymentMethod,
          accountDetails: payout.accountDetails,
          notes: payout.notes,
          adminNotes: payout.adminNotes,
        });
      }
    });

    // Sort by requestedAt (newest first)
    payouts.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );

    return payouts;
  } catch (error) {
    console.error('Error getting store payout requests:', error);
    return [];
  }
}

/**
 * Approve a payout request
 * Updates both 'payout_requests' (legacy) and 'payouts' (new structure)
 */
export async function approvePayoutRequest(params: {
  payoutId: string;
  adminUserId: string;
  adminNotes?: string;
}): Promise<void> {
  const { payoutId, adminUserId, adminNotes } = params;

  try {
    // Try new structure first
    const newPayoutRef = ref(database, `payouts/${payoutId}`);
    const newSnapshot = await get(newPayoutRef);
    
    let payoutRef;
    let payout;
    
    if (newSnapshot.exists()) {
      // Use new structure
      payoutRef = newPayoutRef;
      payout = newSnapshot.val();
    } else {
      // Fallback to legacy structure
      const legacyPayoutRef = ref(database, `payout_requests/${payoutId}`);
      const legacySnapshot = await get(legacyPayoutRef);
      
      if (!legacySnapshot.exists()) {
        throw new Error('Payout request not found');
      }
      
      payoutRef = legacyPayoutRef;
      payout = legacySnapshot.val();
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout already processed');
    }

    // Debit from wallet
    await debitWallet({
      storeId: payout.storeId,
      amount: payout.amount,
      payoutId,
      description: `Payout approved - ${payout.paymentMethod || payout.method}`,
    });

    const timestamp = new Date().toISOString();
    const updates: Record<string, any> = {};

    // Update main payout record
    updates[`payouts/${payoutId}/status`] = 'approved';
    updates[`payouts/${payoutId}/approvedBy`] = adminUserId;
    updates[`payouts/${payoutId}/approvedAt`] = timestamp;
    
    // Update status history
    const statusHistory = payout.statusHistory || [];
    statusHistory.push({
      status: 'approved',
      timestamp,
      note: adminNotes || 'Approved by admin',
      actionBy: adminUserId,
    });
    updates[`payouts/${payoutId}/statusHistory`] = statusHistory;

    // Update indexed data
    updates[`payouts_by_store/${payout.storeId}/${payoutId}/status`] = 'approved';
    
    // Move from pending to approved in status index
    updates[`payouts_by_status/pending/${payoutId}`] = null;
    updates[`payouts_by_status/approved/${payoutId}`] = {
      storeId: payout.storeId,
      storeName: payout.storeName || payout.storeId || 'Unknown',
      amount: payout.amount,
      createdAt: payout.createdAt || payout.requestedAt || new Date().toISOString(),
    };

    await update(ref(database), updates);
    
    // Also update legacy structure if it exists
    const legacyRef = ref(database, `payout_requests/${payoutId}`);
    const legacyExists = await get(legacyRef);
    if (legacyExists.exists()) {
      await update(legacyRef, {
        status: 'approved',
        processedAt: timestamp,
        processedBy: adminUserId,
        adminNotes: adminNotes || '',
      });
    }
  } catch (error) {
    console.error('Error approving payout:', error);
    throw error;
  }
}

/**
 * Reject a payout request
 * Updates both 'payout_requests' (legacy) and 'payouts' (new structure)
 */
export async function rejectPayoutRequest(params: {
  payoutId: string;
  adminUserId: string;
  adminNotes: string;
}): Promise<void> {
  const { payoutId, adminUserId, adminNotes } = params;

  try {
    // Try new structure first
    const newPayoutRef = ref(database, `payouts/${payoutId}`);
    const newSnapshot = await get(newPayoutRef);
    
    let payout;
    
    if (newSnapshot.exists()) {
      payout = newSnapshot.val();
    } else {
      // Fallback to legacy structure
      const legacyPayoutRef = ref(database, `payout_requests/${payoutId}`);
      const legacySnapshot = await get(legacyPayoutRef);
      
      if (!legacySnapshot.exists()) {
        throw new Error('Payout request not found');
      }
      
      payout = legacySnapshot.val();
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout already processed');
    }

    const timestamp = new Date().toISOString();
    const updates: Record<string, any> = {};

    // Update main payout record
    updates[`payouts/${payoutId}/status`] = 'rejected';
    updates[`payouts/${payoutId}/rejectedBy`] = adminUserId;
    updates[`payouts/${payoutId}/rejectedAt`] = timestamp;
    updates[`payouts/${payoutId}/rejectionReason`] = adminNotes;
    
    // Update status history
    const statusHistory = payout.statusHistory || [];
    statusHistory.push({
      status: 'rejected',
      timestamp,
      note: adminNotes,
      actionBy: adminUserId,
    });
    updates[`payouts/${payoutId}/statusHistory`] = statusHistory;

    // Update indexed data
    updates[`payouts_by_store/${payout.storeId}/${payoutId}/status`] = 'rejected';
    
    // Move from pending to rejected in status index
    updates[`payouts_by_status/pending/${payoutId}`] = null;
    updates[`payouts_by_status/rejected/${payoutId}`] = {
      storeId: payout.storeId,
      storeName: payout.storeName || payout.storeId || 'Unknown',
      amount: payout.amount,
      createdAt: payout.createdAt || payout.requestedAt || new Date().toISOString(),
    };

    await update(ref(database), updates);
    
    // Also update legacy structure if it exists
    const legacyRef = ref(database, `payout_requests/${payoutId}`);
    const legacyExists = await get(legacyRef);
    if (legacyExists.exists()) {
      await update(legacyRef, {
        status: 'rejected',
        processedAt: timestamp,
        processedBy: adminUserId,
        adminNotes,
      });
    }
  } catch (error) {
    console.error('Error rejecting payout:', error);
    throw error;
  }
}

/**
 * Mark payout as completed (money transferred)
 * Updates both 'payout_requests' (legacy) and 'payouts' (new structure)
 */
export async function completePayoutRequest(params: {
  payoutId: string;
  adminUserId?: string;
  completionNote?: string;
}): Promise<void> {
  const { payoutId, adminUserId, completionNote } = params;
  
  try {
    // Try new structure first
    const newPayoutRef = ref(database, `payouts/${payoutId}`);
    const newSnapshot = await get(newPayoutRef);
    
    let payout;
    
    if (newSnapshot.exists()) {
      payout = newSnapshot.val();
    } else {
      // Fallback to legacy structure
      const legacyPayoutRef = ref(database, `payout_requests/${payoutId}`);
      const legacySnapshot = await get(legacyPayoutRef);
      
      if (!legacySnapshot.exists()) {
        throw new Error('Payout request not found');
      }
      
      payout = legacySnapshot.val();
    }

    if (payout.status !== 'approved') {
      throw new Error('Payout must be approved first');
    }

    const timestamp = new Date().toISOString();
    const updates: Record<string, any> = {};

    // Update main payout record
    updates[`payouts/${payoutId}/status`] = 'completed';
    updates[`payouts/${payoutId}/completedBy`] = adminUserId || null;
    updates[`payouts/${payoutId}/completedAt`] = timestamp;
    updates[`payouts/${payoutId}/completionNote`] = completionNote || null;
    
    // Update status history
    const statusHistory = payout.statusHistory || [];
    statusHistory.push({
      status: 'completed',
      timestamp,
      note: completionNote || 'Payout completed - funds transferred',
      actionBy: adminUserId || 'system',
    });
    updates[`payouts/${payoutId}/statusHistory`] = statusHistory;

    // Update indexed data
    updates[`payouts_by_store/${payout.storeId}/${payoutId}/status`] = 'completed';
    
    // Move from approved to completed in status index
    updates[`payouts_by_status/approved/${payoutId}`] = null;
    updates[`payouts_by_status/completed/${payoutId}`] = {
      storeId: payout.storeId,
      storeName: payout.storeName || payout.storeId || 'Unknown',
      amount: payout.amount,
      createdAt: payout.createdAt || payout.requestedAt || new Date().toISOString(),
    };

    await update(ref(database), updates);
    
    // Also update legacy structure if it exists
    const legacyRef = ref(database, `payout_requests/${payoutId}`);
    const legacyExists = await get(legacyRef);
    if (legacyExists.exists()) {
      await update(legacyRef, {
        status: 'completed',
        completedAt: timestamp,
      });
    }
  } catch (error) {
    console.error('Error completing payout:', error);
    throw error;
  }
}

/**
 * Get payout statistics
 */
export async function getPayoutStats(): Promise<{
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  completedCount: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
}> {
  try {
    // Fetch stats from API route (bypasses Firebase security rules)
    const res = await fetch('/api/admin/payouts/stats', { cache: 'no-store' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch payout stats: ${errorText}`);
    }

    const apiStats = await res.json();

    return {
      totalRequests: apiStats.totalRequests || 0,
      pendingCount: apiStats.pendingRequests || 0,
      approvedCount: apiStats.approvedRequests || 0,
      rejectedCount: apiStats.rejectedRequests || 0,
      completedCount: apiStats.completedRequests || 0,
      totalPendingAmount: apiStats.pendingAmount || 0,
      totalApprovedAmount: apiStats.totalAmount || 0,
    };
  } catch (error) {
    console.error('Error fetching payout stats:', error);
    throw error;
  }
}

/**
 * DEPRECATED: Old calculation method
 */
async function getPayoutStatsLegacy(): Promise<{
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  completedCount: number;
  totalPendingAmount: number;
  totalApprovedAmount: number;
}> {
  try{
    const payouts = await getAllPayoutRequests();

    const stats = {
      totalRequests: payouts.length,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      completedCount: 0,
      totalPendingAmount: 0,
      totalApprovedAmount: 0,
    };

    payouts.forEach(payout => {
      switch (payout.status) {
        case 'pending':
          stats.pendingCount++;
          stats.totalPendingAmount += payout.amount;
          break;
        case 'approved':
          stats.approvedCount++;
          stats.totalApprovedAmount += payout.amount;
          break;
        case 'rejected':
          stats.rejectedCount++;
          break;
        case 'completed':
          stats.completedCount++;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting payout stats:', error);
    return {
      totalRequests: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      completedCount: 0,
      totalPendingAmount: 0,
      totalApprovedAmount: 0,
    };
  }
}

/**
 * Format currency
 */
export function formatPayoutAmount(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}
