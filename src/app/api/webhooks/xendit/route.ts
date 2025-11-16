import { NextRequest } from 'next/server';
import { ref, get, update, set, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { XENDIT_WEBHOOK_TOKEN } from '@/lib/config';
import { roundCurrency } from '@/lib/commission';

// Note: Stock deduction requires Firebase Admin SDK or proper security rules
// For now, we'll log the deduction and handle it client-side

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
    
    // ✅ Normalize payment method: Use payment_channel (PAYMAYA/GCASH) if available, otherwise fall back
    let paymentMethod = metadata.method || payload.payment_method;
    if (payload.payment_channel) {
      // Convert PAYMAYA → paymaya, GCASH → gcash
      paymentMethod = payload.payment_channel.toLowerCase();
    } else if (payload.ewallet_type) {
      // Fallback: Use ewallet_type if payment_channel not available
      paymentMethod = payload.ewallet_type.toLowerCase();
    }
    
    const updates: any = {
      status,
      paidAt: payload.paid_at || payload.updated || new Date().toISOString(),
      method: paymentMethod, // ✅ Now uses 'paymaya' or 'gcash' instead of 'EWALLET'
    };
    
    // ✅ Only add customer fields if they have values (avoid undefined)
    if (metadata.customer_name || payload.payer_email) {
      updates.customerName = metadata.customer_name || payload.payer_email?.split('@')[0];
    }
    if (metadata.customer_email || payload.payer_email) {
      updates.customerEmail = metadata.customer_email || payload.payer_email;
    }
    if (metadata.customer_phone) {
      updates.customerPhone = metadata.customer_phone;
    }
    
    await update(ledgerRef, updates);

    // Credit wallet on successful payment
    if (status === 'PAID' || status === 'SETTLED') {
      const storeAmount = roundCurrency(metadata.store_amount || (amount - (metadata.commission || 0)));
      const walletRef = ref(database, `wallets/${storeId}`);
      const walletSnap = await get(walletRef);
      
      const currentAvailable = walletSnap.exists() ? (walletSnap.val().available || 0) : 0;
      const currentPending = walletSnap.exists() ? (walletSnap.val().pending || 0) : 0;
      const currentTotal = walletSnap.exists() ? (walletSnap.val().total || 0) : 0;
      
      const newAvailable = roundCurrency(currentAvailable + storeAmount);
      const newTotal = roundCurrency(currentTotal + storeAmount);

      // Create or update wallet document
      if (!walletSnap.exists()) {
        // Create new wallet with initial structure
        await set(walletRef, {
          available: newAvailable,
          pending: 0,
          total: newTotal,
          lastUpdated: new Date().toISOString(),
        });
      } else {
        // Update existing wallet
        await update(walletRef, {
          available: newAvailable,
          total: newTotal,
          lastUpdated: new Date().toISOString(),
        });
      }

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

  // Update order paymentStatus using orderId (preferred), then orderNumber, then legacy query
  try {
    let orderId: string | undefined = metadata.order_id;
    if (!orderId) {
      const mapSnap = await get(ref(database, `indexes/invoice_to_order/${invoiceId}`));
      if (mapSnap.exists()) orderId = mapSnap.val().orderId;
    }

    // ✅ Normalize payment method for order (same logic as ledger)
    let paymentMethod = metadata.method || payload.payment_method;
    if (payload.payment_channel) {
      paymentMethod = payload.payment_channel.toLowerCase(); // PAYMAYA → paymaya, GCASH → gcash
    } else if (payload.ewallet_type) {
      paymentMethod = payload.ewallet_type.toLowerCase();
    }

    // Compute paymentStatus from Xendit status
    let paymentStatus = 'pending';
    if (status === 'PAID' || status === 'SETTLED') paymentStatus = 'PAID';
    else if (status === 'REFUNDED') paymentStatus = 'REFUNDED';
    else if (status === 'EXPIRED' || status === 'VOIDED') paymentStatus = 'pending';

    // Prepare order updates with normalized payment method
    const orderUpdates: any = { 
      paymentStatus, 
      updatedAt: new Date().toISOString() 
    };
    // ✅ Only update paymentMethod if we have a valid normalized value
    if (paymentMethod && paymentMethod !== 'EWALLET') {
      orderUpdates.paymentMethod = paymentMethod;
    }

    if (orderId) {
      const orderRef = ref(database, `orders/${orderId}`);
      const snap = await get(orderRef);
      if (snap.exists()) {
        await update(orderRef, orderUpdates);
        
        // Note: Stock deduction is now handled client-side when payment confirmation is detected
        // This avoids Firebase permission issues and uses transactions for safety
        console.log(`[📦 Inventory] Payment confirmed for order ${orderId} - stock will be deducted client-side`);
      } else {
        console.warn('[Webhook] Order not found at orders/' + orderId + '; skipping orderId update');
      }
    } else if (orderNumber) {
      const orderRef = ref(database, `orders/${orderNumber}`);
      const orderSnap = await get(orderRef);
      if (orderSnap.exists()) {
        await update(orderRef, orderUpdates);
      } else {
        // Fallback: legacy query by child (non-fatal if index missing)
        try {
          const ordersQ = query(ref(database, 'orders'), orderByChild('orderNumber'), equalTo(orderNumber));
          const snap = await get(ordersQ);
          if (snap.exists()) {
            const orders = snap.val() as Record<string, any>;
            for (const oid of Object.keys(orders)) {
              await update(ref(database, `orders/${oid}`), orderUpdates);
            }
          } else {
            console.warn('[Webhook] Order not found at orders/' + orderNumber + ' and no query match; skipping order update');
          }
        } catch (err: any) {
          console.warn('[Webhook] Skipping fallback query (likely missing index):', err?.message || err);
        }
      }
    }
  } catch (err: any) {
    console.warn('[Webhook] Order update error:', err?.message || err);
  }

  // Mark processed (non-fatal if rules block it)
  try {
    await set(processedRef, true);
  } catch (err: any) {
    console.warn('[Webhook] Could not mark processed_webhooks (rules?):', err?.message || err);
  }

  return ok({ ok: true });
}