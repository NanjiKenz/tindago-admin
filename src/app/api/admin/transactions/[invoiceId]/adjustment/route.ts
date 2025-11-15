import { NextRequest } from 'next/server';
import { ref, get, set } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { roundCurrency } from '@/lib/commission';

export const runtime = 'nodejs';

/**
 * POST /api/admin/transactions/[invoiceId]/adjustment
 * Body: { deltaStoreAmount: number; reason?: string }
 *
 * For PAID/SETTLED transactions: create a separate "adjustment" ledger entry
 * that changes the store's earnings without mutating the original transaction.
 * This entry is marked as SETTLED so wallet reconciliation includes it.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;

  try {
    const body = await req.json().catch(() => ({}));
    const rawDelta = Number(body?.deltaStoreAmount);
    const reason = String(body?.reason || 'Manual adjustment');

    if (!rawDelta || !Number.isFinite(rawDelta)) {
      return new Response(JSON.stringify({ error: 'deltaStoreAmount must be a non-zero number' }), { status: 400 });
    }

    // Find store via index and source transaction info
    const idxSnap = await get(ref(database, `indexes/invoice_to_store/${invoiceId}`));
    if (!idxSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Invoice index not found' }), { status: 404 });
    }
    const { storeId, orderNumber } = idxSnap.val() as { storeId: string; orderNumber?: string };
    if (!storeId) {
      return new Response(JSON.stringify({ error: 'Missing storeId for invoice' }), { status: 400 });
    }

    const sourceTxnSnap = await get(ref(database, `ledgers/stores/${storeId}/transactions/${invoiceId}`));
    if (!sourceTxnSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Source transaction not found' }), { status: 404 });
    }

    const delta = roundCurrency(rawDelta);
    const adjId = `ADJ-${Date.now()}`;
    const nowIso = new Date().toISOString();

    // Create adjustment entry (status: SETTLED so wallet reconciliation includes it)
    await set(ref(database, `ledgers/stores/${storeId}/transactions/${adjId}`), {
      type: 'ADJUSTMENT',
      adjustedFromInvoiceId: invoiceId,
      orderNumber: orderNumber || sourceTxnSnap.val()?.orderNumber || null,
      invoiceId: adjId,
      amount: 0, // informational; only storeAmount affects wallet
      commission: 0,
      commissionRate: null,
      storeAmount: delta,
      method: 'adjustment',
      status: 'SETTLED',
      createdAt: nowIso,
      reason,
    });

    return new Response(JSON.stringify({ success: true, adjustmentId: adjId, storeId, delta }), { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Server error';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
