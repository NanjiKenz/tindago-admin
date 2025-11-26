import { NextRequest } from 'next/server';
import { ref, set, get, update } from 'firebase/database';
import { database } from '@/lib/firebase.js';
import { requireEnv, XENDIT_SECRET_KEY } from '@/lib/config';
import { createInvoice } from '@/lib/xenditService';

export const runtime = 'nodejs';

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface CreatePurchaseOrderInvoiceBody {
  purchaseOrderId: string; // Firebase key for purchase order
  purchaseOrderNumber: string; // e.g., "PO-2025-001"
  total: number;
  method: 'gcash' | 'paymaya';
  store: { id: string; name: string };
  storeOwner: { email: string; name: string; phone?: string };
  supplierName: string;
  items: InvoiceItem[];
}

/**
 * POST /api/payments/purchase-order-invoice
 *
 * Creates a Xendit invoice for Purchase Order payment (GCash/PayMaya)
 * No commission calculation - B2B tracking only
 */
export async function POST(req: NextRequest) {
  try {
    requireEnv('XENDIT_SECRET_KEY', XENDIT_SECRET_KEY);

    const body = (await req.json()) as CreatePurchaseOrderInvoiceBody;
    const { purchaseOrderId, purchaseOrderNumber, total, method, store, storeOwner, supplierName, items } = body;

    // Validation
    if (!purchaseOrderId || !purchaseOrderNumber || !store?.id || !total || total <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 });
    }

    if (method !== 'gcash' && method !== 'paymaya') {
      return new Response(JSON.stringify({ error: 'Invalid payment method. Only gcash or paymaya allowed.' }), { status: 400 });
    }

    // Verify purchase order exists
    const poRef = ref(database, `purchase_orders/${purchaseOrderId}`);
    const poSnapshot = await get(poRef);

    if (!poSnapshot.exists()) {
      return new Response(JSON.stringify({ error: 'Purchase order not found' }), { status: 404 });
    }

    // Determine payment methods
    const paymentMethods = method === 'gcash' ? ['GCASH'] : ['PAYMAYA'];

    // Create invoice using xenditService (NO COMMISSION FEES)
    const data = await createInvoice({
      externalId: purchaseOrderNumber,
      amount: total,
      payerEmail: storeOwner.email,
      description: `TindaGo Purchase Order ${purchaseOrderNumber} for ${store.name}`,
      customer: {
        given_names: storeOwner.name,
        email: storeOwner.email,
        mobile_number: storeOwner.phone || '',
      },
      items: items.map(i => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        category: 'Supplies'
      })),
      paymentMethods,
      fees: [], // ✅ NO COMMISSION for Purchase Orders
      metadata: {
        purchase_order_id: purchaseOrderId,
        purchase_order_number: purchaseOrderNumber,
        store_id: store.id,
        store_name: store.name,
        supplier_name: supplierName,
        store_owner_name: storeOwner.name,
        store_owner_email: storeOwner.email,
        store_owner_phone: storeOwner.phone || '',
      },
    });

    const invoiceId: string = data.id;
    const nowIso = new Date().toISOString();

    // Update purchase order with payment info
    await update(poRef, {
      paymentStatus: 'pending',
      'paymentInfo/invoiceId': invoiceId,
      'paymentInfo/invoiceUrl': data.invoice_url,
      'paymentInfo/expiryDate': data.expiry_date,
      'paymentInfo/createdAt': nowIso,
      updatedAt: nowIso,
    });

    // Create tracking record in purchase_order_payments ledger
    const ledgerRef = ref(database, `ledgers/purchase_orders/${store.id}/transactions/${invoiceId}`);
    await set(ledgerRef, {
      purchaseOrderNumber,
      purchaseOrderId,
      invoiceId,
      amount: total,
      method,
      status: data.status || 'PENDING',
      createdAt: nowIso,
      invoiceUrl: data.invoice_url,
      expiryDate: data.expiry_date,
      storeName: store.name,
      storeId: store.id,
      supplierName,
      storeOwnerName: storeOwner.name,
      storeOwnerEmail: storeOwner.email,
    });

    // Create indexes for easy lookup
    await set(ref(database, `indexes/invoice_to_purchase_order/${invoiceId}`), {
      purchaseOrderId,
      purchaseOrderNumber,
      storeId: store.id,
    });

    return new Response(JSON.stringify({
      success: true,
      invoiceId,
      invoiceUrl: data.invoice_url,
      expiryDate: data.expiry_date,
    }), { status: 200 });

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Server error';
    console.error('[Purchase Order Invoice API] Error creating invoice:', e);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
