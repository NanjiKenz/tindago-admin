/**
 * Backfill wallet balances from existing paid ledger transactions
 * Run with: npx ts-node scripts/backfill-wallets.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

interface LedgerTransaction {
  storeAmount: number;
  status: string;
  createdAt?: string;
  invoiceId?: string;
  orderNumber?: string;
}

// Inline roundCurrency to avoid import issues
function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

const FIREBASE_DB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '';

async function fetchFirebase(path: string) {
  const url = `${FIREBASE_DB_URL}/${path}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firebase fetch failed: ${res.statusText}`);
  return res.json();
}

async function updateFirebase(path: string, data: any) {
  const url = `${FIREBASE_DB_URL}/${path}.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase update failed: ${res.statusText}`);
  return res.json();
}

async function backfillWallets() {
  try {
    console.log('🔄 Starting wallet backfill...');

    if (!FIREBASE_DB_URL) {
      throw new Error('NEXT_PUBLIC_FIREBASE_DATABASE_URL not set');
    }

    // Get all ledger stores
    const ledgers = await fetchFirebase('ledgers/stores');

    if (!ledgers) {
      console.log('❌ No ledger data found');
      return;
    }

    let processedCount = 0;
    let totalAmount = 0;

    for (const storeId of Object.keys(ledgers)) {
      const storeTransactions = await fetchFirebase(`ledgers/stores/${storeId}/transactions`);

      if (!storeTransactions) {
        console.log(`⏭️  Store ${storeId}: No transactions`);
        continue;
      }

      const transactions = storeTransactions as Record<string, LedgerTransaction>;

      // Filter PAID/SETTLED transactions
      const paidTransactions = Object.entries(transactions).filter(
        ([_, txn]) => txn.status === 'PAID' || txn.status === 'SETTLED'
      );

      if (paidTransactions.length === 0) {
        console.log(`⏭️  Store ${storeId}: No paid transactions`);
        continue;
      }

      // Calculate totals
      let available = 0;
      let total = 0;
      const walletTransactions: Record<string, any> = {};

      for (const [invoiceId, txn] of paidTransactions) {
        const amount = roundCurrency(txn.storeAmount || 0);
        available = roundCurrency(available + amount);
        total = roundCurrency(total + amount);

        // Create wallet transaction record
        const txnId = `WALLET-${invoiceId}`;
        walletTransactions[txnId] = {
          type: 'credit',
          amount,
          invoiceId,
          ...(txn.orderNumber && { orderNumber: txn.orderNumber }),
          relatedStatus: txn.status,
          createdAt: txn.createdAt || new Date().toISOString(),
        };
      }

      // Create wallet document
      const walletData = {
        available,
        pending: 0,
        total,
        lastUpdated: new Date().toISOString(),
        transactions: walletTransactions,
      };

      await updateFirebase(`wallets/${storeId}`, walletData);

      console.log(
        `✅ Store ${storeId}: Created wallet with ₱${available.toFixed(2)} (${paidTransactions.length} transactions)`
      );

      processedCount++;
      totalAmount = roundCurrency(totalAmount + total);
    }

    console.log(
      `\n✨ Backfill complete: ${processedCount} wallets created with total ₱${totalAmount.toFixed(2)}`
    );
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }
}

backfillWallets();
