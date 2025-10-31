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
  paymentMethod: 'bank' | 'gcash' | 'paymaya';
  accountDetails: string; // Bank account or mobile number
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
    const payoutRef = push(ref(database, 'payouts'));
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
    const payoutsRef = ref(database, 'payouts');
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
    const payoutsRef = ref(database, 'payouts');
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
 */
export async function approvePayoutRequest(params: {
  payoutId: string;
  adminUserId: string;
  adminNotes?: string;
}): Promise<void> {
  const { payoutId, adminUserId, adminNotes } = params;

  try {
    // Get payout details
    const payoutRef = ref(database, `payouts/${payoutId}`);
    const snapshot = await get(payoutRef);

    if (!snapshot.exists()) {
      throw new Error('Payout request not found');
    }

    const payout = snapshot.val();

    if (payout.status !== 'pending') {
      throw new Error('Payout already processed');
    }

    // Debit from wallet
    await debitWallet({
      storeId: payout.storeId,
      amount: payout.amount,
      payoutId,
      description: `Payout approved - ${payout.paymentMethod}`,
    });

    // Update payout status
    await update(payoutRef, {
      status: 'approved',
      processedAt: new Date().toISOString(),
      processedBy: adminUserId,
      adminNotes: adminNotes || '',
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    throw error;
  }
}

/**
 * Reject a payout request
 */
export async function rejectPayoutRequest(params: {
  payoutId: string;
  adminUserId: string;
  adminNotes: string;
}): Promise<void> {
  const { payoutId, adminUserId, adminNotes } = params;

  try {
    const payoutRef = ref(database, `payouts/${payoutId}`);
    const snapshot = await get(payoutRef);

    if (!snapshot.exists()) {
      throw new Error('Payout request not found');
    }

    const payout = snapshot.val();

    if (payout.status !== 'pending') {
      throw new Error('Payout already processed');
    }

    // Update payout status
    await update(payoutRef, {
      status: 'rejected',
      processedAt: new Date().toISOString(),
      processedBy: adminUserId,
      adminNotes,
    });
  } catch (error) {
    console.error('Error rejecting payout:', error);
    throw error;
  }
}

/**
 * Mark payout as completed (money transferred)
 */
export async function completePayoutRequest(payoutId: string): Promise<void> {
  try {
    const payoutRef = ref(database, `payouts/${payoutId}`);
    const snapshot = await get(payoutRef);

    if (!snapshot.exists()) {
      throw new Error('Payout request not found');
    }

    const payout = snapshot.val();

    if (payout.status !== 'approved') {
      throw new Error('Payout must be approved first');
    }

    await update(payoutRef, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
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
