/**
 * Transaction Service - Manages payment transactions and ledger data
 */

import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from './firebase.js';

export interface Transaction {
  id: string;
  orderNumber: string;
  invoiceId: string;
  storeId: string;
  storeName: string;
  amount: number;
  commission: number;
  commissionRate: number;
  storeAmount: number;
  status: string;
  method: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  paidAt?: string;
  invoiceUrl?: string;
  expiryDate?: string;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalAmount: number;
  totalCommission: number;
  totalStoreEarnings: number;
  paidCount: number;
  pendingCount: number;
}

/**
 * Fetch all transactions across all stores
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const ledgerRef = ref(database, 'ledgers/stores');
    const snapshot = await get(ledgerRef);

    if (!snapshot.exists()) {
      return [];
    }

    const transactions: Transaction[] = [];
    const stores = snapshot.val() as Record<string, Record<string, Record<string, unknown>>>;

    // Iterate through each store
    Object.keys(stores).forEach(storeId => {
      const storeTransactions = stores[storeId].transactions || {};
      
      // Iterate through each transaction
      Object.keys(storeTransactions).forEach(invoiceId => {
        const txn = storeTransactions[invoiceId] as Record<string, unknown>;
        
        transactions.push({
          id: invoiceId,
          orderNumber: txn.orderNumber as string || '',
          invoiceId,
          storeId,
          storeName: txn.storeName as string || 'Unknown Store',
          amount: txn.amount as number || 0,
          commission: txn.commission as number || 0,
          commissionRate: txn.commissionRate as number || 0,
          storeAmount: txn.storeAmount as number || 0,
          status: txn.status as string || 'PENDING',
          method: txn.method as string || 'online',
          paymentStatus: mapPaymentStatus(txn.status as string),
          createdAt: txn.createdAt as string || '',
          paidAt: txn.paidAt as string,
          invoiceUrl: txn.invoiceUrl as string,
          expiryDate: txn.expiryDate as string,
        });
      });
    });

    // Sort by creation date (newest first)
    transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Fetch transactions for a specific store
 */
export async function getStoreTransactions(storeId: string): Promise<Transaction[]> {
  try {
    const storeRef = ref(database, `ledgers/stores/${storeId}/transactions`);
    const snapshot = await get(storeRef);

    if (!snapshot.exists()) {
      return [];
    }

    const transactions: Transaction[] = [];
    const txnData = snapshot.val() as Record<string, Record<string, unknown>>;

    Object.keys(txnData).forEach(invoiceId => {
      const txn = txnData[invoiceId];
      
      transactions.push({
        id: invoiceId,
        orderNumber: txn.orderNumber as string || '',
        invoiceId,
        storeId,
        storeName: txn.storeName as string || 'Unknown Store',
        amount: txn.amount as number || 0,
        commission: txn.commission as number || 0,
        commissionRate: txn.commissionRate as number || 0,
        storeAmount: txn.storeAmount as number || 0,
        status: txn.status as string || 'PENDING',
        method: txn.method as string || 'online',
        paymentStatus: mapPaymentStatus(txn.status as string),
        createdAt: txn.createdAt as string || '',
        paidAt: txn.paidAt as string,
        invoiceUrl: txn.invoiceUrl as string,
        expiryDate: txn.expiryDate as string,
      });
    });

    // Sort by creation date (newest first)
    transactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return transactions;
  } catch (error) {
    console.error('Error fetching store transactions:', error);
    return [];
  }
}

/**
 * Get transaction summary statistics
 */
export function getTransactionSummary(transactions: Transaction[]): TransactionSummary {
  const summary: TransactionSummary = {
    totalTransactions: transactions.length,
    totalAmount: 0,
    totalCommission: 0,
    totalStoreEarnings: 0,
    paidCount: 0,
    pendingCount: 0,
  };

  transactions.forEach(txn => {
    summary.totalAmount += txn.amount;
    summary.totalCommission += txn.commission;
    summary.totalStoreEarnings += txn.storeAmount;

    if (txn.paymentStatus === 'paid') {
      summary.paidCount++;
    } else if (txn.paymentStatus === 'pending') {
      summary.pendingCount++;
    }
  });

  return summary;
}

/**
 * Filter transactions by criteria
 */
export function filterTransactions(
  transactions: Transaction[],
  filters: {
    storeId?: string;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
  }
): Transaction[] {
  let filtered = [...transactions];

  if (filters.storeId) {
    filtered = filtered.filter(t => t.storeId === filters.storeId);
  }

  if (filters.status) {
    filtered = filtered.filter(t => t.paymentStatus === filters.status);
  }

  if (filters.method) {
    filtered = filtered.filter(t => t.method.toLowerCase() === filters.method.toLowerCase());
  }

  if (filters.startDate) {
    filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.startDate!));
  }

  if (filters.endDate) {
    filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.endDate!));
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(t =>
      t.orderNumber.toLowerCase().includes(term) ||
      t.storeName.toLowerCase().includes(term) ||
      t.invoiceId.toLowerCase().includes(term)
    );
  }

  return filtered;
}

/**
 * Map Xendit status to payment status
 */
function mapPaymentStatus(status: string): 'pending' | 'paid' | 'refunded' {
  const upperStatus = status?.toUpperCase();
  
  if (upperStatus === 'PAID' || upperStatus === 'SETTLED') {
    return 'paid';
  }
  
  if (upperStatus === 'REFUNDED') {
    return 'refunded';
  }
  
  return 'pending';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Export transactions to CSV
 */
export function exportToCSV(transactions: Transaction[]): string {
  const headers = [
    'Transaction ID',
    'Order Number',
    'Store Name',
    'Store ID',
    'Amount',
    'Commission',
    'Commission Rate',
    'Store Earnings',
    'Status',
    'Payment Method',
    'Created At',
    'Paid At',
  ];

  const rows = transactions.map(t => [
    t.invoiceId,
    t.orderNumber,
    t.storeName,
    t.storeId,
    t.amount.toFixed(2),
    t.commission.toFixed(2),
    `${(t.commissionRate * 100).toFixed(2)}%`,
    t.storeAmount.toFixed(2),
    t.status,
    t.method,
    t.createdAt,
    t.paidAt || 'N/A',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csv;
}
