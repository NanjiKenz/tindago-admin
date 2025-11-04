import { NextRequest } from 'next/server';
import { ref, get, set, update } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { getCommissionRate, roundCurrency } from '@/lib/commission';
import { createInvoice, expireInvoice } from '@/lib/xenditService';

export const runtime = 'nodejs';

/**
 * POST /api/admin/transactions/[invoiceId]/replace-invoice
 * Body: { newCommissionRate?: number, newCommissionAmount?: number }
 *
 * For PENDING transactions only: expire the old invoice and create a new one
 * with the desired fee. Updates the existing ledger row with the new invoice
 * details and keeps a previousInvoiceId pointer.
 */
export async function POST(req: NextRequest, { params }: { params: { invoiceId: string } }) {
  const { invoiceId } = params;

  try {
    // Resolve storeId and orderNumber via index
    const idxSnap = await get(ref(database, `indexes/invoice_to_store/${invoiceId}`));
    if (!idxSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Invoice index not found' }), { status: 404 });
    }
    const { storeId, orderNumber } = idxSnap.val() as { storeId: string; orderNumber?: string };
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'Missing storeId for invoice' }), { status: 400 });
    }

    // Load current ledger
    const ledgerRef = ref(database, `ledgers/stores/${storeId}/transactions/${invoiceId}`);
    const ledgerSnap = await get(ledgerRef);
    if (!ledgerSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Ledger transaction not found' }), { status: 404 });
    }
    const txn = ledgerSnap.val() as any;
    const status = String(txn.status || 'PENDING').toUpperCase();
    if (status !== 'PENDING') {
      return new Response(JSON.stringify({ error: 'Only PENDING transactions can be replaced' }), { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { newCommissionRate, newCommissionAmount } = body || {};

    const amount: number = Number(txn.amount || 0);
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount in ledger' }), { status: 400 });
    }

    // Compute commission
    let commissionRate: number | null = null;
    if (typeof newCommissionRate === 'number') commissionRate = newCommissionRate;
    const effectiveRate = commissionRate ?? (await getCommissionRate(storeId));
    const commission = typeof newCommissionAmount === 'number' && newCommissionAmount >= 0
      ? roundCurrency(newCommissionAmount)
      : roundCurrency(amount * effectiveRate);
    const storeAmount = roundCurrency(amount - commission);

    // Best effort expire previous invoice (ignore failure if already expired)
    try { await expireInvoice(invoiceId); } catch { /* ignore */ }

    // Build payment methods from existing transaction or default
    const method = String(txn.method || 'online').toLowerCase();
    const paymentMethods = method === 'gcash' ? ['GCASH']
      : method === 'paymaya' ? ['PAYMAYA']
      : ['GCASH', 'PAYMAYA', 'CREDIT_CARD', 'DEBIT_CARD'];

    // Create replacement invoice
    const storeName = txn.storeName || 'Store';
    const customerEmail = txn.payerEmail || 'customer@example.com';
    const data = await createInvoice({
      externalId: orderNumber || txn.orderNumber || invoiceId,
      amount,
      payerEmail: customerEmail,
      description: `Replacement for ${orderNumber || txn.orderNumber || invoiceId} - ${storeName}`,
      customer: {
        given_names: txn.customerName || 'Customer',
        email: customerEmail,
        mobile_number: txn.customerPhone || '',
      },
      items: (txn.items || []).map((i: any) => ({ name: i.name, quantity: i.quantity, price: i.price, category: 'Groceries' })),
      paymentMethods,
      fees: [{ type: 'PLATFORM_FEE', value: commission }],
      metadata: {
        order_number: orderNumber || txn.orderNumber,
        store_id: storeId,
        store_name: storeName,
        commission,
        commission_rate: commissionRate ?? effectiveRate,
        store_amount: storeAmount,
        previous_invoice_id: invoiceId,
      },
    });

    const newInvoiceId = data.id;

    // Update ledger row in-place to point to new invoice id
    await update(ledgerRef, {
      previousInvoiceId: invoiceId,
      invoiceId: newInvoiceId,
      invoiceUrl: data.invoice_url,
      expiryDate: data.expiry_date,
      commission,
      commissionRate: commissionRate ?? effectiveRate,
      storeAmount,
      status: data.status || 'PENDING',
      updatedAt: new Date().toISOString(),
    });

    // Update index: map new invoice -> store, keep old mapping for history
    await set(ref(database, `indexes/invoice_to_store/${newInvoiceId}`), { storeId, orderNumber: orderNumber || txn.orderNumber });

    return new Response(JSON.stringify({
      success: true,
      invoiceId: newInvoiceId,
      invoiceUrl: data.invoice_url,
      expiryDate: data.expiry_date,
      commission,
      storeAmount,
    }), { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
