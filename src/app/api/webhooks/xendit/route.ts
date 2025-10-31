import { NextRequest } from 'next/server';
import { ref, get, update, set, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { XENDIT_WEBHOOK_TOKEN } from '@/lib/config';
import { roundCurrency } from '@/lib/commission';

export const runtime = 'nodejs';

function ok(body?: any) {
  return new Response(body ? JSON.stringify(body) : undefined, { status: 200 });
}

export async function POST(req: NextRequest) {
  // Token verification
  const token = req.headers.get('x-callback-token') || '';
  console.log('[Webhook] Received POST, token:', token ? 'present' : 'missing', 'expected:', XENDIT_WEBHOOK_TOKEN ? 'set' : 'missing');
  
  if (!XENDIT_WEBHOOK_TOKEN || token !== XENDIT_WEBHOOK_TOKEN) {
    console.error('[Webhook] Token mismatch. Received:', token, 'Expected:', XENDIT_WEBHOOK_TOKEN);
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await req.json();
  console.log('[Webhook] Full payload:', JSON.stringify(payload, null, 2));
  
  const invoiceId: string = payload.id;
  const status: string = payload.status;
  const amount: number = payload.amount;
  const metadata = payload.metadata || {};
  const orderNumber: string | undefined = metadata.order_number || metadata.orderNumber || payload.external_id;

  console.log('[Webhook] Processing invoice:', invoiceId, 'status:', status, 'orderNumber:', orderNumber, 'external_id:', payload.external_id);

  if (!invoiceId) return ok();

  // Idempotency check
  const processedRef = ref(database, `processed_webhooks/${invoiceId}`);
  const processedSnap = await get(processedRef);
  if (processedSnap.exists()) return ok({ idempotent: true });

  // Resolve storeId via index or metadata
  let storeId: string | undefined = metadata.store_id;
  if (!storeId) {
    const idxSnap = await get(ref(database, `indexes/invoice_to_store/${invoiceId}`));
    if (idxSnap.exists()) storeId = idxSnap.val().storeId;
  }

  if (storeId) {
    const ledgerRef = ref(database, `ledgers/stores/${storeId}/transactions/${invoiceId}`);
    const updates: any = {
      status,
      paidAt: payload.paid_at || payload.updated || new Date().toISOString(),
      method: payload.payment_method || metadata.method || undefined,
    };
    await update(ledgerRef, updates);

    // Credit wallet on successful payment
    if (status === 'PAID' || status === 'SETTLED') {
      const storeAmount = roundCurrency(metadata.store_amount || (amount - (metadata.commission || 0)));
      const walletRef = ref(database, `wallets/${storeId}`);
      const walletSnap = await get(walletRef);
      const currentBalance = walletSnap.exists() ? (walletSnap.val().available || 0) : 0;
      const newBalance = roundCurrency(currentBalance + storeAmount);

      // Update wallet available balance
      await update(walletRef, {
        available: newBalance,
        updatedAt: new Date().toISOString(),
      });

      // Record wallet transaction
      const txnId = `WALLET-${invoiceId}`;
      const walletTxnRef = ref(database, `wallets/${storeId}/transactions/${txnId}`);
      await set(walletTxnRef, {
        type: 'credit',
        amount: storeAmount,
        invoiceId,
        ...(orderNumber && { orderNumber }),
        relatedStatus: status,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Link to order by order_number metadata if present
  if (orderNumber) {
    const ordersQ = query(ref(database, 'orders'), orderByChild('orderNumber'), equalTo(orderNumber));
    const snap = await get(ordersQ);
    if (snap.exists()) {
      const orders = snap.val() as Record<string, any>;
      for (const oid of Object.keys(orders)) {
        let paymentStatus = 'pending';
        if (status === 'PAID' || status === 'SETTLED') paymentStatus = 'PAID';
        else if (status === 'REFUNDED') paymentStatus = 'REFUNDED';
        else if (status === 'EXPIRED' || status === 'VOIDED') paymentStatus = 'pending';
        await update(ref(database, `orders/${oid}`), {
          paymentStatus,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // Mark processed
  await set(processedRef, true);

  return ok({ ok: true });
}