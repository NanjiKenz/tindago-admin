import { NextResponse } from 'next/server';
import { fetchFirebase } from '@/lib/fetchFirebase';

export async function GET() {
  try {
    // Fetch all ledger transactions
    const ledgersData = await fetchFirebase('ledgers/stores');

    let gcash = 0;
    let paymaya = 0;
    let cash = 0;

    if (ledgersData && typeof ledgersData === 'object') {
      // Iterate through all stores' ledgers
      Object.values(ledgersData).forEach((storeLedger: any) => {
        if (storeLedger.transactions) {
          Object.values(storeLedger.transactions).forEach((txn: any) => {
            // Only count PAID/SETTLED transactions
            if (txn.status === 'PAID' || txn.status === 'SETTLED') {
              const amount = txn.amount || 0;
              const method = (txn.paymentMethod || txn.method || '').toLowerCase();

              if (method.includes('gcash')) {
                gcash += amount;
              } else if (method.includes('paymaya') || method.includes('maya')) {
                paymaya += amount;
              } else if (method.includes('cash')) {
                cash += amount;
              } else {
                // Default to cash if method is unclear
                cash += amount;
              }
            }
          });
        }
      });
    }

    const total = gcash + paymaya + cash;

    return NextResponse.json({
      gcash,
      paymaya,
      cash,
      total
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { 
        gcash: 0,
        paymaya: 0,
        cash: 0,
        total: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch payment stats'
      },
      { status: 200 }
    );
  }
}
