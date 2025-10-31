/**
 * Wallet Service - Manages store wallet balances and transactions
 */

import { ref, get, set, update, push } from 'firebase/database';
import { database } from './firebase.js';

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit' | 'payout';
  amount: number;
  source: string; // e.g., "order-payment", "payout-approved"
  orderId?: string;
  invoiceId?: string;
  payoutId?: string;
  timestamp: string;
  description: string;
}

export interface WalletBalance {
  storeId: string;
  storeName: string;
  available: number; // Can be withdrawn
  pending: number; // From unpaid orders
  total: number; // available + pending
  lastUpdated: string;
}

/**
 * Get wallet balance for a store
 */
export async function getWalletBalance(storeId: string): Promise<WalletBalance> {
  try {
    // Get store name
    const storeRef = ref(database, `stores/${storeId}`);
    const storeSnap = await get(storeRef);
    const storeName = storeSnap.exists() ? storeSnap.val().name : 'Unknown Store';

    // Get wallet data
    const walletRef = ref(database, `wallets/${storeId}`);
    const walletSnap = await get(walletRef);

    if (!walletSnap.exists()) {
      return {
        storeId,
        storeName,
        available: 0,
        pending: 0,
        total: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    const wallet = walletSnap.val();
    return {
      storeId,
      storeName,
      available: wallet.available || 0,
      pending: wallet.pending || 0,
      total: (wallet.available || 0) + (wallet.pending || 0),
      lastUpdated: wallet.lastUpdated || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
}

/**
 * Get all wallet transactions for a store
 */
export async function getWalletTransactions(storeId: string): Promise<WalletTransaction[]> {
  try {
    const txnRef = ref(database, `wallets/${storeId}/transactions`);
    const snapshot = await get(txnRef);

    if (!snapshot.exists()) {
      return [];
    }

    const transactions: WalletTransaction[] = [];
    const txnData = snapshot.val();

    Object.keys(txnData).forEach(txnId => {
      const txn = txnData[txnId];
      transactions.push({
        id: txnId,
        type: txn.type,
        amount: txn.amount,
        source: txn.source,
        orderId: txn.orderId,
        invoiceId: txn.invoiceId,
        payoutId: txn.payoutId,
        timestamp: txn.timestamp,
        description: txn.description,
      });
    });

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return transactions;
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    return [];
  }
}

/**
 * Credit wallet (add money from order payment)
 */
export async function creditWallet(params: {
  storeId: string;
  amount: number;
  source: string;
  orderId?: string;
  invoiceId?: string;
  description: string;
}): Promise<void> {
  const { storeId, amount, source, orderId, invoiceId, description } = params;

  try {
    const walletRef = ref(database, `wallets/${storeId}`);
    const snapshot = await get(walletRef);

    const currentAvailable = snapshot.exists() ? (snapshot.val().available || 0) : 0;
    const newAvailable = currentAvailable + amount;

    // Update balance
    await update(walletRef, {
      available: newAvailable,
      lastUpdated: new Date().toISOString(),
    });

    // Add transaction record
    const txnRef = push(ref(database, `wallets/${storeId}/transactions`));
    await set(txnRef, {
      type: 'credit',
      amount,
      source,
      orderId,
      invoiceId,
      timestamp: new Date().toISOString(),
      description,
    });
  } catch (error) {
    console.error('Error crediting wallet:', error);
    throw error;
  }
}

/**
 * Debit wallet (payout approved)
 */
export async function debitWallet(params: {
  storeId: string;
  amount: number;
  payoutId: string;
  description: string;
}): Promise<void> {
  const { storeId, amount, payoutId, description } = params;

  try {
    const walletRef = ref(database, `wallets/${storeId}`);
    const snapshot = await get(walletRef);

    if (!snapshot.exists()) {
      throw new Error('Wallet not found');
    }

    const currentAvailable = snapshot.val().available || 0;

    if (currentAvailable < amount) {
      throw new Error('Insufficient balance');
    }

    const newAvailable = currentAvailable - amount;

    // Update balance
    await update(walletRef, {
      available: newAvailable,
      lastUpdated: new Date().toISOString(),
    });

    // Add transaction record
    const txnRef = push(ref(database, `wallets/${storeId}/transactions`));
    await set(txnRef, {
      type: 'debit',
      amount,
      source: 'payout',
      payoutId,
      timestamp: new Date().toISOString(),
      description,
    });
  } catch (error) {
    console.error('Error debiting wallet:', error);
    throw error;
  }
}

/**
 * Calculate total earnings from ledger
 */
export async function calculateStoreEarnings(storeId: string): Promise<{
  totalEarnings: number;
  paidEarnings: number;
  pendingEarnings: number;
}> {
  try {
    const ledgerRef = ref(database, `ledgers/stores/${storeId}/transactions`);
    const snapshot = await get(ledgerRef);

    if (!snapshot.exists()) {
      return { totalEarnings: 0, paidEarnings: 0, pendingEarnings: 0 };
    }

    let totalEarnings = 0;
    let paidEarnings = 0;
    let pendingEarnings = 0;

    const transactions = snapshot.val();
    Object.values(transactions).forEach((txn: any) => {
      const storeAmount = txn.storeAmount || 0;
      totalEarnings += storeAmount;

      if (txn.status === 'PAID' || txn.status === 'SETTLED') {
        paidEarnings += storeAmount;
      } else {
        pendingEarnings += storeAmount;
      }
    });

    return { totalEarnings, paidEarnings, pendingEarnings };
  } catch (error) {
    console.error('Error calculating store earnings:', error);
    return { totalEarnings: 0, paidEarnings: 0, pendingEarnings: 0 };
  }
}

/**
 * Sync wallet balance from ledger (reconciliation)
 */
export async function syncWalletFromLedger(storeId: string): Promise<void> {
  try {
    const earnings = await calculateStoreEarnings(storeId);
    const wallet = await getWalletBalance(storeId);

    // Available should match paid earnings minus payouts
    const walletRef = ref(database, `wallets/${storeId}`);
    await update(walletRef, {
      available: earnings.paidEarnings,
      pending: earnings.pendingEarnings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error syncing wallet:', error);
    throw error;
  }
}

/**
 * Format currency
 */
export function formatAmount(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}
