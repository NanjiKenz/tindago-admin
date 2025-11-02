import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/adminFirebase';

/**
 * Get all transactions across all stores
 */
export async function GET() {
  try {
    const db = getAdminDb();

    // Fetch transactions from ledgers/stores
    const ledgerSnap = await db.ref('ledgers/stores').get();

    if (!ledgerSnap.exists()) {
      return NextResponse.json({ transactions: [] });
    }

    const ledgerData = ledgerSnap.val();
    const transactions: any[] = [];

    // Process each store's transactions
    for (const storeId of Object.keys(ledgerData)) {
      const storeData = ledgerData[storeId];
      const storeTxs = storeData.transactions || {};

      for (const invoiceId of Object.keys(storeTxs)) {
        const tx = storeTxs[invoiceId];
        transactions.push({
          id: invoiceId,
          invoiceId,
          orderNumber: tx.orderNumber || '',
          storeId,
          storeName: tx.storeName || '',
          amount: Number(tx.amount || 0),
          commission: Number(tx.commission || 0),
          commissionRate: Number(tx.commissionRate || 0),
          storeAmount: Number(tx.storeAmount || 0),
          method: tx.method || '',
          status: (tx.status || 'PENDING').toString(),
          paymentStatus: (tx.paymentStatus || 'pending') as 'pending' | 'paid' | 'refunded',
          createdAt: tx.createdAt || '',
          paidAt: tx.paidAt,
          invoiceUrl: tx.invoiceUrl,
        });
      }
    }

    // Sort by creation date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}
